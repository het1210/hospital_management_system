package com.hms.patientservice.repository;

import com.hms.patientservice.entity.Episode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface EpisodeRepository extends JpaRepository<Episode, Integer> {

    Page<Episode> findByPatientIdAndHospitalId(Integer patientId, Integer hospitalId, Pageable pageable);

    // NEW
    @Query("SELECT COUNT(e.id) FROM Episode e WHERE e.hospitalId = :hospitalId")
    Integer countByHospitalId(@Param("hospitalId") Integer hospitalId);

    @Query("SELECT COUNT(e.id) FROM Episode e WHERE e.hospitalId = :hospitalId AND e.status = 'ACTIVE'")
    Integer countOpenByHospitalId(@Param("hospitalId") Integer hospitalId);

    @Query("SELECT COUNT(e.id) FROM Episode e WHERE e.hospitalId = :hospitalId AND e.status = 'CLOSED'")
    Integer countClosedByHospitalId(@Param("hospitalId") Integer hospitalId);

    @Query("SELECT COUNT(e.id) FROM Episode e WHERE e.hospitalId = :hospitalId AND e.createdAt >= :from")
    Integer countNewThisMonth(@Param("hospitalId") Integer hospitalId, @Param("from") LocalDateTime from);
}
