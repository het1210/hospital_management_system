package com.hms.authservice.service;
import com.hms.authservice.config.JwtUtil;
import com.hms.authservice.dto.AuthResponse;
import com.hms.authservice.dto.LoginRequest;
import com.hms.authservice.dto.RegisterRequest;
import com.hms.authservice.entity.Role;
import com.hms.authservice.entity.Users;
import com.hms.authservice.repository.RoleRepository;
import com.hms.authservice.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class AuthService {
    private final UsersRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    // ── LOGIN ──────────────────────────────────────────────────────────
    public AuthResponse login(LoginRequest request) {
        // 1. Authenticate (throws BadCredentialsException if invalid)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // 2. Load full user entity (with hospital + roles)
        Users user = userRepository.findByUsername(
                        request.getUsername())
                .orElseThrow(()-> new RuntimeException("User Not Found"));

        if (!"active".equalsIgnoreCase(user.getStatus())) {
            throw new DisabledException("Account is " + user.getStatus());
        }

        // 3. Generate tokens
        String accessToken  = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                user.getId(),
                user.getUsername(),
                user.getHospitalId(),
                roles
        );
    }

    // ── REGISTER ───────────────────────────────────────────────────────
    public String register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

//        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
//                .orElseThrow(() -> new RuntimeException("Hospital not found"));

        Users user = new Users();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setHospitalId(request.getHospitalId());
        user.setGender(Users.Gender.valueOf(request.getGender()));
        user.setDateOfBirth(request.getDateOfBirth());
        user.setStatus(request.getStatus());
        // Assign rolesName
        Set<Role> roles = request.getRoles().stream()
                .map(roleId -> roleRepository.findById(roleId)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleId)))
                .collect(Collectors.toSet());
        user.setRoles(roles);

        userRepository.save(user);
        return "User registered successfully";
    }

    // ── REFRESH TOKEN ──────────────────────────────────────────────────
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }
        String username = jwtUtil.extractUsername(refreshToken);
        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String newAccessToken = jwtUtil.generateAccessToken(user);
        List<String> roles = user.getRoles().stream()
                .map(Role::getName).collect(Collectors.toList());

        return new AuthResponse(newAccessToken, refreshToken, "Bearer",
                user.getId(), user.getUsername(),user.getHospitalId(), roles);
    }

    public Boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }
}
