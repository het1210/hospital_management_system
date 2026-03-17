package com.hms.patientservice.service.impl;

import com.hms.patientservice.dto.ApiResponse;
import com.hms.patientservice.dto.ConsultationDto;
import com.hms.patientservice.dto.ConsultationRequestDto;
import com.hms.patientservice.dto.PrescriptionDto;
import com.hms.patientservice.entity.*;
import com.hms.patientservice.feignclient.UserFeignClient;
import com.hms.patientservice.repository.*;
import com.hms.patientservice.service.ConsultationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ConsultationServiceImpl implements ConsultationService {
    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private EncounterRepository encounterRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private EpisodeRepository episodeRepository;

    @Autowired
    private UserFeignClient userFeignClient;

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Integer createConsultation(ConsultationRequestDto consultationRequestDto) {
        Encounter encounter = encounterRepository.findById(consultationRequestDto.getEncounter()).orElseThrow(()-> new RuntimeException("Enounter Not Found With Id: "+ consultationRequestDto.getEncounter()));

        Consultation consultation = new Consultation();
        consultation.setEncounter(encounter);
        consultation.setPatientId(consultationRequestDto.getPatient());
        consultation.setDoctorId(consultationRequestDto.getDoctor());
        consultation.setSymptoms(consultationRequestDto.getSymptoms());
        consultation.setDiagnosis(consultationRequestDto.getDiagnosis());
        consultation.setNotes(consultationRequestDto.getNotes());
        Consultation saveConsultation = consultationRepository.save(consultation);

        if(consultationRequestDto.isCloseEpisode()){
                Episode episode = encounter.getEpisode();
                episode.setEndDate(LocalDateTime.now());
                episode.setUpdatedAt(LocalDateTime.now());
                episode.setUpdatedBy(consultationRequestDto.getDoctor());
                episodeRepository.save(episode);
        }




        if(saveConsultation.getId() != null){
            encounter.setEndTime(LocalDateTime.now());
            encounterRepository.save(encounter);

            Appointment appointment = appointmentRepository.findById(encounter.getAppointmentId()).orElseThrow(()-> new RuntimeException("Appointment Not found"));
            appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
            appointmentRepository.save(appointment);
        if (consultationRequestDto.getPrescriptions() != null &&
                !consultationRequestDto.getPrescriptions().isEmpty()) {

            List<Prescription> prescriptions =
                    consultationRequestDto.getPrescriptions()
                            .stream()
                            .map(dto -> Prescription.builder()
                                    .consultation(saveConsultation)
                                    .medicineName(dto.getMedicineName())
                                    .dosage(dto.getDosage())
                                    .frequency(dto.getFrequency())
                                    .duration(dto.getDuration())
                                    .build())
                            .collect(Collectors.toList());

            prescriptionRepository.saveAll(prescriptions);
        }

        }


        return saveConsultation.getId();
    }
    /*
    This method contains N+1 query which slow down the method
     */
//    @Override
//    public Page<ConsultationDto> getConsultationByPatient(Pageable pageable, Long adhaarNumber) {
//        Patient patient = patientRepository.findByAdhaarNumber(adhaarNumber);
//
//        if(patient == null){
//            throw new RuntimeException("Patien not found with Adhaar Number " + adhaarNumber);
//        }
//        Page<Consultation> consultationPage = consultationRepository.findByPatientId(patient.getId(),pageable);
//
//
//
//        return consultationPage.map(consultation -> ConsultationDto.builder()
//                .id(consultation.getId())
//                .encounter(consultation.getEncounter().getId())
//                .symptoms(consultation.getSymptoms())
//                .patient(consultation.getPatientId())
//                .patientName(patient.getFirstName() + " " + patient.getLastName())
//                .doctor(consultation.getDoctorId())
//                .diagnosis(consultation.getDiagnosis())
//                .prescription(consultation.getPrescriptions().stream().map(
//                        prescription -> PrescriptionDto.builder()
//                                .id(prescription.getId())
//                                .consultationId(consultation.getId())
//                                .medicineName(prescription.getMedicineName())
//                                .dosage(prescription.getDosage())
//                                .frequency(prescription.getFrequency())
//                                .duration(prescription.getDuration())
//                                .build()
//                ).toList())
//                .notes(consultation.getNotes())
//                .build());
//    }


    @Override
    public Page<ConsultationDto> getConsultationByPatient(Pageable pageable, Long adhaarNumber, HttpServletRequest request) {
        Patient patient = patientRepository.findByAdhaarNumber(adhaarNumber);
        Integer doctorId = Integer.parseInt(request.getHeader("X-User-Id"));
        String role = request.getHeader("x-User-Roles");
        List<String> roles = Arrays.stream(role.split(","))
                .map(String::trim)
                .toList();
        Map<Integer, String> consultationDoc = new HashMap<>();



        if (patient == null) {
            throw new RuntimeException("Patien not found with Adhaar Number " + adhaarNumber);
        }

        Page<Consultation> consultationPage = null;


        if(roles.contains("ROLE_DOCTOR")){
            try {
                consultationPage = consultationRepository.findByPatientIdAndDoctorId(patient.getId(),doctorId,pageable);

                ApiResponse response = userFeignClient.getUserById(doctorId);
                if (response != null && response.getData() != null) {
                    Map<String, Object> userData = (Map<String, Object>) response.getData();
                    consultationDoc.put((Integer) userData.get("userId"),(String) userData.get("firstName") + " " + userData.get("lastName"));
                }
            } catch (Exception e) {
                log.error("Error fetching doctor name: {}", e.getMessage());
            }
        }
        else{
            //Fetched all consultation
            consultationPage = consultationRepository.findByPatientId(patient.getId(), pageable);

            List<Integer> doctorIds = consultationPage.getContent()
                    .stream()
                    .map(Consultation::getDoctorId)
                    .distinct()
                    .toList();
            //FeignClient to fetch Doctor Data
            try {
                ApiResponse response = userFeignClient.getUserByIds(doctorIds);

                if (response != null && response.getData() != null) {

                    List<Map<String, Object>> users = (List<Map<String, Object>>) response.getData();
                    users.forEach(user ->
                            consultationDoc.put(
                                    (Integer) user.get("userId"),
                                    (String) user.get("firstName") + " " + user.get("lastName")
                            )
                    );
                }
            }
            catch (Exception e) {
                log.error("Error fetching doctor name: {}", e.getMessage());
            }
        }//End Else




        //fetch Prescription in Batch for all consultation , and store it in map
        Map<Integer, List<Prescription>> prescriptionMap =
                prescriptionRepository
                        .findByConsultationIdIn(
                                consultationPage.getContent()
                                        .stream()
                                        .map(Consultation::getId)
                                        .toList()
                        )
                        .stream()
                        .collect(Collectors.groupingBy(p -> p.getConsultation().getId()));


        return consultationPage.map(consultation -> {

            List<PrescriptionDto> prescriptionDtos =
                    prescriptionMap
                            .getOrDefault(consultation.getId(), List.of())
                            .stream()
                            .map(p -> PrescriptionDto.builder()
                                    .id(p.getId())
                                    .consultationId(consultation.getId())
                                    .medicineName(p.getMedicineName())
                                    .dosage(p.getDosage())
                                    .frequency(p.getFrequency())
                                    .duration(p.getDuration())
                                    .build())
                            .toList();

            String doctorName = "Dr. "+consultationDoc.get(consultation.getDoctorId());

            return ConsultationDto.builder()
                    .id(consultation.getId())
                    .encounter(consultation.getEncounter().getId())
                    .symptoms(consultation.getSymptoms())
                    .patient(consultation.getPatientId())
                    .patientName(patient.getFirstName() + " " + patient.getLastName())
                    .doctor(consultation.getDoctorId())
                    .doctorName(doctorName)
                    .diagnosis(consultation.getDiagnosis())
                    .prescriptions(prescriptionDtos)
                    .notes(consultation.getNotes())
                    .build();
        });


    }
}
