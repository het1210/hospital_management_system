package com.hms.patientservice.service.impl;

import com.hms.patientservice.dto.ApiResponse;
import com.hms.patientservice.dto.EncounterDto;
import com.hms.patientservice.dto.EpisodeDto;
import com.hms.patientservice.dto.EpisodeEncounterResponse;
import com.hms.patientservice.entity.Encounter;
import com.hms.patientservice.entity.Episode;
import com.hms.patientservice.entity.Patient;
import com.hms.patientservice.feignclient.UserFeignClient;
import com.hms.patientservice.repository.EncounterRepository;
import com.hms.patientservice.repository.EpisodeRepository;
import com.hms.patientservice.repository.PatientRepository;
import com.hms.patientservice.service.EpisodeService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EpisodeServiceImpl implements EpisodeService {

    @Autowired
    private EpisodeRepository episodeRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private EncounterRepository encounterRepository;

    @Autowired
    private UserFeignClient userFeignClient;

    @Override
    public EpisodeDto createEpisode(EpisodeDto episodeDto, HttpServletRequest request) {
        Episode episode = mapToEntity(episodeDto);
        episode.setCreatedAt(LocalDateTime.now());
        episode.setCreatedBy(Integer.parseInt(request.getHeader("X-User-Id")));
        episode.setUpdatedAt(LocalDateTime.now());
        episode.setUpdatedBy(Integer.parseInt(request.getHeader("X-User-Id")));

        Episode savedEpisode = episodeRepository.save(episode);

        return mapToDto(savedEpisode);
    }

    @Override
    public Page<EpisodeDto> searchEpisodesByPatientId(Pageable pageable, Long searchQuery, Integer hospitalId) {
        Patient patient = patientRepository.findByAdhaarNumber(searchQuery);
        Page<Episode> episodePage = episodeRepository.findByPatientIdAndHospitalId(patient.getId(),hospitalId,pageable);
        return episodePage.map(this ::mapToDto);
    }

    @Override
    public EpisodeEncounterResponse getEpisodeById(Integer episodeId) {
        Episode episode = episodeRepository.findById(episodeId).orElseThrow(()-> new RuntimeException("Episode Not Found"));
        List<Encounter> encounterList = encounterRepository.findByEpisode(episode);
        List<Integer> doctorIds = encounterList.stream().map(Encounter::getDoctorId).distinct().toList();
        Map<Integer,String> doctors = new HashMap<>();

        try {
            ApiResponse response = userFeignClient.getUserByIds(doctorIds);

            if (response != null && response.getData() != null) {

                List<Map<String, Object>> users = (List<Map<String, Object>>) response.getData();
                users.forEach(user ->
                        doctors.put(
                                (Integer) user.get("userId"),
                                (String) user.get("firstName") + " " + user.get("lastName")
                        )
                );
            }
        }
        catch (Exception e) {
            log.error("Error fetching doctor name: {}", e.getMessage());
        }



        List<EncounterDto> encounterDtos =  encounterList.stream().map(encounter ->
                EncounterDto.builder()
                        .id(encounter.getId())
                        .episode(episodeId)
                        .patientId(encounter.getPatientId())
                        .doctorId(encounter.getDoctorId())
                        .appointmentId(encounter.getAppointmentId())
                        .doctorName(doctors.get(encounter.getDoctorId()))
                        .type(encounter.getType().toString())
                        .startTime(encounter.getStartTime())
                        .endTime(encounter.getEndTime())
                        .build()).toList();
        EpisodeDto episodeDto = mapToDto(episode);
        return new EpisodeEncounterResponse(episodeDto,encounterDtos);
    }

    private EpisodeDto mapToDto(Episode episode){
        return EpisodeDto.builder()
                .id(episode.getId())
                .hospitalId(episode.getHospitalId())
                .patientId(episode.getPatient().getId())
                .patientName(""+episode.getPatient().getFirstName()+" "+episode.getPatient().getLastName())
                .episodeType(episode.getEpisodeType())
                .reason(episode.getReason())
                .startDate(episode.getStartDate())
                .endDate(episode.getEndDate())
                .status(episode.getStatus().toString())
                .build();
    }

    private Episode mapToEntity(EpisodeDto episodeDto){
        Patient patient = Patient.builder().id(episodeDto.getPatientId()).build();
        return Episode.builder()
                .id(episodeDto.getId())
                .hospitalId(episodeDto.getHospitalId())
                .patient(patient)
                .episodeType(episodeDto.getEpisodeType())
                .reason(episodeDto.getReason())
                .startDate(episodeDto.getStartDate())
                .endDate(episodeDto.getEndDate())
                .status(Episode.EpisodeStatus.valueOf(episodeDto.getStatus()))
                .build();
    }
}
