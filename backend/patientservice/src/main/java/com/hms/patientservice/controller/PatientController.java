package com.hms.patientservice.controller;

import com.hms.patientservice.dto.ApiResponse;
import com.hms.patientservice.dto.PatientDto;
import com.hms.patientservice.service.PatientService;
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

@RestController
@RequestMapping("/api/patients")
@Slf4j
public class PatientController {

    @Autowired
    private PatientService patientService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','DOCTOR','FRONTDESK')")
    public ResponseEntity<ApiResponse<?>> addPatient(@Valid @RequestBody PatientDto patientDto){
        try{
            log.info("Request to Add Patient");
            String patientId = patientService.addPatient(patientDto);
            return  ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Patient is created, Id: ", patientId));
        } catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','DOCTOR','FRONTDESK','NURSE')")
    public ResponseEntity<ApiResponse<?>> getPatients(Pageable pageable, @RequestParam(value = "hospital", required = false) Integer hospitalId){
        try{
            log.info("Request to get Patients");
            Page<PatientDto> patientDtoPage = patientService.getPatients(pageable,hospitalId);
            return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Patients fetched succesfully", patientDtoPage));
        }
        catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','DOCTOR','FRONTDESK')")
    public ResponseEntity<ApiResponse<?>> updatePatient(@PathVariable("id") Integer id,@Valid @RequestBody PatientDto patientDto){
        try{
            log.info("Request to Update Patient with id: " + id );

            String patientId = patientService.updatePatient(id,patientDto);
            return  ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Patient is created, Id: ", patientId));
        } catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','DOCTOR','FRONTDESK')")
    public ResponseEntity<ApiResponse<?>> deletePateint(@PathVariable("id") Integer id, HttpServletRequest request){
        try{
            log.info("Request to delete the Pateint with id: " + id + " FROM user Id: " + request.getHeader("X-User-Id"));

            patientService.deletePatient(id, request);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success("User Deleted with id: "+ id, id));

        }catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','DOCTOR','FRONTDESK','NURSE')")
    public ResponseEntity<ApiResponse<?>> searchPatients(
            @RequestParam(value = "hospital", required = false) Integer hospitalId,
            @RequestParam("query") String query,
            Pageable pageable){
        try{
            log.info("Request to search patients with query: " + query);
            Page<PatientDto> patientDtoPage = patientService.searchPatients(query, hospitalId, pageable);
            return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Patients fetched successfully", patientDtoPage));
        }
        catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }}
