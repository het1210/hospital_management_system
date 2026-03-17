package com.hms.authservice.dto;


import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotNull(message = "Hospital ID is required")
    private Integer hospitalId;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 100)
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String firstName;
    private String lastName;
    private String phone;
    private String gender;
    private LocalDate dateOfBirth;
    private String status;

    @NotEmpty(message = "At least one role must be selected")
    private List<Integer> roles; // e.g., "ROLE_DOCTOR"
}