package com.hms.patientservice.controller;

import com.hms.patientservice.dto.ApiResponse;
import com.hms.patientservice.dto.EpisodeDto;
import com.hms.patientservice.dto.EpisodeEncounterResponse;
import com.hms.patientservice.service.EpisodeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/episodes")
@Slf4j
public class EpisodeController {

    @Autowired
    private EpisodeService episodeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR','FRONTDESK')")
    public ResponseEntity<ApiResponse<?>> createEpisode(@Valid @RequestBody EpisodeDto episodeDto, HttpServletRequest request){
        try{
            log.info("Request to create Episode by {}", request.getHeader("X-User-Id"));
            EpisodeDto savedepisodeDto = episodeService.createEpisode(episodeDto, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Episode Created",savedepisodeDto));
        }
        catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('DOCTOR','FRONTDESK')")
    public ResponseEntity<ApiResponse<?>> searchEpisodesByPatientId(Pageable pageable, @RequestParam("query") Long searchQuery, @RequestParam("hospitalId") Integer hospitalId){
        try{
            log.info("Request to get Episode for patient {} in hospital {}", searchQuery, hospitalId);
            Page<EpisodeDto> episodeDtoPage = episodeService.searchEpisodesByPatientId(pageable,searchQuery,hospitalId);
            return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Episode fetched",episodeDtoPage));
        }
        catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/{episodeid}")
    @PreAuthorize("hasAnyRole('DOCTOR','FRONTDESK')")
    public ResponseEntity<ApiResponse<?>> getEpisodeById(@PathVariable("episodeid") Integer episodeId){
        try{
            log.info("Request to get Episode by id {}", episodeId);
            EpisodeEncounterResponse episodeDto = episodeService.getEpisodeById(episodeId);
            return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Episode fetched",episodeDto));

        }
        catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

}
