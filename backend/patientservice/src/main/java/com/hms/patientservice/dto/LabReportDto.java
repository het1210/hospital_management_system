package com.hms.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LabReportDto {
    private Integer id;
    private Integer labOrderId;
    private String  reportData;
    private String  reportUrl;
    private String  summary;
    private String  status;
    private Integer generatedBy;
    private String  generatedAt;
    private String  finalizedAt;
}
