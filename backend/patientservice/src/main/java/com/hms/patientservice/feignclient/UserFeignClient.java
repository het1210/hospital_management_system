package com.hms.patientservice.feignclient;

import com.hms.patientservice.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;

@FeignClient(name = "auth-service")
public interface UserFeignClient {

    @GetMapping("/api/users/internal/{id}")
    ApiResponse getUserById(@PathVariable("id") Integer id);

    @PostMapping("/api/users/internal/ids")
    ApiResponse getUserByIds(List<Integer> ids);
}
