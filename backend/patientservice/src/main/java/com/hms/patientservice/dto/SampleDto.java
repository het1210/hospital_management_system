package com.hms.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SampleDto {
    private Integer id;
    private Integer labOrderId;
    private String  sampleType;
    private String  sampleNotes;
    private String  barcode;
    private Integer collectedBy;
    private String  collectedAt;
    private String  status;
}
