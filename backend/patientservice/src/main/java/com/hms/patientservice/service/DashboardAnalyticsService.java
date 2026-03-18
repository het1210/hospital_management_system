package com.hms.patientservice.service;

import com.hms.patientservice.dto.DashboardAnalyticsDto;
import jakarta.servlet.http.HttpServletRequest;

public interface DashboardAnalyticsService {
    public DashboardAnalyticsDto getDoctorAnalytics(Integer doctorId, HttpServletRequest request);
    public DashboardAnalyticsDto getHospitalAdminAnalytics(Integer hospitalId);
    public DashboardAnalyticsDto getSuperAdminAnalytics();
    public DashboardAnalyticsDto getFrontdeskAnalytics(Integer hospitalId);
}
