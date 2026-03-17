package com.hms.patientservice.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientDto {
    private Integer id;
    private String patientIdentifier;

    @NotNull(message = "Adhaar Number Required")
    private Long adhaarNumber;
    @NotBlank(message = "First Name Required")
    private String firstName;
    @NotBlank(message = "Last Name Required")
    private String lastName;
    @NotBlank(message = "Phone number Required")
    private String phone;

    private String email;
    @NotBlank(message = "Gender Required")
    private String gender;
    @NotNull(message = "Date of Birth Required")
    private LocalDate dateOfBirth;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private Integer hospitalId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer createdBy;
    private Integer updatedBy;
}
