package com.hms.patientservice.service.impl;

import com.hms.patientservice.dto.PatientDto;
import com.hms.patientservice.entity.Appointment;
import com.hms.patientservice.entity.Patient;
import com.hms.patientservice.entity.PatientHospital;
import com.hms.patientservice.repository.AppointmentRepository;
import com.hms.patientservice.repository.PatientHospitalRepository;
import com.hms.patientservice.repository.PatientRepository;
import com.hms.patientservice.service.AppointmentService;
import com.hms.patientservice.service.PatientService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PatientServiceImpl implements PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PatientHospitalRepository patientHospitalRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Override
    public String addPatient(PatientDto patientDto) {


        //Check if Patient exists in the system with given Adhaar Number
        Patient patientValidate = patientRepository.findByAdhaarNumber(patientDto.getAdhaarNumber());

        if(patientValidate != null){
            //Check if Patient exists in the hospital
            if(patientHospitalRepository.existsByPatientIdAndHospitalId(patientValidate.getId(), patientDto.getHospitalId())){
                throw new RuntimeException("Patient already exist with given name and Adhaar number");
            }
            else{
                PatientHospital patientHospital = PatientHospital.builder().patientId(patientValidate.getId()).hospitalId(patientDto.getHospitalId()).registeredAt(LocalDateTime.now()).build();
                patientHospitalRepository.save(patientHospital);
                return patientValidate.getId().toString();
            }
        }else{
            String patientUUID = "patient-" + UUID.randomUUID().toString().substring(0, 6);
            Patient patient = Patient.builder()
                    .firstName(patientDto.getFirstName())
                    .lastName(patientDto.getLastName())
                    .phone(patientDto.getPhone())
                    .email(patientDto.getEmail())
                    .patientIdentifier(patientUUID)
                    .gender(Patient.Gender.valueOf(patientDto.getGender()))
                    .dateOfBirth(patientDto.getDateOfBirth())
                    .address(patientDto.getAddress())
                    .adhaarNumber(patientDto.getAdhaarNumber())
                    .city(patientDto.getCity())
                    .state(patientDto.getState())
                    .pincode(patientDto.getPincode())
                    .createdBy(patientDto.getCreatedBy())
                    .updatedBy(patientDto.getUpdatedBy())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            Patient savePatient = patientRepository.save(patient);

            PatientHospital patientHospital = PatientHospital.builder().patientId(savePatient.getId()).hospitalId(patientDto.getHospitalId()).registeredAt(LocalDateTime.now()).build();
            patientHospitalRepository.save(patientHospital);
            return savePatient.getId().toString();
        }

    }

    @Override
    public Page<PatientDto> getPatients(Pageable pageable, Integer hospitalId) {
        if(hospitalId == null) {
            Page<Patient> patientPage = patientRepository.findAll(pageable);

            return patientPage.map(patient ->
                    PatientDto.builder()
                            .id(patient.getId())
                            .firstName(patient.getFirstName())
                            .lastName(patient.getLastName())
                            .phone(patient.getPhone())
                            .email(patient.getEmail())
                            .gender(patient.getGender().toString())
                            .adhaarNumber(patient.getAdhaarNumber())
                            .hospitalId(hospitalId)
                            .dateOfBirth(patient.getDateOfBirth())
                            .address(patient.getAddress())
                            .patientIdentifier(patient.getPatientIdentifier())
                            .city(patient.getCity())
                            .state(patient.getState())
                            .pincode(patient.getPincode())
                            .createdBy(patient.getCreatedBy())
                            .updatedBy(patient.getUpdatedBy())
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build());
        }else{
            Page<Patient> patientPage = patientRepository.findByHospitalId(pageable, hospitalId);

            return patientPage.map(patient ->
                    PatientDto.builder()
                            .id(patient.getId())
                            .firstName(patient.getFirstName())
                            .lastName(patient.getLastName())
                            .phone(patient.getPhone())
                            .email(patient.getEmail())
                            .gender(patient.getGender().toString())
                            .adhaarNumber(patient.getAdhaarNumber())
                            .hospitalId(hospitalId)
                            .dateOfBirth(patient.getDateOfBirth())
                            .address(patient.getAddress())
                            .patientIdentifier(patient.getPatientIdentifier())
                            .city(patient.getCity())
                            .state(patient.getState())
                            .pincode(patient.getPincode())
                            .createdBy(patient.getCreatedBy())
                            .updatedBy(patient.getUpdatedBy())
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build());
        }
    }

    @Override
    public String updatePatient(Integer id, PatientDto patientDto) {
        Patient patient = patientRepository.findById(id).orElseThrow(()-> new RuntimeException("Patient with id: " + id + " Not Found"));

       patient = Patient.builder()
                .id(id)
                .firstName(patientDto.getFirstName())
                .lastName(patientDto.getLastName())
                .patientIdentifier(patientDto.getPatientIdentifier())
                .phone(patientDto.getPhone())
                .email(patientDto.getEmail())
                .gender(Patient.Gender.valueOf(patientDto.getGender()))
                .dateOfBirth(patientDto.getDateOfBirth())
                .address(patientDto.getAddress())
                .city(patientDto.getCity())
                .state(patientDto.getState())
                .pincode(patientDto.getPincode())
                .createdBy(patient.getCreatedBy())
                .updatedBy(patientDto.getUpdatedBy())
                .createdAt(patient.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();

        Patient savePatient = patientRepository.save(patient);
        return savePatient.getId().toString();

    }

    @Override
    public void deletePatient(Integer id, HttpServletRequest request) {
        if(request.getHeader("X-User-Roles").toString().equalsIgnoreCase("ROLE_SUPER_ADMIN")){
            System.out.println("User Role Super Admin");
            Patient patient = patientRepository.findById(id).orElseThrow(() -> new RuntimeException("Patient Not Found with id: " + id));
            List<Appointment> appointmentList = appointmentRepository.findAllByPatientId(patient.getId());
            appointmentRepository.deleteAll(appointmentList);
            List<PatientHospital> patientHospitals = patientHospitalRepository.findByPatientId(patient.getId());
            patientHospitalRepository.deleteAll(patientHospitals);
            patientRepository.delete(patient);
        }
        else{
            Integer hospitalId = Integer.parseInt(request.getHeader("X-Hospital-Id"));
            Patient patient = patientRepository.findById(id).orElseThrow(() -> new RuntimeException("Patient Not Found with id: " + id));
            PatientHospital patientHospital = patientHospitalRepository.findByPatientIdAndHospitalId(patient.getId(),hospitalId);
            List<Appointment> appointmentList = appointmentRepository.findAllByPatientId(patient.getId());
            appointmentRepository.deleteAll(appointmentList);
            patientHospitalRepository.delete(patientHospital);
        }

            return;
    }

    @Override
    public Page<PatientDto> searchPatients(String query,Integer hospitalId, Pageable pageable) {
        Page<Patient> patientPage = null;

        if(hospitalId != null) {
            patientPage = patientRepository.searchPatientsByHospitalId(query, hospitalId, pageable);
        }
        else{
           patientPage = patientRepository.searchPatients(query, pageable);
        }
        return patientPage.map(patient ->
                PatientDto.builder()
                        .id(patient.getId())
                        .firstName(patient.getFirstName())
                        .lastName(patient.getLastName())
                        .adhaarNumber(patient.getAdhaarNumber())
                        .patientIdentifier(patient.getPatientIdentifier())
                        .phone(patient.getPhone())
                        .email(patient.getEmail())
                        .gender(patient.getGender().toString())
                        .dateOfBirth(patient.getDateOfBirth())
                        .address(patient.getAddress())
                        .city(patient.getCity())
                        .state(patient.getState())
                        .pincode(patient.getPincode())
                        .createdBy(patient.getCreatedBy())
                        .updatedBy(patient.getUpdatedBy())
                        .createdAt(patient.getCreatedAt())
                        .updatedAt(patient.getUpdatedAt())
                        .build());
    }
}

