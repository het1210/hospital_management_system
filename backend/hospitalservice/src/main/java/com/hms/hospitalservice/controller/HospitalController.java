package com.hms.hospitalservice.controller;

import com.hms.hospitalservice.dto.ApiResponse;
import com.hms.hospitalservice.dto.HospitalDto;
import com.hms.hospitalservice.entity.Hospital;
import com.hms.hospitalservice.service.HospitalService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hospital")
@Slf4j
public class HospitalController {

    @Autowired
    private HospitalService hospitalService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> addHospital(@Valid @RequestBody HospitalDto hospitalRequest){
        try{
            log.info("request to create new Hospital with name :- " + hospitalRequest.getName());
            HospitalDto hospitalDto = hospitalService.addHospital(hospitalRequest);

            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Hospital created succesfully",hospitalDto));
        } catch (RuntimeException e) {
            throw new RuntimeException(e.getMessage());
        }

    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> getHospitals(Pageable pageable){
        try{
            log.info("request to fetch Hospitals page with page Number " + pageable.getPageNumber());
            Page<HospitalDto> hospitalDtoPage = hospitalService.getHospitals(pageable);
            return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Hospitals fetched succesfully", hospitalDtoPage));

        } catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e.getMessage());
        }

    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> updatHospital(@PathVariable("id") Integer id,@Valid @RequestBody HospitalDto hospitalRequest){
       try{
           log.info("request to update Hospital with id :- "+ id);
           HospitalDto hospitalDto = hospitalService.updateHospital(hospitalRequest);

           return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Hospital created succesfully",hospitalDto));
       } catch (RuntimeException e) {
           log.error(e.getMessage());
           throw new RuntimeException(e.getMessage());
       }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> deleteHospital(@PathVariable("id") Integer id){
        try{
            log.info("Request to delete hospital with id :- " + id);

            hospitalService.deleteHospital(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success("Hospital deleted with id " + id, id ));
        } catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e.getMessage());
        }
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> getHospitalCount(){

        try{
            log.info("Request to get Hospital Count");
            Map<String,Integer> resposne = hospitalService.getHospitalCount();

            return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Fected Hospital Count", resposne));
        }
        catch (RuntimeException e) {
        log.error(e.getMessage());
        throw new RuntimeException(e.getMessage());
    }
    }

    @GetMapping("/names")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','FRONTDESK','DOCTOR')")
    public ResponseEntity<ApiResponse<?>> getHospitalNames(@RequestParam(value = "id",required = false) Integer id) {

        try {
            log.info("Request to get Hospital Names");
            List<HospitalDto> resposne = hospitalService.getHospitalNames(id);

            return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Fected Hospital Count", resposne));
        } catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e.getMessage());
        }
    }

    @PostMapping("/internal/batch")
    public ResponseEntity<List<HospitalDto>> getHospitalsByIds(@RequestBody List<Integer> hospitalIds) {

        try{
            log.info("/batch is called");
            List<HospitalDto> result = hospitalService.findAllByIds(hospitalIds);

            return ResponseEntity.ok(result);
        }
        catch (RuntimeException e) {
        log.error(e.getMessage());
        throw new RuntimeException(e.getMessage());
        }
    }
}
