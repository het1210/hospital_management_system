package com.hms.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TestResultRequestDto {
    private Integer testId;
    private String  resultValue;
    private String  unit;
    private String  referenceRange;
    private String  remarks;
}
