package com.hms.patientservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * LabOrder — created when a doctor raises a lab order during consultation.
 * Status flow: ORDERED → BOOKED → SAMPLE_COLLECTED → IN_PROGRESS → COMPLETED
 *              Can be CANCELLED at any point.
 */
@Entity
@Table(name = "lab_orders")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LabOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // ── Clinical References ──────────────────────────────────────────────────
    @Column(name = "patient_id", nullable = false)
    private Integer patientId;

    @Column(name = "episode_id")
    private Integer episodeId;

    @Column(name = "appointment_id")
    private Integer appointmentId;

    @Column(name = "encounter_id")
    private Integer encounterId;

    @Column(name = "doctor_id", nullable = false)
    private Integer doctorId;

    @Column(name = "hospital_id", nullable = false)
    private Integer hospitalId;

    // ── Booking References (set when frontdesk books a lab appointment) ──────
    @Column(name = "lab_appointment_id")
    private Integer labAppointmentId;

    // ── Status & Priority ─────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LabOrderStatus status = LabOrderStatus.ORDERED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Priority priority = Priority.NORMAL;

    // ── Details ───────────────────────────────────────────────────────────────
    @Column(columnDefinition = "TEXT")
    private String notes;

    // ── Audit ─────────────────────────────────────────────────────────────────
    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "updated_by")
    private Integer updatedBy;

    // ── Relationships ─────────────────────────────────────────────────────────
    @OneToMany(mappedBy = "labOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LabOrderTest> tests;

    @OneToOne(mappedBy = "labOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Sample sample;

    @OneToOne(mappedBy = "labOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private LabReport report;

    // ── Enums ─────────────────────────────────────────────────────────────────
    public enum LabOrderStatus {
        ORDERED,
        BOOKED,
        SAMPLE_COLLECTED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }

    public enum Priority {
        NORMAL,
        URGENT
    }
}