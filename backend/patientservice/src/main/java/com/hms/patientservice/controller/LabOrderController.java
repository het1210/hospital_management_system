package com.hms.patientservice.controller;

import com.hms.patientservice.dto.*;
import com.hms.patientservice.service.impl.LabOrderServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * LabOrderController — all lab management REST endpoints.
 *
 * Base path: /api/lab-orders
 * Routes through API Gateway: /api/lab-orders/** → patient-service
 *
 * Status flow enforced in service:
 *   ORDERED → BOOKED → SAMPLE_COLLECTED → IN_PROGRESS → COMPLETED
 */
@RestController
@RequestMapping("/api/lab-orders")
@Slf4j
public class LabOrderController {

    @Autowired
    private LabOrderServiceImpl labOrderService;

    // ══════════════════════════════════════════════════════════════════════════
    // DOCTOR ENDPOINTS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * POST /api/lab-orders
     * Doctor raises a lab order. Called inside (or alongside) consultation submit.
     * Body: { patientId, episodeId, appointmentId, encounterId, priority, notes, tests: [...] }
     */
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<?>> createLabOrder(
            @RequestBody LabOrderRequestDto dto,
            HttpServletRequest request) {
        try {
            log.info("Doctor creating lab order for patient {}", dto.getPatientId());
            Integer id = labOrderService.createLabOrder(dto, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Lab order created successfully", id));
        } catch (RuntimeException e) {
            log.error("Error creating lab order: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // FRONTDESK ENDPOINTS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * GET /api/lab-orders?status=ORDERED&page=0&size=10
     * Frontdesk / hospital admin views all lab orders for their hospital.
     * Optional ?status= filter (ORDERED, BOOKED, SAMPLE_COLLECTED, IN_PROGRESS, COMPLETED, CANCELLED)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('FRONTDESK', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> getLabOrders(
            @RequestParam(required = false) String status,
            Pageable pageable,
            HttpServletRequest request) {
        try {
            String hospitalIdHeader = request.getHeader("X-Hospital-Id");
            Integer hospitalId = (hospitalIdHeader != null) ? Integer.parseInt(hospitalIdHeader) : null;
            log.info("Fetching lab orders for hospital {} with status {}", hospitalId, status);
            Page<LabOrderDto> orders = labOrderService.getLabOrders(hospitalId, status, pageable);
            return ResponseEntity.ok(ApiResponse.success("Lab orders fetched successfully", orders));
        } catch (RuntimeException e) {
            log.error("Error fetching lab orders: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * GET /api/lab-orders/{id}
     * Get a single lab order with all its tests, sample, and report.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FRONTDESK', 'HOSPITAL_ADMIN', 'DOCTOR', 'LAB_TECHNICIAN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> getLabOrderById(@PathVariable Integer id) {
        try {
            log.info("Fetching lab order {}", id);
            LabOrderDto order = labOrderService.getLabOrderById(id);
            return ResponseEntity.ok(ApiResponse.success("Lab order fetched", order));
        } catch (RuntimeException e) {
            log.error("Error fetching lab order {}: {}", id, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * POST /api/lab-orders/{id}/book
     * Frontdesk books a lab appointment for a lab order that is currently ORDERED.
     * Body: { appointmentStart, appointmentEnd, labTechnicianId? }
     * Effect: creates Appointment (type LAB) + sets LabOrder.status = BOOKED
     */
    @PostMapping("/{id}/book")
    @PreAuthorize("hasAnyRole('FRONTDESK', 'HOSPITAL_ADMIN')")
    public ResponseEntity<ApiResponse<?>> bookLabAppointment(
            @PathVariable Integer id,
            @RequestBody BookLabAppointmentRequestDto dto,
            HttpServletRequest request) {
        try {
            log.info("Booking lab appointment for order {}", id);
            LabOrderDto order = labOrderService.bookLabAppointment(id, dto, request);
            return ResponseEntity.ok(ApiResponse.success("Lab appointment booked successfully", order));
        } catch (RuntimeException e) {
            log.error("Error booking lab appointment for order {}: {}", id, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * DELETE /api/lab-orders/{id}  (cancel)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FRONTDESK', 'HOSPITAL_ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<?>> cancelLabOrder(
            @PathVariable Integer id,
            HttpServletRequest request) {
        try {
            log.info("Cancelling lab order {}", id);
            LabOrderDto order = labOrderService.cancelLabOrder(id, request);
            return ResponseEntity.ok(ApiResponse.success("Lab order cancelled", order));
        } catch (RuntimeException e) {
            log.error("Error cancelling lab order {}: {}", id, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // LAB TECHNICIAN ENDPOINTS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * POST /api/lab-orders/{id}/collect-sample
     * Lab technician collects the sample. Order must be BOOKED.
     * Body: { sampleType, sampleNotes }
     * Effect: creates Sample record + sets LabOrder.status = SAMPLE_COLLECTED
     */
    @PostMapping("/{id}/collect-sample")
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public ResponseEntity<ApiResponse<?>> collectSample(
            @PathVariable Integer id,
            @RequestBody SampleCollectionRequestDto dto,
            HttpServletRequest request) {
        try {
            log.info("Collecting sample for lab order {}", id);
            LabOrderDto order = labOrderService.collectSample(id, dto, request);
            return ResponseEntity.ok(ApiResponse.success("Sample collected successfully", order));
        } catch (RuntimeException e) {
            log.error("Error collecting sample for order {}: {}", id, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * POST /api/lab-orders/{id}/start-processing
     * Lab technician starts processing the samples. Order must be SAMPLE_COLLECTED.
     * Effect: sets all LabOrderTests.status = IN_PROGRESS + LabOrder.status = IN_PROGRESS
     */
    @PostMapping("/{id}/start-processing")
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public ResponseEntity<ApiResponse<?>> startProcessing(
            @PathVariable Integer id,
            HttpServletRequest request) {
        try {
            log.info("Starting processing for lab order {}", id);
            LabOrderDto order = labOrderService.startProcessing(id, request);
            return ResponseEntity.ok(ApiResponse.success("Processing started", order));
        } catch (RuntimeException e) {
            log.error("Error starting processing for order {}: {}", id, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * POST /api/lab-orders/{id}/results
     * Lab technician enters results for each test. Order must be IN_PROGRESS.
     * Body: { results: [{ testId, resultValue, unit, referenceRange, remarks }] }
     * Effect: updates each LabOrderTest with result data + status = COMPLETED
     */
    @PostMapping("/{id}/results")
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public ResponseEntity<ApiResponse<?>> enterResults(
            @PathVariable Integer id,
            @RequestBody LabResultsRequestDto dto,
            HttpServletRequest request) {
        try {
            log.info("Entering results for lab order {}", id);
            LabOrderDto order = labOrderService.enterResults(id, dto, request);
            return ResponseEntity.ok(ApiResponse.success("Results saved successfully", order));
        } catch (RuntimeException e) {
            log.error("Error entering results for order {}: {}", id, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * POST /api/lab-orders/{id}/generate-report
     * Lab technician finalizes the report. All tests must be COMPLETED.
     * Body: { summary }
     * Effect: creates LabReport (FINAL) + LabOrder.status = COMPLETED
     */
    @PostMapping("/{id}/generate-report")
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public ResponseEntity<ApiResponse<?>> generateReport(
            @PathVariable Integer id,
            @RequestBody GenerateReportRequestDto dto,
            HttpServletRequest request) {
        try {
            log.info("Generating report for lab order {}", id);
            LabOrderDto order = labOrderService.generateReport(id, dto, request);
            return ResponseEntity.ok(ApiResponse.success("Report generated and order completed", order));
        } catch (RuntimeException e) {
            log.error("Error generating report for order {}: {}", id, e.getMessage());
            throw new RuntimeException(e);
        }
    }
}