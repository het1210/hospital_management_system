package com.hms.patientservice.service.impl;

import com.hms.patientservice.dto.AppointmentDto;
import com.hms.patientservice.dto.ApiResponse;
import com.hms.patientservice.entity.Appointment;
import com.hms.patientservice.entity.Encounter;
import com.hms.patientservice.entity.Episode;
import com.hms.patientservice.entity.Patient;
import com.hms.patientservice.feignclient.UserFeignClient;
import com.hms.patientservice.repository.AppointmentRepository;
import com.hms.patientservice.repository.EncounterRepository;
import com.hms.patientservice.repository.EpisodeRepository;
import com.hms.patientservice.repository.PatientRepository;
import com.hms.patientservice.service.AppointmentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserFeignClient userFeignClient;

    @Autowired
    private EncounterRepository encounterRepository;

    @Autowired
    private EpisodeRepository episodeRepository;

    @Transactional(rollbackFor = Exception.class)
    @Override
    public AppointmentDto createAppointment(AppointmentDto appointmentDto, HttpServletRequest request) {
        validateAppointment(appointmentDto, null);

        Appointment appointment = Appointment.builder()
                .hospitalId(appointmentDto.getHospitalId())
                .patientId(appointmentDto.getPatientId())
                .doctorId(appointmentDto.getDoctorId())
                .status(Appointment.AppointmentStatus.valueOf(appointmentDto.getStatus()))
                .appointmentStart(appointmentDto.getAppointmentStart())
                .appointmentEnd(appointmentDto.getAppointmentEnd())
                .createdAt(LocalDateTime.now())
                .createdBy(Integer.parseInt(request.getHeader("X-User-Id")))
                .updatedBy(Integer.parseInt(request.getHeader("X-User-Id")))
                .updatedAt(LocalDateTime.now())
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        if(appointmentDto.getEpisodeId() !=null){
            Episode episode = episodeRepository.findById(appointmentDto.getEpisodeId()).orElseThrow(()-> new RuntimeException("Episode Not Found"));


            Encounter encounter = Encounter.builder()
                    .episode(episode)
                    .appointmentId(saved.getId())
                    .patientId(appointment.getPatientId())
                    .doctorId(appointmentDto.getDoctorId())
                    .type(Encounter.EncounterType.valueOf(appointmentDto.getType()))
                    .startTime(LocalDateTime.now())
                    .build();

            Encounter savedEncounter = encounterRepository.save(encounter);

        }

        return mapToDto(saved);
    }

    @Override
    public AppointmentDto getAppointmentById(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        return mapToDto(appointment);
    }

    @Override
    public Page<AppointmentDto> getAllAppointments(Pageable pageable, Integer hospitalId, String to, String from) {
        Page<Appointment> appointments;
        if (hospitalId != null) {
            LocalDateTime from1 = LocalDate.parse(from).atTime(00, 00, 00);;
            LocalDateTime to1 = LocalDate.parse(to).atTime(23, 59, 59);
//            appointments = appointmentRepository.findAllByHospitalId(hospitalId, pageable);
            appointments = appointmentRepository.findAllByHospitalIdInDateRange(hospitalId, pageable,from1,to1);
        } else {
            appointments = appointmentRepository.findAll(pageable);
        }


        return appointments.map(this::mapToDto);
    }

    @Override
    public List<AppointmentDto> getDoctorAppointments(Integer doctorId,String to,String from) {
//        List<Appointment> appointments = appointmentRepository.findAllByDoctorId(doctorId);
        LocalDateTime from1 = LocalDate.parse(from).atTime(00, 00, 00);
        LocalDateTime to1 = LocalDate.parse(to).atTime(23, 59, 59);
        List<Object[]> appointments = appointmentRepository.findAllByDoctorIdInDateRange(doctorId, from1, to1);
        List<AppointmentDto> appointmentDtoList = new ArrayList<>();
        for(Object[] obj : appointments){
            Appointment appointment = (Appointment) obj[0];
            Integer encounterId = (Integer) obj[1];
            Integer episodeId = (Integer) obj[2];
            String type = obj[3].toString();
            appointmentDtoList.add(mapToDto(appointment,encounterId,episodeId,type));
        }

//        return appointments.stream().map(this::mapToDto).collect(Collectors.toList());
        return appointmentDtoList;
    }

    @Override
    public List<AppointmentDto> getDoctorAppointments(Integer doctorId) {
        List<Appointment> appointments = appointmentRepository.findAllByDoctorId(doctorId);
        return appointments.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public AppointmentDto updateAppointment(Integer id, AppointmentDto appointmentDto, HttpServletRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));

        validateAppointment(appointmentDto, id);

        appointment.setHospitalId(appointmentDto.getHospitalId());
        appointment.setPatientId(appointmentDto.getPatientId());
        appointment.setStatus(Appointment.AppointmentStatus.valueOf(appointmentDto.getStatus()));
        appointment.setDoctorId(appointmentDto.getDoctorId());
        appointment.setAppointmentStart(appointmentDto.getAppointmentStart());
        appointment.setAppointmentEnd(appointmentDto.getAppointmentEnd());
        appointment.setUpdatedAt(LocalDateTime.now());
        appointment.setUpdatedBy(Integer.parseInt(request.getHeader("X-User-Id")));
        Appointment updated = appointmentRepository.save(appointment);
        return mapToDto(updated);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void deleteAppointment(Integer id) {
        if (!appointmentRepository.existsById(id)) {
            throw new RuntimeException("Appointment not found with id: " + id);
        }
        appointmentRepository.deleteById(id);
    }

    @Override
    public Map<String,Integer> getAppointmentCount(String role,String from,String to,HttpServletRequest request) {
        Integer userId = Integer.parseInt(request.getHeader("X-User-Id"));
        Map<String,Integer> response= new HashMap<>();
        LocalDateTime dateTimeStart = LocalDate.parse(from).atTime(0,0,0);
        LocalDateTime dateTimeEnd = LocalDate.parse(to).atTime(23,59,59);
        if(role.equalsIgnoreCase("doctor")){
            Integer totalAppointmet  = appointmentRepository.getAppointmentCount(userId,dateTimeStart,dateTimeEnd);
            Integer bookedAppointment = appointmentRepository.getAppointmentCount(userId, Appointment.AppointmentStatus.BOOKED,dateTimeStart,dateTimeEnd);
            Integer checkedInAppoinment = appointmentRepository.getAppointmentCount(userId, Appointment.AppointmentStatus.CHECKED_IN,dateTimeStart,dateTimeEnd);
            Integer complitedAppoinment = appointmentRepository.getAppointmentCount(userId, Appointment.AppointmentStatus.COMPLETED,dateTimeStart,dateTimeEnd);
            Integer cancelledAppointment = appointmentRepository.getAppointmentCount(userId, Appointment.AppointmentStatus.CANCELLED,dateTimeStart,dateTimeEnd);
            response.put("totalAppointment", totalAppointmet);
            response.put("bookedAppointment", bookedAppointment);
            response.put("checkedInAppointment", checkedInAppoinment);
            response.put("completedAppointment", complitedAppoinment);
            response.put("cancelledAppointment", cancelledAppointment);

            return response;
        }
        else if(role.equalsIgnoreCase("frontdesk")){
            Integer totalAppointmet = appointmentRepository.getAppointmentCount(dateTimeStart,dateTimeEnd);
            Integer bookedAppointment = appointmentRepository.getAppointmentCount(Appointment.AppointmentStatus.BOOKED,dateTimeStart,dateTimeEnd);
            Integer checkedInAppoinment = appointmentRepository.getAppointmentCount(Appointment.AppointmentStatus.CHECKED_IN,dateTimeStart,dateTimeEnd);
            Integer complitedAppoinment = appointmentRepository.getAppointmentCount(Appointment.AppointmentStatus.COMPLETED,dateTimeStart,dateTimeEnd);
            Integer cancelledAppointment = appointmentRepository.getAppointmentCount(Appointment.AppointmentStatus.CANCELLED,dateTimeStart,dateTimeEnd);
            response.put("totalAppointment", totalAppointmet);
            response.put("bookedAppointment", bookedAppointment);
            response.put("checkedInAppointment", checkedInAppoinment);
            response.put("completedAppointment", complitedAppoinment);
            response.put("cancelledAppointment", cancelledAppointment);
            return response;
        }
        return response;
    }

    //TO validate Appointment so that Time Slots do not clash
    private void validateAppointment(AppointmentDto appointmentDto, Integer excludeId) {


        if (appointmentDto.getAppointmentEnd().isBefore(appointmentDto.getAppointmentStart()) ||
            appointmentDto.getAppointmentEnd().isEqual(appointmentDto.getAppointmentStart())) {
            throw new RuntimeException("Appointment end time must be after start time");
        }

        List<Appointment> doctorConflicts;
        List<Appointment> patientConflicts;

        if (excludeId == null) {
            if(appointmentDto.getAppointmentStart().isBefore(LocalDateTime.now())){
                throw new RuntimeException("Appointment Date and Time must be Greater than Now");
            }

            doctorConflicts = appointmentRepository.findDoctorConflicts(
                    appointmentDto.getDoctorId(),
                    appointmentDto.getAppointmentStart(),
                    appointmentDto.getAppointmentEnd()
            );
            patientConflicts = appointmentRepository.findPatientConflicts(
                    appointmentDto.getPatientId(),
                    appointmentDto.getAppointmentStart(),
                    appointmentDto.getAppointmentEnd()
            );
        } else {
            doctorConflicts = appointmentRepository.findDoctorConflictsExcludingId(
                    appointmentDto.getDoctorId(),
                    appointmentDto.getAppointmentStart(),
                    appointmentDto.getAppointmentEnd(),
                    excludeId
            );
            patientConflicts = appointmentRepository.findPatientConflictsExcludingId(
                    appointmentDto.getPatientId(),
                    appointmentDto.getAppointmentStart(),
                    appointmentDto.getAppointmentEnd(),
                    excludeId
            );
        }

        if (!doctorConflicts.isEmpty()) {
            throw new RuntimeException("Doctor already has an appointment during this time slot");
        }

        if (!patientConflicts.isEmpty()) {
            throw new RuntimeException("Patient already has an appointment during this time slot");
        }
    }

    private AppointmentDto mapToDto(Appointment appointment) {
        AppointmentDto dto = AppointmentDto.builder()
                .id(appointment.getId())
                .hospitalId(appointment.getHospitalId())
                .patientId(appointment.getPatientId())
                .status(appointment.getStatus().toString())
                .createdBy(appointment.getCreatedBy())
                .updatedBy(appointment.getUpdatedBy())
                .doctorId(appointment.getDoctorId())
                .appointmentStart(appointment.getAppointmentStart())
                .appointmentEnd(appointment.getAppointmentEnd())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .build();

        try {
            Patient patient = patientRepository.findById(appointment.getPatientId()).orElse(null);
            if (patient != null) {
                dto.setPatientName(patient.getFirstName() + " " + patient.getLastName());
            }
        } catch (Exception e) {
            log.error("Error fetching patient name: {}", e.getMessage());
        }

        try {
            ApiResponse response = userFeignClient.getUserById(appointment.getDoctorId());
            if (response != null && response.getData() != null) {
                Map<String, Object> userData = (Map<String, Object>) response.getData();
                dto.setDoctorName("Dr. " + userData.get("firstName") + " " + userData.get("lastName"));
            }
        } catch (Exception e) {
            log.error("Error fetching doctor name: {}", e.getMessage());
            dto.setDoctorName("Doctor ID: " + appointment.getDoctorId());
        }

        return dto;
    }

    private AppointmentDto mapToDto(Appointment appointment, Integer encounterId, Integer episodeId,String type) {
        AppointmentDto dto = AppointmentDto.builder()
                .id(appointment.getId())
                .hospitalId(appointment.getHospitalId())
                .patientId(appointment.getPatientId())
                .status(appointment.getStatus().toString())
                .createdBy(appointment.getCreatedBy())
                .updatedBy(appointment.getUpdatedBy())
                .encounterId(encounterId)
                .episodeId(episodeId)
                .type(type)
                .doctorId(appointment.getDoctorId())
                .appointmentStart(appointment.getAppointmentStart())
                .appointmentEnd(appointment.getAppointmentEnd())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .build();

        try {
            Patient patient = patientRepository.findById(appointment.getPatientId()).orElse(null);
            if (patient != null) {
                dto.setPatientName(patient.getFirstName() + " " + patient.getLastName());
            }
        } catch (Exception e) {
            log.error("Error fetching patient name: {}", e.getMessage());
        }

        try {
            ApiResponse response = userFeignClient.getUserById(appointment.getDoctorId());
            if (response != null && response.getData() != null) {
                Map<String, Object> userData = (Map<String, Object>) response.getData();
                dto.setDoctorName("Dr. " + userData.get("firstName") + " " + userData.get("lastName"));
            }
        } catch (Exception e) {
            log.error("Error fetching doctor name: {}", e.getMessage());
            dto.setDoctorName("Doctor ID: " + appointment.getDoctorId());
        }

        return dto;
    }
}
