package com.hms.patientservice.repository;

import com.hms.patientservice.entity.LabReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LabReportRepository extends JpaRepository<LabReport, Integer> {
    Optional<LabReport> findByLabOrderId(Integer labOrderId);
}