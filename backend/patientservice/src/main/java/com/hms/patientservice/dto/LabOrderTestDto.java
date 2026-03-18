package com.hms.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LabOrderTestDto {
    private Integer id;
    private String  testName;
    private String  testCode;
    private String  status;
    private String  resultValue;
    private String  unit;
    private String  referenceRange;
    private String  remarks;
}