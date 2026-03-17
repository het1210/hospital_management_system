package com.hms.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PrescriptionDto {
    private Integer id;

    private Integer consultationId;

    private String medicineName;

    private String dosage;

    private String frequency;

    private String duration;
}
