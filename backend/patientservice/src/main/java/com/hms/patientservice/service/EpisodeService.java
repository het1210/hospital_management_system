package com.hms.patientservice.service;

import com.hms.patientservice.dto.EpisodeDto;
import com.hms.patientservice.dto.EpisodeEncounterResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EpisodeService {
    EpisodeDto createEpisode(@Valid EpisodeDto episodeDto, HttpServletRequest request);

    Page<EpisodeDto> searchEpisodesByPatientId(Pageable pageable, Long searchQuery, Integer hospitalId);

    EpisodeEncounterResponse getEpisodeById(Integer episodeId);
}
