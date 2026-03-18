package com.hms.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardAnalyticsDto {

    // ── Appointment stats ─────────────────────────────────
    private Integer totalAppointments;
    private Integer bookedAppointments;
    private Integer checkedInAppointments;
    private Integer completedAppointments;
    private Integer cancelledAppointments;

    // ── Weekly trend (last 7 days) ────────────────────────
    // key = "Mon", "Tue", ... ; value = count
    private Map<String, Integer> weeklyAppointmentTrend;

    // ── Monthly trend (last 6 months) ────────────────────
    private Map<String, Integer> monthlyAppointmentTrend;

    // ── Consultation & episode stats ─────────────────────
    private Integer totalConsultations;
    private Integer totalEpisodes;
    private Integer openEpisodes;
    private Integer closedEpisodes;

    // ── Doctor-specific ───────────────────────────────────
    private Integer myPatientsCount;         // distinct patients seen by this doctor
    private Integer myConsultationsToday;
    private Integer myUpcomingAppointments;

    // ── Hospital / admin ─────────────────────────────────
    private Integer totalPatients;
    private Integer newPatientsThisMonth;

    // ── Appointment hourly distribution (for today) ──────
    // key = "08:00", "09:00", ...; value = count
    private Map<String, Integer> hourlyDistribution;

    // ── Top diagnoses (doctor / hospitaladmin) ────────────
    // key = diagnosis string; value = count
    private Map<String, Integer> topDiagnoses;

    // ── Recent activity list ──────────────────────────────
    private List<RecentActivityDto> recentActivities;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentActivityDto {
        private String type;        // "appointment" | "consultation" | "episode"
        private String title;
        private String subtitle;
        private String time;
        private String status;
        private String color;
    }
}