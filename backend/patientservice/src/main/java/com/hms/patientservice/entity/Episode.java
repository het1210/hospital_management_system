package com.hms.patientservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "episodes")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Episode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "hospital_id", nullable = false)
    private Integer hospitalId;

    @Column(name = "episode_type")
    private String episodeType;

    @Column(name = "reason")
    private String reason;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt= LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt= LocalDateTime.now();

    @Column(name = "created_by",nullable = false)
    private Integer createdBy;

    @Column(name = "updated_by")
    private Integer updatedBy;


    @Enumerated(EnumType.STRING)
    private EpisodeStatus status;

    public enum EpisodeStatus {
        ACTIVE,
        CLOSED
    }
}