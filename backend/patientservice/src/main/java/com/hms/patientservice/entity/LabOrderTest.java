package com.hms.patientservice.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * LabOrderTest — each individual test within a LabOrder.
 * A single order can have multiple tests (e.g., CBC + LFT + RFT).
 * Results are stored per test, so the lab technician fills each one separately.
 */
@Entity
@Table(name = "lab_order_tests")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LabOrderTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // ── FK to parent order ────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_order_id", nullable = false)
    private LabOrder labOrder;

    // ── Test metadata (pre-filled from test catalogue) ────────────────────────
    @Column(name = "test_name", nullable = false)
    private String testName;

    @Column(name = "test_code")
    private String testCode;

    // ── Status per test ───────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TestStatus status = TestStatus.PENDING;

    // ── Results (filled by lab technician) ────────────────────────────────────
    @Column(name = "result_value")
    private String resultValue;

    @Column(name = "unit")
    private String unit;

    @Column(name = "reference_range")
    private String referenceRange;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    // ── Enums ─────────────────────────────────────────────────────────────────
    public enum TestStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED
    }
}