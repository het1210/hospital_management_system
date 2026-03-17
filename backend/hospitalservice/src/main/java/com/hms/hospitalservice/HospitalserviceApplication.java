package com.hms.hospitalservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class HospitalserviceApplication {

    public static void main(String[] args) {
        SpringApplication.run(HospitalserviceApplication.class, args);
    }

}
