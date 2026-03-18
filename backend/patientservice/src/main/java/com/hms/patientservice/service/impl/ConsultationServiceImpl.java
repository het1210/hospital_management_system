package com.hms.patientservice.service.impl;

import com.hms.patientservice.dto.ApiResponse;
import com.hms.patientservice.dto.ConsultationDto;
import com.hms.patientservice.dto.ConsultationRequestDto;
import com.hms.patientservice.dto.PrescriptionDto;
import com.hms.patientservice.entity.*;
import com.hms.patientservice.feignclient.UserFeignClient;
import com.hms.patientservice.repository.*;
import com.hms.patientservice.service.ConsultationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ConsultationServiceImpl — UPDATED to support lab order creation.
 *
 * When a doctor submits a consultation with raiseLabOrder=true:
 *   1. Consultation is saved (existing behaviour)
 *   2. Encounter is CLOSED (existing behaviour)
 *   3. Appointment is COMPLETED (existing behaviour)
 *   4. LabOrder is created with status=ORDERED (NEW)
 *   5. LabOrderTests are saved (NEW)
 *
 * All steps are in a single @Transactional block — roll back everything on failure.
 */
@Service
@Slf4j
public class ConsultationServiceImpl implements ConsultationService {
    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private EncounterRepository encounterRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private EpisodeRepository episodeRepository;

    @Autowired
    private UserFeignClient userFeignClient;
    // ── New lab dependencies ──────────────────────────────────────────────────
    @Autowired private LabOrderRepository      labOrderRepository;
    @Autowired private LabOrderTestRepository  labOrderTestRepository;

    // ══════════════════════════════════════════════════════════════════════════
    // CREATE CONSULTATION (+ optional lab order)
    // ══════════════════════════════════════════════════════════════════════════
    @Transactional(rollbackFor = Exception.class)
    @Override
    public Integer createConsultation(ConsultationRequestDto dto) {
        // ── 1. Validate encounter ─────────────────────────────────────────────
        Encounter encounter = encounterRepository.findById(dto.getEncounter())
                .orElseThrow(() -> new RuntimeException("Encounter not found: " + dto.getEncounter()));

        // ── 2. Save consultation ──────────────────────────────────────────────
        Consultation consultation = new Consultation();
        consultation.setEncounter(encounter);
        consultation.setPatientId(dto.getPatient());
        consultation.setDoctorId(dto.getDoctor());
        consultation.setSymptoms(dto.getSymptoms());
        consultation.setDiagnosis(dto.getDiagnosis());
        consultation.setNotes(dto.getNotes());
        Consultation saved = consultationRepository.save(consultation);

        // ── 3. Close episode (if requested) ──────────────────────────────────
        if (dto.isCloseEpisode()) {
            Episode episode = encounter.getEpisode();
            episode.setStatus(Episode.EpisodeStatus.CLOSED);
            episode.setEndDate(LocalDateTime.now());
            episode.setUpdatedAt(LocalDateTime.now());
            episode.setUpdatedBy(dto.getDoctor());
            episodeRepository.save(episode);
        }

        // ── 4. Close encounter + complete appointment ─────────────────────────
        if (saved.getId() != null) {
            encounter.setEndTime(LocalDateTime.now());
            encounterRepository.save(encounter);

            Appointment appt = appointmentRepository
                    .findById(encounter.getAppointmentId())
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));
            appt.setStatus(Appointment.AppointmentStatus.COMPLETED);
            appointmentRepository.save(appt);

            // ── 5. Save prescriptions ─────────────────────────────────────────
            if (dto.getPrescriptions() != null && !dto.getPrescriptions().isEmpty()) {
                List<Prescription> prescriptions = dto.getPrescriptions().stream()
                        .map(p -> Prescription.builder()
                                .consultation(saved)
                                .medicineName(p.getMedicineName())
                                .dosage(p.getDosage())
                                .frequency(p.getFrequency())
                                .duration(p.getDuration())
                                .build())
                        .collect(Collectors.toList());
                prescriptionRepository.saveAll(prescriptions);
            }

            // ── 6. Create Lab Order (NEW) ─────────────────────────────────────
            if (dto.isRaiseLabOrder() && dto.getLabTests() != null && !dto.getLabTests().isEmpty()) {
                log.info("Raising lab order for consultation {}, tests={}", saved.getId(), dto.getLabTests().size());

                LabOrder labOrder = LabOrder.builder()
                        .patientId(dto.getPatient())
                        .episodeId(encounter.getEpisode() != null ? encounter.getEpisode().getId() : null)
                        .appointmentId(encounter.getAppointmentId())
                        .encounterId(encounter.getId())
                        .doctorId(dto.getDoctor())
                        .hospitalId(dto.getHospitalId())
                        .priority(dto.getLabPriority() != null
                                ? LabOrder.Priority.valueOf(dto.getLabPriority())
                                : LabOrder.Priority.NORMAL)
                        .notes(dto.getLabNotes())
                        .status(LabOrder.LabOrderStatus.ORDERED)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .createdBy(dto.getDoctor())
                        .updatedBy(dto.getDoctor())
                        .build();

                LabOrder savedOrder = labOrderRepository.save(labOrder);

                List<LabOrderTest> tests = dto.getLabTests().stream()
                        .map(t -> LabOrderTest.builder()
                                .labOrder(savedOrder)
                                .testName(t.getTestName())
                                .testCode(t.getTestCode())
                                .status(LabOrderTest.TestStatus.PENDING)
                                .build())
                        .collect(Collectors.toList());
                labOrderTestRepository.saveAll(tests);

                log.info("Lab order {} created with {} tests", savedOrder.getId(), tests.size());
            }
        }

        return saved.getId();
    }
    /*
    This method contains N+1 query which slow down the method
     */
//    @Override
//    public Page<ConsultationDto> getConsultationByPatient(Pageable pageable, Long adhaarNumber) {
//        Patient patient = patientRepository.findByAdhaarNumber(adhaarNumber);
//
//        if(patient == null){
//            throw new RuntimeException("Patien not found with Adhaar Number " + adhaarNumber);
//        }
//        Page<Consultation> consultationPage = consultationRepository.findByPatientId(patient.getId(),pageable);
//
//
//
//        return consultationPage.map(consultation -> ConsultationDto.builder()
//                .id(consultation.getId())
//                .encounter(consultation.getEncounter().getId())
//                .symptoms(consultation.getSymptoms())
//                .patient(consultation.getPatientId())
//                .patientName(patient.getFirstName() + " " + patient.getLastName())
//                .doctor(consultation.getDoctorId())
//                .diagnosis(consultation.getDiagnosis())
//                .prescription(consultation.getPrescriptions().stream().map(
//                        prescription -> PrescriptionDto.builder()
//                                .id(prescription.getId())
//                                .consultationId(consultation.getId())
//                                .medicineName(prescription.getMedicineName())
//                                .dosage(prescription.getDosage())
//                                .frequency(prescription.getFrequency())
//                                .duration(prescription.getDuration())
//                                .build()
//                ).toList())
//                .notes(consultation.getNotes())
//                .build());
//    }

    @Override
    public Page<ConsultationDto> getConsultationByPatient(Pageable pageable, Long adhaarNumber, HttpServletRequest request) {
        Patient patient = patientRepository.findByAdhaarNumber(adhaarNumber);
        Integer doctorId = Integer.parseInt(request.getHeader("X-User-Id"));
        String role = request.getHeader("x-User-Roles");
        List<String> roles = Arrays.stream(role.split(",")).map(String::trim).toList();
        Map<Integer, String> consultationDoc = new HashMap<>();

        if (patient == null) throw new RuntimeException("Patient not found with Adhaar Number " + adhaarNumber);

        Page<Consultation> consultationPage;

        if (roles.contains("ROLE_DOCTOR")) {
            consultationPage = consultationRepository.findByPatientIdAndDoctorId(patient.getId(), doctorId, pageable);
            try {
                ApiResponse response = userFeignClient.getUserById(doctorId);
                if (response != null && response.getData() != null) {
                    Map<String, Object> userData = (Map<String, Object>) response.getData();
                    consultationDoc.put((Integer) userData.get("userId"),
                            userData.get("firstName") + " " + userData.get("lastName"));
                }
            } catch (Exception e) { log.error("Error fetching doctor name: {}", e.getMessage()); }
        } else {
            consultationPage = consultationRepository.findByPatientId(patient.getId(), pageable);
            List<Integer> doctorIds = consultationPage.getContent().stream()
                    .map(Consultation::getDoctorId).distinct().toList();
            try {
                ApiResponse response = userFeignClient.getUserByIds(doctorIds);
                if (response != null && response.getData() != null) {
                    List<Map<String, Object>> users = (List<Map<String, Object>>) response.getData();
                    users.forEach(u -> consultationDoc.put(
                            (Integer) u.get("userId"),
                            u.get("firstName") + " " + u.get("lastName")));
                }
            } catch (Exception e) { log.error("Error fetching doctor names: {}", e.getMessage()); }
        }

        Map<Integer, List<Prescription>> prescriptionMap = new HashMap<>();
        List<Integer> consultationIds = consultationPage.getContent().stream()
                .map(Consultation::getId).toList();
        prescriptionRepository.findAllByConsultationIdIn(consultationIds)
                .forEach(p -> prescriptionMap
                        .computeIfAbsent(p.getConsultation().getId(), k -> new ArrayList<>()).add(p));

        return consultationPage.map(c -> ConsultationDto.builder()
                .id(c.getId())
                .encounter(c.getEncounter() != null ? c.getEncounter().getId() : null)
                .patient(c.getPatientId())
                .patientName(patient.getFirstName() + " " + patient.getLastName())
                .doctor(c.getDoctorId())
                .doctorName(consultationDoc.getOrDefault(c.getDoctorId(), "Unknown"))
                .symptoms(c.getSymptoms())
                .diagnosis(c.getDiagnosis())
                .notes(c.getNotes())
                .prescriptions(prescriptionMap.getOrDefault(c.getId(), List.of()).stream()
                        .map(p -> PrescriptionDto.builder()
                                .id(p.getId())
                                .consultationId(c.getId())
                                .medicineName(p.getMedicineName())
                                .dosage(p.getDosage())
                                .frequency(p.getFrequency())
                                .duration(p.getDuration())
                                .build())
                        .collect(Collectors.toList()))
                .build());
    }
}
