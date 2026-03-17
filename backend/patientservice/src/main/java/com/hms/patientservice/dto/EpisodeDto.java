package com.hms.patientservice.dto;


import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EpisodeDto {

    private Integer id;
    @NotNull(message = "Patient id required")
    private Integer patientId;
    @NotNull(message = "Hospital id required")
    private Integer hospitalId;
    private String patientName;
    private String episodeType;
    private String reason;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
}
