package com.hms.patientservice.repository;

import com.hms.patientservice.entity.PatientHospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientHospitalRepository extends JpaRepository<PatientHospital, Integer> {
    boolean existsByPatientIdAndHospitalId(Integer patientId, Integer hospitalId);

    List<PatientHospital> findByPatientId(Integer id);

    PatientHospital findByPatientIdAndHospitalId(Integer patientId, Integer hospitalId);
}
