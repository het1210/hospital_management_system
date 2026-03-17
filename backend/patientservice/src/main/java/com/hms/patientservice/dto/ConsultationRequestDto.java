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
public class ConsultationRequestDto {

    private Integer encounter;
    private Integer patient;
    private Integer doctor;
    private String symptoms;
    private String diagnosis;
    private String notes;
    private boolean closeEpisode;

    private List<PrescriptionDto> prescriptions;
}
