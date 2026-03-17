package com.hms.patientservice.service;

import com.hms.patientservice.dto.AppointmentDto;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface AppointmentService {
    AppointmentDto createAppointment(AppointmentDto appointmentDto, HttpServletRequest request);
    AppointmentDto getAppointmentById(Integer id);
    Page<AppointmentDto> getAllAppointments(Pageable pageable, Integer hospitalId, String to, String from);
    List<AppointmentDto> getDoctorAppointments(Integer doctorId, String to, String from);
    List<AppointmentDto> getDoctorAppointments(Integer doctorId);
    AppointmentDto updateAppointment(Integer id, AppointmentDto appointmentDto, HttpServletRequest request);
    void deleteAppointment(Integer id);

    Map<String,Integer> getAppointmentCount(String role,String from,String to, HttpServletRequest request);
}
