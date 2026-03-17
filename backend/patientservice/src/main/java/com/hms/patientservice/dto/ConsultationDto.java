package com.hms.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConsultationDto {
    private Integer id;
    private Integer encounter;
    private String symptoms;
    private Integer patient;
    private String patientName;
    private Integer doctor;
    private String doctorName;
    private String diagnosis;
    private List<PrescriptionDto> prescriptions;
    private String notes;
}
