package com.hms.patientservice.repository;

import com.hms.patientservice.entity.Consultation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Integer> {

    @Query("SELECT c FROM Consultation c WHERE c.patientId = :patientId ")
    Page<Consultation> findByPatientId(@Param("patientId") Integer patientId, Pageable pageable);

    Page<Consultation> findByPatientIdAndDoctorId(Integer patientId, Integer doctorId, Pageable pageable);

    // ── NEW ──────────────────────────────────────────────────────────

    @Query("SELECT COUNT(c.id) FROM Consultation c WHERE c.doctorId = :doctorId")
    Integer countByDoctorId(@Param("doctorId") Integer doctorId);

    @Query("SELECT COUNT(c.id) FROM Consultation c " +
            "WHERE c.doctorId = :doctorId " +
            "AND c.encounter.startTime >= :from AND c.encounter.startTime <= :to")
    Integer countByDoctorIdToday(@Param("doctorId") Integer doctorId,
                                 @Param("from") LocalDateTime from,
                                 @Param("to") LocalDateTime to);

    /** Top 5 diagnoses for a doctor */
    @Query("SELECT c.diagnosis, COUNT(c.id) FROM Consultation c " +
            "WHERE c.doctorId = :doctorId AND c.diagnosis IS NOT NULL " +
            "GROUP BY c.diagnosis ORDER BY COUNT(c.id) DESC")
    List<Object[]> getTopDiagnosesByDoctor(@Param("doctorId") Integer doctorId, Pageable pageable);

    /** Top 5 diagnoses for a hospital */
    @Query("SELECT c.diagnosis, COUNT(c.id) FROM Consultation c " +
            "JOIN Appointment a ON a.id = c.encounter.appointmentId " +
            "WHERE a.hospitalId = :hospitalId AND c.diagnosis IS NOT NULL " +
            "GROUP BY c.diagnosis ORDER BY COUNT(c.id) DESC")
    List<Object[]> getTopDiagnosesByHospital(@Param("hospitalId") Integer hospitalId, Pageable pageable);

    /** Total consultations for a hospital */
    @Query("SELECT COUNT(c.id) FROM Consultation c " +
            "JOIN Appointment a ON a.id = c.encounter.appointmentId " +
            "WHERE a.hospitalId = :hospitalId")
    Integer countByHospitalId(@Param("hospitalId") Integer hospitalId);

    /** Recent consultations */
    @Query("SELECT c FROM Consultation c WHERE c.doctorId = :doctorId ORDER BY c.id DESC")
    List<Consultation> findRecentByDoctor(@Param("doctorId") Integer doctorId, Pageable pageable);
}