package com.hms.patientservice.repository;

import com.hms.patientservice.entity.Encounter;
import com.hms.patientservice.entity.Episode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EncounterRepository extends JpaRepository<Encounter, Integer> {
    List<Encounter> findByEpisode(Episode episode);
}
