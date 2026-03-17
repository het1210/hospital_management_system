package com.hms.hospitalservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class HospitalDto {
    private Integer id;
    @NotBlank(message = "Hospital Name is required")
    private String name;
    @NotBlank(message = "Hospital address is required")
    private String address;
    @NotBlank(message = "Hospital city is required")
    private String city;
    @NotBlank(message = "Hospital state is required")
    private String state;
    @NotBlank(message = "Hospital pincode is required")
    private String pincode;
    @NotBlank(message = "Hospital registration numer is required")
    private String registrationNumber;

    private String phone;
    private String email;
    private String status;

}
