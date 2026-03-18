package com.hms.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SampleCollectionRequestDto {
    private String sampleType;    // e.g., Blood, Urine, Stool
    private String sampleNotes;
}
