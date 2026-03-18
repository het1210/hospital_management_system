package com.hms.patientservice.service.impl;

import com.hms.patientservice.dto.DashboardAnalyticsDto;
import com.hms.patientservice.entity.Appointment;
import com.hms.patientservice.repository.AppointmentRepository;
import com.hms.patientservice.repository.ConsultationRepository;
import com.hms.patientservice.repository.EpisodeRepository;
import com.hms.patientservice.repository.PatientHospitalRepository;
import com.hms.patientservice.service.DashboardAnalyticsService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.*;
        import java.time.format.TextStyle;
import java.util.*;

@Service
@Slf4j
public class DashboardAnalyticsServiceImpl implements DashboardAnalyticsService {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private ConsultationRepository consultationRepository;
    @Autowired private EpisodeRepository episodeRepository;
    @Autowired private PatientHospitalRepository patientHospitalRepository;

    private static final String[] DAY_ORDER = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
    private static final String[] MONTH_NAMES = {"", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

    // ── DOCTOR ────────────────────────────────────────────────────────
    @Override
    public DashboardAnalyticsDto getDoctorAnalytics(Integer doctorId, HttpServletRequest request) {
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.atTime(23, 59, 59);
        LocalDateTime weekAgo = today.minusDays(6).atStartOfDay();
        LocalDateTime sixMonthsAgo = today.minusMonths(6).atStartOfDay();

        // Today counts
        Integer totalToday = appointmentRepository.getAppointmentCount(doctorId, todayStart, todayEnd);
        Integer booked = appointmentRepository.getAppointmentCount(doctorId, Appointment.AppointmentStatus.BOOKED, todayStart, todayEnd);
        Integer checkedIn = appointmentRepository.getAppointmentCount(doctorId, Appointment.AppointmentStatus.CHECKED_IN, todayStart, todayEnd);
        Integer completed = appointmentRepository.getAppointmentCount(doctorId, Appointment.AppointmentStatus.COMPLETED, todayStart, todayEnd);
        Integer cancelled = appointmentRepository.getAppointmentCount(doctorId, Appointment.AppointmentStatus.CANCELLED, todayStart, todayEnd);

        // Weekly trend
        List<Object[]> weeklyRaw = appointmentRepository.getWeeklyTrendByDoctor(doctorId, weekAgo, todayEnd);
        Map<String, Integer> weeklyTrend = buildWeeklyMap(weeklyRaw);

        // Monthly trend
        List<Object[]> monthlyRaw = appointmentRepository.getMonthlyTrendByDoctor(doctorId, sixMonthsAgo);
        Map<String, Integer> monthlyTrend = buildMonthlyMap(monthlyRaw);

        // Hourly distribution
        List<Object[]> hourlyRaw = appointmentRepository.getHourlyDistributionByDoctor(doctorId, todayStart, todayEnd);
        Map<String, Integer> hourly = buildHourlyMap(hourlyRaw);

        // Patient & consultation counts
        Integer myPatients = appointmentRepository.getDistinctPatientCountByDoctor(doctorId);
        Integer upcoming = appointmentRepository.getUpcomingAppointmentCountByDoctor(doctorId, LocalDateTime.now());
        Integer consultationsToday = safeCount(consultationRepository.countByDoctorIdToday(doctorId, todayStart, todayEnd));

        // Top diagnoses
        List<Object[]> diagRaw = consultationRepository.getTopDiagnosesByDoctor(doctorId, PageRequest.of(0, 5));
        Map<String, Integer> topDiagnoses = buildStringCountMap(diagRaw);

        // Recent activity
        List<DashboardAnalyticsDto.RecentActivityDto> recentActivities =
                buildDoctorRecentActivity(doctorId);

        return DashboardAnalyticsDto.builder()
                .totalAppointments(totalToday)
                .bookedAppointments(booked)
                .checkedInAppointments(checkedIn)
                .completedAppointments(completed)
                .cancelledAppointments(cancelled)
                .weeklyAppointmentTrend(weeklyTrend)
                .monthlyAppointmentTrend(monthlyTrend)
                .hourlyDistribution(hourly)
                .myPatientsCount(safeCount(myPatients))
                .myUpcomingAppointments(safeCount(upcoming))
                .myConsultationsToday(consultationsToday)
                .topDiagnoses(topDiagnoses)
                .recentActivities(recentActivities)
                .build();
    }

    // ── HOSPITAL ADMIN ────────────────────────────────────────────────
    @Override
    public DashboardAnalyticsDto getHospitalAdminAnalytics(Integer hospitalId) {
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.atTime(23, 59, 59);
        LocalDateTime weekAgo = today.minusDays(6).atStartOfDay();
        LocalDateTime sixMonthsAgo = today.minusMonths(6).atStartOfDay();
        LocalDateTime monthStart = today.withDayOfMonth(1).atStartOfDay();

        // Today appointment counts
        // Note: using frontdesk-style count (all hospital appointments)
        Integer totalToday = appointmentRepository.getAppointmentCount(todayStart, todayEnd);
        Integer booked = appointmentRepository.getAppointmentCount(Appointment.AppointmentStatus.BOOKED, todayStart, todayEnd);
        Integer checkedIn = appointmentRepository.getAppointmentCount(Appointment.AppointmentStatus.CHECKED_IN, todayStart, todayEnd);
        Integer completed = appointmentRepository.getAppointmentCount(Appointment.AppointmentStatus.COMPLETED, todayStart, todayEnd);
        Integer cancelled = appointmentRepository.getAppointmentCount(Appointment.AppointmentStatus.CANCELLED, todayStart, todayEnd);

        // Trends
        List<Object[]> weeklyRaw = appointmentRepository.getWeeklyTrendByHospital(hospitalId, weekAgo, todayEnd);
        Map<String, Integer> weeklyTrend = buildWeeklyMap(weeklyRaw);

        List<Object[]> monthlyRaw = appointmentRepository.getMonthlyTrendByHospital(hospitalId, sixMonthsAgo);
        Map<String, Integer> monthlyTrend = buildMonthlyMap(monthlyRaw);

        // Hourly
        List<Object[]> hourlyRaw = appointmentRepository.getHourlyDistributionByHospital(hospitalId, todayStart, todayEnd);
        Map<String, Integer> hourly = buildHourlyMap(hourlyRaw);

        // Patient counts
        Integer totalPatients = safeCount(patientHospitalRepository.getPatientCountByHospital(hospitalId));

        // Episode stats
        Integer totalEpisodes = safeCount(episodeRepository.countByHospitalId(hospitalId));
        Integer openEpisodes = safeCount(episodeRepository.countOpenByHospitalId(hospitalId));
        Integer closedEpisodes = safeCount(episodeRepository.countClosedByHospitalId(hospitalId));

        // Consultations
        Integer totalConsultations = safeCount(consultationRepository.countByHospitalId(hospitalId));

        // Top diagnoses
        List<Object[]> diagRaw = consultationRepository.getTopDiagnosesByHospital(hospitalId, PageRequest.of(0, 5));
        Map<String, Integer> topDiagnoses = buildStringCountMap(diagRaw);

        // Recent activity
        List<DashboardAnalyticsDto.RecentActivityDto> recent = buildHospitalRecentActivity(hospitalId);

        return DashboardAnalyticsDto.builder()
                .totalAppointments(totalToday)
                .bookedAppointments(booked)
                .checkedInAppointments(checkedIn)
                .completedAppointments(completed)
                .cancelledAppointments(cancelled)
                .weeklyAppointmentTrend(weeklyTrend)
                .monthlyAppointmentTrend(monthlyTrend)
                .hourlyDistribution(hourly)
                .totalPatients(totalPatients)
                .totalEpisodes(totalEpisodes)
                .openEpisodes(openEpisodes)
                .closedEpisodes(closedEpisodes)
                .totalConsultations(totalConsultations)
                .topDiagnoses(topDiagnoses)
                .recentActivities(recent)
                .build();
    }

    // ── SUPER ADMIN ────────────────────────────────────────────────────
    @Override
    public DashboardAnalyticsDto getSuperAdminAnalytics() {
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.atTime(23, 59, 59);
        LocalDateTime weekAgo = today.minusDays(6).atStartOfDay();
        LocalDateTime sixMonthsAgo = today.minusMonths(6).atStartOfDay();

        Integer totalToday = appointmentRepository.getAppointmentCount(todayStart, todayEnd);
        Integer booked = appointmentRepository.getAppointmentCount(Appointment.AppointmentStatus.BOOKED, todayStart, todayEnd);
        Integer checkedIn = appointmentRepository.getAppointmentCount(Appointment.AppointmentStatus.CHECKED_IN, todayStart, todayEnd);
        Integer completed = appointmentRepository.getAppointmentCount(Appointment.AppointmentStatus.COMPLETED, todayStart, todayEnd);
        Integer cancelled = appointmentRepository.getAppointmentCount(Appointment.AppointmentStatus.CANCELLED, todayStart, todayEnd);

        List<Object[]> weeklyRaw = appointmentRepository.getWeeklyTrendAll(weekAgo, todayEnd);
        Map<String, Integer> weeklyTrend = buildWeeklyMap(weeklyRaw);

        List<Object[]> monthlyRaw = appointmentRepository.getMonthlyTrendAll(sixMonthsAgo);
        Map<String, Integer> monthlyTrend = buildMonthlyMap(monthlyRaw);

        Integer totalPatients = safeCount(patientHospitalRepository.getPatientCountByHospital());

        return DashboardAnalyticsDto.builder()
                .totalAppointments(totalToday)
                .bookedAppointments(booked)
                .checkedInAppointments(checkedIn)
                .completedAppointments(completed)
                .cancelledAppointments(cancelled)
                .weeklyAppointmentTrend(weeklyTrend)
                .monthlyAppointmentTrend(monthlyTrend)
                .totalPatients(totalPatients)
                .build();
    }

    // ── FRONTDESK ──────────────────────────────────────────────────────
    @Override
    public DashboardAnalyticsDto getFrontdeskAnalytics(Integer hospitalId) {
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.atTime(23, 59, 59);

        Integer totalToday = appointmentRepository.getAppointmentCount(todayStart, todayEnd);
        Integer booked = appointmentRepository.getAppointmentCount(Appointment.AppointmentStatus.BOOKED, todayStart, todayEnd);
        Integer checkedIn = appointmentRepository.getAppointmentCount(Appointment.AppointmentStatus.CHECKED_IN, todayStart, todayEnd);
        Integer completed = appointmentRepository.getAppointmentCount(Appointment.AppointmentStatus.COMPLETED, todayStart, todayEnd);
        Integer cancelled = appointmentRepository.getAppointmentCount(Appointment.AppointmentStatus.CANCELLED, todayStart, todayEnd);

        List<Object[]> hourlyRaw = appointmentRepository.getHourlyDistributionByHospital(hospitalId, todayStart, todayEnd);
        Map<String, Integer> hourly = buildHourlyMap(hourlyRaw);

        List<DashboardAnalyticsDto.RecentActivityDto> recent = buildHospitalRecentActivity(hospitalId);

        return DashboardAnalyticsDto.builder()
                .totalAppointments(totalToday)
                .bookedAppointments(booked)
                .checkedInAppointments(checkedIn)
                .completedAppointments(completed)
                .cancelledAppointments(cancelled)
                .hourlyDistribution(hourly)
                .recentActivities(recent)
                .build();
    }

    // ── Helpers ────────────────────────────────────────────────────────

    private Map<String, Integer> buildWeeklyMap(List<Object[]> raw) {
        Map<String, Integer> map = new LinkedHashMap<>();
        for (String day : DAY_ORDER) map.put(day.substring(0, 3), 0);
        for (Object[] row : raw) {
            String day = (String) row[0];
            Integer count = ((Number) row[1]).intValue();
            String abbr = day.length() >= 3 ? day.substring(0, 3) : day;
            map.put(abbr, count);
        }
        return map;
    }

    private Map<String, Integer> buildMonthlyMap(List<Object[]> raw) {
        Map<String, Integer> map = new LinkedHashMap<>();
        // Populate last 6 months
        for (int i = 5; i >= 0; i--) {
            LocalDate d = LocalDate.now().minusMonths(i);
            map.put(d.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), 0);
        }
        for (Object[] row : raw) {
            int monthNum = ((Number) row[0]).intValue();
            Integer count = ((Number) row[1]).intValue();
            String monthName = MONTH_NAMES[monthNum];
            if (map.containsKey(monthName)) map.put(monthName, count);
        }
        return map;
    }

    private Map<String, Integer> buildHourlyMap(List<Object[]> raw) {
        Map<String, Integer> map = new LinkedHashMap<>();
        for (int h = 8; h <= 20; h++) {
            map.put(String.format("%02d:00", h), 0);
        }
        for (Object[] row : raw) {
            int hour = ((Number) row[0]).intValue();
            Integer count = ((Number) row[1]).intValue();
            map.put(String.format("%02d:00", hour), count);
        }
        return map;
    }

    private Map<String, Integer> buildStringCountMap(List<Object[]> raw) {
        Map<String, Integer> map = new LinkedHashMap<>();
        for (Object[] row : raw) {
            String key = row[0] != null ? row[0].toString() : "Unknown";
            Integer count = ((Number) row[1]).intValue();
            map.put(key, count);
        }
        return map;
    }

    private Integer safeCount(Integer val) {
        return val != null ? val : 0;
    }

    private List<DashboardAnalyticsDto.RecentActivityDto> buildDoctorRecentActivity(Integer doctorId) {
        List<DashboardAnalyticsDto.RecentActivityDto> list = new ArrayList<>();
        try {
            List<Appointment> recent = appointmentRepository.findRecentByDoctor(doctorId, PageRequest.of(0, 5));
            for (Appointment a : recent) {
                list.add(DashboardAnalyticsDto.RecentActivityDto.builder()
                        .type("appointment")
                        .title("Appointment #" + a.getId())
                        .subtitle("Patient ID: " + a.getPatientId())
                        .time(a.getAppointmentStart().toString())
                        .status(a.getStatus().name())
                        .color(statusColor(a.getStatus().name()))
                        .build());
            }
        } catch (Exception e) {
            log.error("Error building doctor activity: {}", e.getMessage());
        }
        return list;
    }

    private List<DashboardAnalyticsDto.RecentActivityDto> buildHospitalRecentActivity(Integer hospitalId) {
        List<DashboardAnalyticsDto.RecentActivityDto> list = new ArrayList<>();
        try {
            List<Appointment> recent = appointmentRepository.findRecentByHospital(hospitalId, PageRequest.of(0, 5));
            for (Appointment a : recent) {
                list.add(DashboardAnalyticsDto.RecentActivityDto.builder()
                        .type("appointment")
                        .title("Appointment #" + a.getId())
                        .subtitle("Patient ID: " + a.getPatientId() + " • Dr. " + a.getDoctorId())
                        .time(a.getAppointmentStart().toString())
                        .status(a.getStatus().name())
                        .color(statusColor(a.getStatus().name()))
                        .build());
            }
        } catch (Exception e) {
            log.error("Error building hospital activity: {}", e.getMessage());
        }
        return list;
    }

    private String statusColor(String status) {
        return switch (status) {
            case "BOOKED" -> "#3b82f6";
            case "CHECKED_IN" -> "#10b981";
            case "COMPLETED" -> "#6366f1";
            case "CANCELLED" -> "#ef4444";
            default -> "#718096";
        };
    }
}