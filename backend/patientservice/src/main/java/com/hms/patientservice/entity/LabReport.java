package com.hms.patientservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * LabReport — generated after all tests are completed.
 * A FINAL report means the lab order is COMPLETED.
 */
@Entity
@Table(name = "lab_reports")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LabReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // ── FK to Lab Order ───────────────────────────────────────────────────────
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_order_id", nullable = false, unique = true)
    private LabOrder labOrder;

    // ── Report Content ────────────────────────────────────────────────────────
    /**
     * reportData — JSON string of all test results, or URL if stored externally.
     * Stored as TEXT since it may be large.
     */
    @Column(name = "report_data", columnDefinition = "TEXT")
    private String reportData;

    @Column(name = "report_url")
    private String reportUrl;         // optional external storage URL

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;           // radiologist/technician notes

    // ── Report Lifecycle ──────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReportStatus status = ReportStatus.DRAFT;

    @Column(name = "generated_by", nullable = false)
    private Integer generatedBy;      // userId of lab technician

    @Column(name = "generated_at")
    @Builder.Default
    private LocalDateTime generatedAt = LocalDateTime.now();

    @Column(name = "finalized_at")
    private LocalDateTime finalizedAt;

    public enum ReportStatus {
        DRAFT,
        FINAL
    }
}