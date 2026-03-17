package com.hms.patientservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "patient_hospital")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class PatientHospital {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "patient_id", nullable = false)
    private Integer patientId;
    @Column(name = "hospital_id", nullable = false)
    private Integer hospitalId;
    @Column(name = "registered_at")
    private LocalDateTime registeredAt = LocalDateTime.now();
}
