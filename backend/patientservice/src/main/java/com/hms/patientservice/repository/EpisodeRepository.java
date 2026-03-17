package com.hms.patientservice.repository;

import com.hms.patientservice.entity.Episode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EpisodeRepository extends JpaRepository<Episode, Integer> {
    Page<Episode> findByPatientIdAndHospitalId(Integer patientId, Integer hospitalId, Pageable pageable);
}
