package com.hms.patientservice.service;

import com.hms.patientservice.dto.ConsultationDto;
import com.hms.patientservice.dto.ConsultationRequestDto;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ConsultationService {
    Integer createConsultation(ConsultationRequestDto consultationRequestDto);

    Page<ConsultationDto> getConsultationByPatient(Pageable pageable, Long adhaarNumber, HttpServletRequest request);
}
