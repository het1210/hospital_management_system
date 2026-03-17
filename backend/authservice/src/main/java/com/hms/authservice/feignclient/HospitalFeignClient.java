package com.hms.authservice.feignclient;

import com.hms.authservice.dto.HospitalDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@FeignClient(name = "hospital-service")
public interface HospitalFeignClient {

    @PostMapping("/api/hospital/internal/batch")
    List<HospitalDto> getHospitalsByIds(@RequestHeader("Authorization") String token, @RequestBody List<Integer> hospitalIds);
}
