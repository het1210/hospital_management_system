package com.hms.authservice.dto;

import lombok.*;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationResponse {
    private boolean valid;
    private Integer userId;
    private Integer hospitalId;
    private String username;
    private Set<String> roles;
}