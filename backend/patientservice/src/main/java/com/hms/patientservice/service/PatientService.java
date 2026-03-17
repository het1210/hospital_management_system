package com.hms.patientservice.service;

import com.hms.patientservice.dto.PatientDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PatientService {
    String addPatient(@Valid PatientDto patientDto);

    Page<PatientDto> getPatients(Pageable pageable, Integer hospitalId);

    String updatePatient(Integer id, @Valid PatientDto patientDto);

    void deletePatient(Integer id, HttpServletRequest request);

    Page<PatientDto> searchPatients(String query,Integer hospitalId, Pageable pageable);
}
