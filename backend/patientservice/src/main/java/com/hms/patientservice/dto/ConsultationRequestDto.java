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
public class ConsultationRequestDto {

    private Integer encounter;
    private Integer patient;
    private Integer doctor;
    private String symptoms;
    private String diagnosis;
    private String notes;
    private boolean closeEpisode;

    private List<PrescriptionDto> prescriptions;

    // ── NEW: Lab Order fields ─────────────────────────────────────────────────
    /** If true, a LabOrder will be created on consultation submit */
    private boolean raiseLabOrder;

    /** Tests selected by doctor (only relevant when raiseLabOrder = true) */
    private List<LabTestItemDto> labTests;

    /** "NORMAL" or "URGENT" */
    private String labPriority;

    /** Free-text notes for the lab */
    private String labNotes;

    /** Hospital context — needed to create the lab order */
    private Integer hospitalId;
}
