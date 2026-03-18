package com.hms.patientservice.controller;

import com.hms.patientservice.dto.ApiResponse;
import com.hms.patientservice.dto.DashboardAnalyticsDto;
import com.hms.patientservice.service.DashboardAnalyticsService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@Slf4j
public class DashboardController {

    @Autowired
    private DashboardAnalyticsService analyticsService;

    /**
     * GET /api/dashboard/doctor
     * Returns full analytics for the authenticated doctor.
     */
    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<?>> getDoctorDashboard(HttpServletRequest request) {
        try {
            String userIdHeader = request.getHeader("X-User-Id");
            Integer doctorId = Integer.parseInt(userIdHeader);
            log.info("Doctor dashboard request for doctorId: {}", doctorId);
            DashboardAnalyticsDto dto = analyticsService.getDoctorAnalytics(doctorId, request);
            return ResponseEntity.ok(ApiResponse.success("Doctor dashboard data fetched", dto));
        } catch (Exception e) {
            log.error("Error fetching doctor dashboard: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * GET /api/dashboard/hospital
     * Returns full analytics for the authenticated hospital admin.
     */
    @GetMapping("/hospital")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    public ResponseEntity<ApiResponse<?>> getHospitalDashboard(HttpServletRequest request) {
        try {
            String hospitalIdHeader = request.getHeader("X-Hospital-Id");
            Integer hospitalId = Integer.parseInt(hospitalIdHeader);
            log.info("Hospital admin dashboard request for hospitalId: {}", hospitalId);
            DashboardAnalyticsDto dto = analyticsService.getHospitalAdminAnalytics(hospitalId);
            return ResponseEntity.ok(ApiResponse.success("Hospital admin dashboard data fetched", dto));
        } catch (Exception e) {
            log.error("Error fetching hospital admin dashboard: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * GET /api/dashboard/superadmin
     * Returns system-wide analytics for super admin.
     */
    @GetMapping("/superadmin")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> getSuperAdminDashboard() {
        try {
            log.info("Super admin dashboard request");
            DashboardAnalyticsDto dto = analyticsService.getSuperAdminAnalytics();
            return ResponseEntity.ok(ApiResponse.success("Super admin dashboard data fetched", dto));
        } catch (Exception e) {
            log.error("Error fetching super admin dashboard: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * GET /api/dashboard/frontdesk
     * Returns analytics for frontdesk.
     */
    @GetMapping("/frontdesk")
    @PreAuthorize("hasRole('FRONTDESK')")
    public ResponseEntity<ApiResponse<?>> getFrontdeskDashboard(HttpServletRequest request) {
        try {
            String hospitalIdHeader = request.getHeader("X-Hospital-Id");
            Integer hospitalId = Integer.parseInt(hospitalIdHeader);
            log.info("Frontdesk dashboard request for hospitalId: {}", hospitalId);
            DashboardAnalyticsDto dto = analyticsService.getFrontdeskAnalytics(hospitalId);
            return ResponseEntity.ok(ApiResponse.success("Frontdesk dashboard data fetched", dto));
        } catch (Exception e) {
            log.error("Error fetching frontdesk dashboard: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }
}