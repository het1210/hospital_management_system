package com.hms.patientservice.repository;

import com.hms.patientservice.entity.Sample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SampleRepository extends JpaRepository<Sample, Integer> {
    Optional<Sample> findByLabOrderId(Integer labOrderId);
}