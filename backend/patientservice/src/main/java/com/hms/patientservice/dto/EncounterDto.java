package com.hms.patientservice.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EncounterDto {
    private Integer id;
    private Integer episode;

    private Integer patientId;

    private Integer doctorId;

    private Integer appointmentId;

    private String type;

    private String doctorName;

    private LocalDateTime startTime;

    private LocalDateTime endTime;
}
