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
public class AppointmentDto {

    private Integer id;

    @NotNull(message = "Hospital ID is required")
    private Integer hospitalId;

    @NotNull(message = "Patient ID is required")
    private Integer patientId;

    @NotNull(message = "Doctor ID is required")
    private Integer doctorId;

    @NotNull(message = "Appointment start time is required")
    private LocalDateTime appointmentStart;

    @NotNull(message = "Appointment end time is required")
    private LocalDateTime appointmentEnd;

    private String status;

    private String type;
    private Integer episodeId;
    private Integer encounterId;
    private String patientName;
    private String doctorName;
    private String hospitalName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer createdBy;
    private Integer updatedBy;
}
