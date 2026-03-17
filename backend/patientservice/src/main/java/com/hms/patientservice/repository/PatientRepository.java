package com.hms.patientservice.repository;

import com.hms.patientservice.entity.Patient;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Integer> {

    @Query("SELECT p FROM Patient p WHERE LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.phone) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Patient> searchPatients(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Patient p JOIN PatientHospital ph ON p.id = ph.patientId " +
            " WHERE ph.hospitalId = :hospitalId AND " +
            "(LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(p.phone) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Patient> searchPatientsByHospitalId(@Param("query") String query,@Param("hospitalId") Integer hospitalId, Pageable pageable);



    @Query("SELECT p FROM Patient p " +
            "JOIN PatientHospital ph ON ph.patientId =p.id " +
            "  WHERE ph.hospitalId = :hospitalId")
    Page<Patient> findByHospitalId(Pageable pageable,@Param("hospitalId") Integer hospitalId);

    Patient findByAdhaarNumber(Long adhaarNumber);
}
