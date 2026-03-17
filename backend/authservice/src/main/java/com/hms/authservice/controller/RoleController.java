package com.hms.authservice.controller;

import com.hms.authservice.dto.ApiResponse;
import com.hms.authservice.service.RoleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/role")
@Slf4j
public class RoleController {

    @Autowired
    private RoleService roleService;


    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN')")
    public ResponseEntity<ApiResponse<?>> getRoles(){
        try{
            log.info("/api/role is called");
            Map<Integer,String> roles = roleService.getRoles();
            return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Roles are fetched", roles));

        } catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }
}
