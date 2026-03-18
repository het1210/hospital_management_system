package com.hms.patientservice.repository;

import com.hms.patientservice.entity.LabOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabOrderRepository extends JpaRepository<LabOrder, Integer> {

    // ── Frontdesk: all orders for a hospital, paginated ──────────────────────
    Page<LabOrder> findByHospitalIdOrderByCreatedAtDesc(Integer hospitalId, Pageable pageable);

    // ── Lab Tech: all orders by status ───────────────────────────────────────
    Page<LabOrder> findByHospitalIdAndStatusOrderByCreatedAtDesc(
            Integer hospitalId, LabOrder.LabOrderStatus status, Pageable pageable);

    // ── Doctor: orders they raised ────────────────────────────────────────────
    List<LabOrder> findByDoctorIdOrderByCreatedAtDesc(Integer doctorId);

    // ── Patient's orders ──────────────────────────────────────────────────────
    List<LabOrder> findByPatientIdOrderByCreatedAtDesc(Integer patientId);

    // ── Orders by episode ─────────────────────────────────────────────────────
    List<LabOrder> findByEpisodeId(Integer episodeId);

    // ── Count by status for dashboard ────────────────────────────────────────
    @Query("SELECT COUNT(l) FROM LabOrder l WHERE l.hospitalId = :hId AND l.status = :status")
    Integer countByHospitalAndStatus(@Param("hId") Integer hospitalId,
                                     @Param("status") LabOrder.LabOrderStatus status);

    // ── Super admin: all orders paginated ─────────────────────────────────────
    @Query("SELECT l FROM LabOrder l ORDER BY l.createdAt DESC")
    Page<LabOrder> findAllOrderByCreatedAtDesc(Pageable pageable);
}
