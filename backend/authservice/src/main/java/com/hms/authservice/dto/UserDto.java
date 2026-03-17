package com.hms.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDto {

    private Integer userId;
    private HospitalDto hospital;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String gender;
    private String status;
    private LocalDate dateOfBirth;
    private List<Integer> roles;
}
