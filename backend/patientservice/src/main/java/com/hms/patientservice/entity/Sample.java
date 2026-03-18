package com.hms.patientservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Sample — represents the physical sample collected from the patient.
 * Created when lab technician clicks "Collect Sample" (status = BOOKED).
 */
@Entity
@Table(name = "lab_samples")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Sample {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // ── FK to Lab Order ───────────────────────────────────────────────────────
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_order_id", nullable = false, unique = true)
    private LabOrder labOrder;

    // ── Sample Details ────────────────────────────────────────────────────────
    @Column(name = "sample_type", nullable = false)
    private String sampleType;       // e.g., Blood, Urine, Stool, Swab

    @Column(name = "sample_notes", columnDefinition = "TEXT")
    private String sampleNotes;

    @Column(name = "barcode")
    private String barcode;          // auto-generated barcode for sample tracking

    // ── Collection Info ───────────────────────────────────────────────────────
    @Column(name = "collected_by", nullable = false)
    private Integer collectedBy;     // userId of lab technician

    @Column(name = "collected_at", nullable = false)
    @Builder.Default
    private LocalDateTime collectedAt = LocalDateTime.now();

    // ── Status ────────────────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SampleStatus status = SampleStatus.COLLECTED;

    public enum SampleStatus {
        COLLECTED,
        PROCESSING,
        USED
    }
}