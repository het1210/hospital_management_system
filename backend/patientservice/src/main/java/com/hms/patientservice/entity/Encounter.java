package com.hms.patientservice.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "encounters")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Encounter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "episode_id")
    private Episode episode;

    private Integer patientId;

    private Integer doctorId;

    private Integer appointmentId;

    @Enumerated(EnumType.STRING)
    private EncounterType type;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    public enum EncounterType {
        OPD,
        LAB,
        RADIOLOGY,
        INPATIENT,
        ICU,
        SURGERY,
        FOLLOW_UP
    }
}