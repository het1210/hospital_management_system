package com.hms.patientservice.controller;

import com.hms.patientservice.dto.ApiResponse;
import com.hms.patientservice.dto.ConsultationDto;
import com.hms.patientservice.dto.ConsultationRequestDto;
import com.hms.patientservice.service.ConsultationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/consultations")
@Slf4j
public class ConsultationController {

    @Autowired
    private ConsultationService consultationService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<?>> createConsulation(@RequestBody ConsultationRequestDto consultationRequestDto){
        try{
            log.info("Request to create Consultation by User {}", consultationRequestDto.getDoctor());
            Integer response = consultationService.createConsultation(consultationRequestDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Consultation Created",response));
        }
        catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/patient/{adhaarnumber}")
    @PreAuthorize("hasAnyRole('DOCTOR','FRONTDESK')")
    public ResponseEntity<ApiResponse<?>> getConsultationByPatient(Pageable pageable, @PathVariable("adhaarnumber") Long adhaarNumber, HttpServletRequest request){
        try{
            log.info("Request to get appointment by Patient With Adhaar number {}", adhaarNumber);
            Page<ConsultationDto> consultationDtoPage = consultationService.getConsultationByPatient(pageable,adhaarNumber,request);
            return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Consultation Fetched",consultationDtoPage));
        }catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }
}
