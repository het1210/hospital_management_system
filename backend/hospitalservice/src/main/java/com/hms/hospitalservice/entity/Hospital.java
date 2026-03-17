package com.hms.hospitalservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "hospitals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name",nullable = false)
    private String name;

    @Column(name = "address",nullable = false, columnDefinition = "TEXT")
    private String address;

    private String city;

    private String state;

    private String pincode;

    @Column(name = "registration_number", unique = true)
    private String registrationNumber;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(nullable = false)
    private String status = "active";


    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

}