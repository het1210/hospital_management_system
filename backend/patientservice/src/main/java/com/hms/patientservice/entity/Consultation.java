package com.hms.patientservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;


//@Entity
//@Table(name = "consultations")
//public class Consultation {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Integer id;
//
//    @OneToOne
//    @JoinColumn(name = "encounter_id", nullable = false)
//    private Encounter encounter;
//
//    private String symptoms;
//
//    private String diagnosis;
//
//    private String prescription;
//
//    private String notes;
//
//    private Boolean labReportRequired;
//
//    private LocalDateTime createdAt;
//
//    private Integer createdBy;
//}

@Entity
@Table(name = "consultations")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "encounter_id")
    private Encounter encounter;

    private Integer patientId;
    private Integer doctorId;

    private String symptoms;

    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "consultation", fetch = FetchType.LAZY)
    private List<Prescription> prescriptions;

}