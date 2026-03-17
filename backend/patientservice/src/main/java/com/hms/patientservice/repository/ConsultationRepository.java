package com.hms.patientservice.repository;

import com.hms.patientservice.entity.Consultation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation,Integer> {
    @Query("SELECT c FROM Consultation c " +
            "WHERE c.patientId = :patientId ")
    Page<Consultation> findByPatientId(@Param("patientId") Integer patientid, Pageable pageable);

    Page<Consultation> findByPatientIdAndDoctorId(Integer patientId, Integer doctorId, Pageable pageable);
}
