package com.hms.patientservice.controller;

import com.hms.patientservice.dto.ApiResponse;
import com.hms.patientservice.dto.AppointmentDto;
import com.hms.patientservice.service.AppointmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@Slf4j
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','FRONTDESK','DOCTOR')")
    public ResponseEntity<ApiResponse<?>> createAppointment(@Valid @RequestBody AppointmentDto appointmentDto, HttpServletRequest request) {
        log.info("Request to create appointment for patient: {}", appointmentDto.getPatientId());
        AppointmentDto created = appointmentService.createAppointment(appointmentDto,request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment created successfully", created));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','FRONTDESK','DOCTOR','PATIENT')")
    public ResponseEntity<ApiResponse<?>> getAppointmentById(@PathVariable Integer id) {
        log.info("Request to fetch appointment with id: {}", id);
        AppointmentDto appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment fetched successfully", appointment));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','FRONTDESK','DOCTOR')")
    public ResponseEntity<ApiResponse<?>> getAllAppointments(
            Pageable pageable,
            @RequestParam(value = "hospitalId", required = false) Integer hospitalId,
            @RequestParam("to") String to,@RequestParam("from") String from
    ) {
        log.info("Request to fetch appointments page: {}", pageable.getPageNumber());
        Page<AppointmentDto> appointments = appointmentService.getAllAppointments(pageable, hospitalId,to,from);
        return ResponseEntity.ok(ApiResponse.success("Appointments fetched successfully", appointments));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','FRONTDESK','DOCTOR')")
    public ResponseEntity<ApiResponse<?>> getDoctorAppointments(@PathVariable Integer doctorId, @RequestParam("to") String to,@RequestParam("from") String from) {
        log.info("Request to fetch appointments for doctor: {}", doctorId);
        List<AppointmentDto> appointments = appointmentService.getDoctorAppointments(doctorId,to,from);
        return ResponseEntity.ok(ApiResponse.success("Doctor appointments fetched successfully", appointments));
    }

    @GetMapping("/doctor/{doctorId}/all")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','FRONTDESK','DOCTOR')")
    public ResponseEntity<ApiResponse<?>> getDoctorAllAppointments(@PathVariable Integer doctorId) {
        log.info("Request to fetch appointments for doctor: {}", doctorId);
        List<AppointmentDto> appointments = appointmentService.getDoctorAppointments(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor appointments fetched successfully", appointments));
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','FRONTDESK','DOCTOR')")
    public ResponseEntity<ApiResponse<?>> updateAppointment(
            @PathVariable Integer id,
            @Valid @RequestBody AppointmentDto appointmentDto,
            HttpServletRequest request) {
        log.info("Request to update appointment with id: {}", id);
        AppointmentDto updated = appointmentService.updateAppointment(id, appointmentDto, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','FRONTDESK')")
    public ResponseEntity<ApiResponse<?>> deleteAppointment(@PathVariable Integer id) {
        log.info("Request to delete appointment with id: {}", id);
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment deleted successfully", id));
    }

    @GetMapping("/role/{role}/today")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'SUPER_ADMIN','FRONTDESK','DOCTOR')")
    public ResponseEntity<ApiResponse<?>> getCountTodayAppointment(@PathVariable("role") String role,@RequestParam("from") String from,@RequestParam("to") String to,HttpServletRequest request){
        try{
            log.info("Request to get appointment for today");
            Map<String,Integer> response = appointmentService.getAppointmentCount(role,from,to,request);
            return ResponseEntity.ok(ApiResponse.success("No. of appointment for today", response));
        }catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

}
