package com.hms.patientservice.service.impl;

import com.hms.patientservice.dto.*;
import com.hms.patientservice.entity.*;
import com.hms.patientservice.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * LabOrderService — core business logic for the lab management module.
 *
 * Status transition rules enforced here:
 *   ORDERED → BOOKED            (frontdesk: bookLabAppointment)
 *   BOOKED  → SAMPLE_COLLECTED  (lab tech: collectSample)
 *   SAMPLE_COLLECTED → IN_PROGRESS (lab tech: startProcessing)
 *   IN_PROGRESS → COMPLETED     (lab tech: generateReport — only when ALL tests done)
 *   Any state → CANCELLED       (authorised roles)
 */
@Service
@Slf4j
public class LabOrderServiceImpl {

    @Autowired private LabOrderRepository     labOrderRepository;
    @Autowired private LabOrderTestRepository labOrderTestRepository;
    @Autowired private SampleRepository       sampleRepository;
    @Autowired private LabReportRepository    labReportRepository;
    @Autowired private PatientRepository      patientRepository;
    @Autowired private AppointmentRepository  appointmentRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    // ══════════════════════════════════════════════════════════════════════════
    // 1. DOCTOR — Create Lab Order
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Called from ConsultationServiceImpl after consultation is saved.
     * Creates LabOrder + LabOrderTests in a single transaction.
     */
    @Transactional(rollbackFor = Exception.class)
    public Integer createLabOrder(LabOrderRequestDto dto, HttpServletRequest request) {
        log.info("Creating lab order for patient {} by doctor {}", dto.getPatientId(), dto.getDoctorId());

        if (dto.getTests() == null || dto.getTests().isEmpty()) {
            throw new RuntimeException("At least one test must be selected");
        }

        LabOrder order = LabOrder.builder()
                .patientId(dto.getPatientId())
                .episodeId(dto.getEpisodeId())
                .appointmentId(dto.getAppointmentId())
                .encounterId(dto.getEncounterId())
                .doctorId(dto.getDoctorId())
                .hospitalId(dto.getHospitalId())
                .priority(LabOrder.Priority.valueOf(dto.getPriority() != null ? dto.getPriority() : "NORMAL"))
                .notes(dto.getNotes())
                .status(LabOrder.LabOrderStatus.ORDERED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .createdBy(Integer.parseInt(request.getHeader("X-User-Id")))
                .updatedBy(Integer.parseInt(request.getHeader("X-User-Id")))
                .build();

        LabOrder saved = labOrderRepository.save(order);

        // Create each test entry
        List<LabOrderTest> tests = dto.getTests().stream()
                .map(t -> LabOrderTest.builder()
                        .labOrder(saved)
                        .testName(t.getTestName())
                        .testCode(t.getTestCode())
                        .status(LabOrderTest.TestStatus.PENDING)
                        .build())
                .collect(Collectors.toList());

        labOrderTestRepository.saveAll(tests);
        log.info("Lab order created with id={}, tests={}", saved.getId(), tests.size());
        return saved.getId();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 2. FRONTDESK — Get All Lab Orders (paginated)
    // ══════════════════════════════════════════════════════════════════════════

    public Page<LabOrderDto> getLabOrders(Integer hospitalId, String status, Pageable pageable) {
        Page<LabOrder> page;
        if (status != null && !status.isBlank()) {
            page = labOrderRepository.findByHospitalIdAndStatusOrderByCreatedAtDesc(
                    hospitalId, LabOrder.LabOrderStatus.valueOf(status), pageable);
        } else {
            page = labOrderRepository.findByHospitalIdOrderByCreatedAtDesc(hospitalId, pageable);
        }
        return page.map(this::mapToDto);
    }

    public LabOrderDto getLabOrderById(Integer id) {
        LabOrder order = findOrThrow(id);
        return mapToDto(order);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 3. FRONTDESK — Book Lab Appointment
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(rollbackFor = Exception.class)
    public LabOrderDto bookLabAppointment(Integer labOrderId,
                                          BookLabAppointmentRequestDto dto,
                                          HttpServletRequest request) {
        LabOrder order = findOrThrow(labOrderId);

        // Validation: can only book if status is ORDERED
        if (order.getStatus() != LabOrder.LabOrderStatus.ORDERED) {
            throw new RuntimeException(
                    "Lab order cannot be booked. Current status: " + order.getStatus());
        }

        // Create a new Appointment of type LAB in appointments table
        Appointment labAppt = Appointment.builder()
                .hospitalId(order.getHospitalId())
                .patientId(order.getPatientId())
                .doctorId(dto.getLabTechnicianId() != null ? dto.getLabTechnicianId() : order.getDoctorId())
                .status(Appointment.AppointmentStatus.BOOKED)
                .appointmentStart(LocalDateTime.parse(dto.getAppointmentStart()))
                .appointmentEnd(LocalDateTime.parse(dto.getAppointmentEnd()))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .createdBy(Integer.parseInt(request.getHeader("X-User-Id")))
                .updatedBy(Integer.parseInt(request.getHeader("X-User-Id")))
                .build();

        Appointment savedAppt = appointmentRepository.save(labAppt);

        // Update lab order
        order.setLabAppointmentId(savedAppt.getId());
        order.setStatus(LabOrder.LabOrderStatus.BOOKED);
        order.setUpdatedAt(LocalDateTime.now());
        order.setUpdatedBy(Integer.parseInt(request.getHeader("X-User-Id")));
        labOrderRepository.save(order);

        log.info("Lab order {} booked. Lab appointment id={}", labOrderId, savedAppt.getId());
        return mapToDto(order);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 4. LAB TECH — Collect Sample
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(rollbackFor = Exception.class)
    public LabOrderDto collectSample(Integer labOrderId,
                                     SampleCollectionRequestDto dto,
                                     HttpServletRequest request) {
        LabOrder order = findOrThrow(labOrderId);

        // Validation: must be BOOKED before collecting sample
        if (order.getStatus() != LabOrder.LabOrderStatus.BOOKED) {
            throw new RuntimeException(
                    "Sample cannot be collected. Order must be BOOKED. Current status: " + order.getStatus());
        }

        Integer techId = Integer.parseInt(request.getHeader("X-User-Id"));

        // Generate a simple barcode (lab order id + timestamp)
        String barcode = "LAB-" + labOrderId + "-" + System.currentTimeMillis();

        Sample sample = Sample.builder()
                .labOrder(order)
                .sampleType(dto.getSampleType())
                .sampleNotes(dto.getSampleNotes())
                .barcode(barcode)
                .collectedBy(techId)
                .collectedAt(LocalDateTime.now())
                .status(Sample.SampleStatus.COLLECTED)
                .build();

        sampleRepository.save(sample);

        order.setStatus(LabOrder.LabOrderStatus.SAMPLE_COLLECTED);
        order.setUpdatedAt(LocalDateTime.now());
        order.setUpdatedBy(techId);
        labOrderRepository.save(order);

        log.info("Sample collected for lab order {}. Barcode: {}", labOrderId, barcode);
        return mapToDto(order);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 5. LAB TECH — Start Processing
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(rollbackFor = Exception.class)
    public LabOrderDto startProcessing(Integer labOrderId, HttpServletRequest request) {
        LabOrder order = findOrThrow(labOrderId);

        // Validation: sample must be collected first
        if (order.getStatus() != LabOrder.LabOrderStatus.SAMPLE_COLLECTED) {
            throw new RuntimeException(
                    "Cannot start processing. Sample must be collected first. Current status: " + order.getStatus());
        }

        Integer techId = Integer.parseInt(request.getHeader("X-User-Id"));

        // Mark all tests as IN_PROGRESS
        List<LabOrderTest> tests = labOrderTestRepository.findByLabOrderId(labOrderId);
        tests.forEach(t -> t.setStatus(LabOrderTest.TestStatus.IN_PROGRESS));
        labOrderTestRepository.saveAll(tests);

        order.setStatus(LabOrder.LabOrderStatus.IN_PROGRESS);
        order.setUpdatedAt(LocalDateTime.now());
        order.setUpdatedBy(techId);
        labOrderRepository.save(order);

        log.info("Lab order {} moved to IN_PROGRESS", labOrderId);
        return mapToDto(order);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 6. LAB TECH — Enter Results
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(rollbackFor = Exception.class)
    public LabOrderDto enterResults(Integer labOrderId,
                                    LabResultsRequestDto dto,
                                    HttpServletRequest request) {
        LabOrder order = findOrThrow(labOrderId);

        // Validation: must be IN_PROGRESS
        if (order.getStatus() != LabOrder.LabOrderStatus.IN_PROGRESS) {
            throw new RuntimeException(
                    "Cannot enter results. Order must be IN_PROGRESS. Current status: " + order.getStatus());
        }

        Integer techId = Integer.parseInt(request.getHeader("X-User-Id"));

        // Update each test's result
        for (TestResultRequestDto result : dto.getResults()) {
            LabOrderTest test = labOrderTestRepository.findById(result.getTestId())
                    .orElseThrow(() -> new RuntimeException("Test not found: " + result.getTestId()));

            // Ensure this test belongs to this order
            if (!test.getLabOrder().getId().equals(labOrderId)) {
                throw new RuntimeException("Test " + result.getTestId() + " does not belong to order " + labOrderId);
            }

            test.setResultValue(result.getResultValue());
            test.setUnit(result.getUnit());
            test.setReferenceRange(result.getReferenceRange());
            test.setRemarks(result.getRemarks());
            test.setStatus(LabOrderTest.TestStatus.COMPLETED);
            labOrderTestRepository.save(test);
        }

        order.setUpdatedAt(LocalDateTime.now());
        order.setUpdatedBy(techId);
        labOrderRepository.save(order);

        log.info("Results entered for lab order {}", labOrderId);
        return mapToDto(order);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 7. LAB TECH — Generate Report
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(rollbackFor = Exception.class)
    public LabOrderDto generateReport(Integer labOrderId,
                                      GenerateReportRequestDto dto,
                                      HttpServletRequest request) {
        LabOrder order = findOrThrow(labOrderId);

        // Validation: must be IN_PROGRESS
        if (order.getStatus() != LabOrder.LabOrderStatus.IN_PROGRESS) {
            throw new RuntimeException(
                    "Cannot generate report. Order must be IN_PROGRESS. Current status: " + order.getStatus());
        }

        // Validation: ALL tests must be COMPLETED
        Integer pendingCount = labOrderTestRepository.countPendingTests(labOrderId);
        if (pendingCount > 0) {
            throw new RuntimeException(
                    "Cannot generate report. " + pendingCount + " test(s) still pending results.");
        }

        Integer techId = Integer.parseInt(request.getHeader("X-User-Id"));

        // Build report JSON from all test results
        List<LabOrderTest> tests = labOrderTestRepository.findByLabOrderId(labOrderId);
        String reportJson = buildReportJson(order, tests);

        LabReport report = LabReport.builder()
                .labOrder(order)
                .reportData(reportJson)
                .summary(dto.getSummary())
                .status(LabReport.ReportStatus.FINAL)
                .generatedBy(techId)
                .generatedAt(LocalDateTime.now())
                .finalizedAt(LocalDateTime.now())
                .build();

        labReportRepository.save(report);

        // Complete the lab order
        order.setStatus(LabOrder.LabOrderStatus.COMPLETED);
        order.setUpdatedAt(LocalDateTime.now());
        order.setUpdatedBy(techId);
        labOrderRepository.save(order);

        // Also mark the lab appointment as COMPLETED (if it exists)
        if (order.getLabAppointmentId() != null) {
            appointmentRepository.findById(order.getLabAppointmentId()).ifPresent(appt -> {
                appt.setStatus(Appointment.AppointmentStatus.COMPLETED);
                appointmentRepository.save(appt);
            });
        }

        log.info("Report generated and lab order {} COMPLETED", labOrderId);
        return mapToDto(order);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 8. Cancel Lab Order
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(rollbackFor = Exception.class)
    public LabOrderDto cancelLabOrder(Integer labOrderId, HttpServletRequest request) {
        LabOrder order = findOrThrow(labOrderId);

        if (order.getStatus() == LabOrder.LabOrderStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed lab order.");
        }

        Integer userId = Integer.parseInt(request.getHeader("X-User-Id"));
        order.setStatus(LabOrder.LabOrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        order.setUpdatedBy(userId);
        labOrderRepository.save(order);

        log.info("Lab order {} CANCELLED by user {}", labOrderId, userId);
        return mapToDto(order);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    private LabOrder findOrThrow(Integer id) {
        return labOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab order not found with id: " + id));
    }

    /**
     * Builds a simple JSON string from test results.
     * In production you would use ObjectMapper or a templating engine.
     */
    private String buildReportJson(LabOrder order, List<LabOrderTest> tests) {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"orderId\":").append(order.getId()).append(",");
        sb.append("\"patientId\":").append(order.getPatientId()).append(",");
        sb.append("\"generatedAt\":\"").append(LocalDateTime.now().format(FMT)).append("\",");
        sb.append("\"tests\":[");
        for (int i = 0; i < tests.size(); i++) {
            LabOrderTest t = tests.get(i);
            sb.append("{");
            sb.append("\"testName\":\"").append(t.getTestName()).append("\",");
            sb.append("\"testCode\":\"").append(t.getTestCode() != null ? t.getTestCode() : "").append("\",");
            sb.append("\"resultValue\":\"").append(t.getResultValue() != null ? t.getResultValue() : "").append("\",");
            sb.append("\"unit\":\"").append(t.getUnit() != null ? t.getUnit() : "").append("\",");
            sb.append("\"referenceRange\":\"").append(t.getReferenceRange() != null ? t.getReferenceRange() : "").append("\",");
            sb.append("\"remarks\":\"").append(t.getRemarks() != null ? t.getRemarks() : "").append("\"");
            sb.append("}");
            if (i < tests.size() - 1) sb.append(",");
        }
        sb.append("]}");
        return sb.toString();
    }

    /**
     * Maps LabOrder entity → LabOrderDto for API responses.
     * Fetches patient name from patient repository (in-service join).
     */
    private LabOrderDto mapToDto(LabOrder order) {
        LabOrderDto dto = LabOrderDto.builder()
                .id(order.getId())
                .patientId(order.getPatientId())
                .episodeId(order.getEpisodeId())
                .appointmentId(order.getAppointmentId())
                .encounterId(order.getEncounterId())
                .doctorId(order.getDoctorId())
                .hospitalId(order.getHospitalId())
                .labAppointmentId(order.getLabAppointmentId())
                .status(order.getStatus().name())
                .priority(order.getPriority().name())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt() != null ? order.getCreatedAt().format(FMT) : null)
                .updatedAt(order.getUpdatedAt() != null ? order.getUpdatedAt().format(FMT) : null)
                .build();

        // Resolve patient name
        try {
            patientRepository.findById(order.getPatientId()).ifPresent(p ->
                    dto.setPatientName(p.getFirstName() + " " + p.getLastName()));
        } catch (Exception e) {
            log.warn("Could not resolve patient name for id={}", order.getPatientId());
        }

        // Map tests
        List<LabOrderTest> tests = labOrderTestRepository.findByLabOrderId(order.getId());
        dto.setTests(tests.stream().map(t -> LabOrderTestDto.builder()
                .id(t.getId())
                .testName(t.getTestName())
                .testCode(t.getTestCode())
                .status(t.getStatus().name())
                .resultValue(t.getResultValue())
                .unit(t.getUnit())
                .referenceRange(t.getReferenceRange())
                .remarks(t.getRemarks())
                .build()).collect(Collectors.toList()));

        // Map sample
        sampleRepository.findByLabOrderId(order.getId()).ifPresent(s ->
                dto.setSample(SampleDto.builder()
                        .id(s.getId())
                        .labOrderId(order.getId())
                        .sampleType(s.getSampleType())
                        .sampleNotes(s.getSampleNotes())
                        .barcode(s.getBarcode())
                        .collectedBy(s.getCollectedBy())
                        .collectedAt(s.getCollectedAt() != null ? s.getCollectedAt().format(FMT) : null)
                        .status(s.getStatus().name())
                        .build()));

        // Map report
        labReportRepository.findByLabOrderId(order.getId()).ifPresent(r ->
                dto.setReport(LabReportDto.builder()
                        .id(r.getId())
                        .labOrderId(order.getId())
                        .reportData(r.getReportData())
                        .reportUrl(r.getReportUrl())
                        .summary(r.getSummary())
                        .status(r.getStatus().name())
                        .generatedBy(r.getGeneratedBy())
                        .generatedAt(r.getGeneratedAt() != null ? r.getGeneratedAt().format(FMT) : null)
                        .finalizedAt(r.getFinalizedAt() != null ? r.getFinalizedAt().format(FMT) : null)
                        .build()));

        return dto;
    }
}