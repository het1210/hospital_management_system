package com.hms.authservice.dto;

import lombok.*;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private Integer userId;
        private String username;
        private Integer hospitalId;
        private List<String> roles;

}