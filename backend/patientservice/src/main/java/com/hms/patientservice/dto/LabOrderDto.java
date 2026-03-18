package com.hms.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LabOrderDto {

    private Integer id;
    private Integer patientId;
    private String  patientName;
    private Integer episodeId;
    private Integer appointmentId;
    private Integer encounterId;
    private Integer doctorId;
    private String  doctorName;
    private Integer hospitalId;
    private Integer labAppointmentId;

    private String status;     // LabOrder.LabOrderStatus name
    private String priority;   // LabOrder.Priority name

    private String notes;
    private String createdAt;
    private String updatedAt;

    private List<LabOrderTestDto> tests;
    private SampleDto             sample;
    private LabReportDto          report;
}