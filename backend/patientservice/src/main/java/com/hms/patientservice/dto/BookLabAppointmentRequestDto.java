package com.hms.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BookLabAppointmentRequestDto {
    private String  appointmentStart; // ISO-8601 datetime
    private String  appointmentEnd;
    private Integer labTechnicianId;  // assigned lab technician (optional)
}