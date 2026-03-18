
package com.hms.patientservice.dto;

import lombok.*;

import java.util.List;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class LabOrderRequestDto {

    private Integer patientId;
    private Integer episodeId;
    private Integer appointmentId;
    private Integer encounterId;
    private Integer doctorId;
    private Integer hospitalId;

    // "NORMAL" or "URGENT"
    private String priority;

    private String notes;

    // list of tests selected by doctor
    private List<LabTestItemDto> tests;
}
