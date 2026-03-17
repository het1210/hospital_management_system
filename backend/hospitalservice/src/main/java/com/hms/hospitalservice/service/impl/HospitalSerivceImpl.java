package com.hms.hospitalservice.service.impl;

import com.hms.hospitalservice.dto.HospitalDto;
import com.hms.hospitalservice.entity.Hospital;
import com.hms.hospitalservice.repository.HospitalRepository;
import com.hms.hospitalservice.service.HospitalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class HospitalSerivceImpl implements HospitalService {



    @Autowired
    private HospitalRepository hospitalRepository;

    @Override
    public HospitalDto addHospital(HospitalDto hospitalRequest) {
        Hospital hospital = new Hospital();
        hospital.setName(hospitalRequest.getName());
        hospital.setAddress(hospitalRequest.getAddress());
        hospital.setCity(hospitalRequest.getCity());
        hospital.setState(hospitalRequest.getState());
        hospital.setPincode(hospitalRequest.getPincode());
        hospital.setRegistrationNumber(hospitalRequest.getRegistrationNumber());
        hospital.setPhone(hospitalRequest.getPhone());
        hospital.setEmail(hospitalRequest.getEmail());
        hospital.setStatus(hospitalRequest.getStatus());


        Hospital savedHospital = hospitalRepository.save(hospital);


        return HospitalDto.builder()
                .id(savedHospital.getId())
                .name(savedHospital.getName())
                .address(savedHospital.getAddress())
                .city(savedHospital.getCity())
                .state(savedHospital.getState())
                .pincode(savedHospital.getPincode())
                .registrationNumber(savedHospital.getRegistrationNumber())
                .phone(savedHospital.getPhone())
                .email(savedHospital.getEmail())
                .status(savedHospital.getStatus())
                .build();
    }

    @Override
    public Page<HospitalDto> getHospitals(Pageable pageable) {
        Page<Hospital> hospitalPage = hospitalRepository.findAll(pageable);

        return hospitalPage.map(hospital -> HospitalDto.builder()
                .id(hospital.getId())
                .name(hospital.getName())
                .address(hospital.getAddress())
                .city(hospital.getCity())
                .state(hospital.getState())
                .pincode(hospital.getPincode())
                .registrationNumber(hospital.getRegistrationNumber())
                .phone(hospital.getPhone())
                .email(hospital.getEmail())
                .status(hospital.getStatus())
                .build());
    }

    @Override
    public HospitalDto updateHospital(HospitalDto hospitalRequest) {
        Hospital hospital = hospitalRepository.findById(hospitalRequest.getId()).orElseThrow(()-> new RuntimeException("Hospital With Id :- " + hospitalRequest.getId() + " Not Found"));
        hospital.setId(hospitalRequest.getId());
        hospital.setName(hospitalRequest.getName());
        hospital.setAddress(hospitalRequest.getAddress());
        hospital.setCity(hospitalRequest.getCity());
        hospital.setState(hospitalRequest.getState());
        hospital.setPincode(hospitalRequest.getPincode());
        hospital.setRegistrationNumber(hospitalRequest.getRegistrationNumber());
        hospital.setPhone(hospitalRequest.getPhone());
        hospital.setEmail(hospitalRequest.getEmail());
        hospital.setStatus(hospitalRequest.getStatus());


        Hospital savedHospital = hospitalRepository.save(hospital);


        return HospitalDto.builder()
                .id(savedHospital.getId())
                .name(savedHospital.getName())
                .address(savedHospital.getAddress())
                .city(savedHospital.getCity())
                .state(savedHospital.getState())
                .pincode(savedHospital.getPincode())
                .registrationNumber(savedHospital.getRegistrationNumber())
                .phone(savedHospital.getPhone())
                .email(savedHospital.getEmail())
                .status(savedHospital.getStatus())
                .build();
    }

    @Override
    public void deleteHospital(Integer id) {
        Hospital hospital = hospitalRepository.findById(id).orElseThrow(()-> new RuntimeException("Hospital With Id :- " + id + " Not Found"));

        hospitalRepository.delete(hospital);

        return;
    }

    @Override
    public Map<String,Integer> getHospitalCount() {
        Map<String, Integer> response = new HashMap<>();
        int totalHostpials =  hospitalRepository.getHospitalCount();
        int totalActiveHospitals = hospitalRepository.getActiveHospitalCount();
        response.put("totalHospitals", totalHostpials);
        response.put("totalActiveHospitals", totalActiveHospitals);
        return response;
    }

    @Override
    public List<HospitalDto> getHospitalNames(Integer id) {
        List<Hospital> hospitalList = new ArrayList<>();
        if(id == null){
            hospitalList = hospitalRepository.findAll();
            return hospitalList.stream().map(hospital -> {
                return HospitalDto.builder()
                        .id(hospital.getId())
                        .name(hospital.getName())
                        .build();
            }).collect(Collectors.toList());
        }
        else{
            hospitalList.add(hospitalRepository.findById(id).orElseThrow(()-> new RuntimeException("Hospital with id: " + id + " not found")));
           return hospitalList.stream().map(hospital ->{
               return HospitalDto.builder()
                       .id(hospital.getId())
                       .name(hospital.getName())
                       .address(hospital.getAddress())
                       .city(hospital.getCity())
                       .state(hospital.getState())
                       .pincode(hospital.getPincode())
                       .registrationNumber(hospital.getRegistrationNumber())
                       .phone(hospital.getPhone())
                       .email(hospital.getEmail())
                       .status(hospital.getStatus())
                       .build();
           }).collect(Collectors.toList());

        }
    }

    @Override
    public List<HospitalDto> findAllByIds(List<Integer> hospitalIds) {
        List<Hospital> hospitalList =hospitalRepository.findAllById(hospitalIds);
        return hospitalList.stream().map(hospital ->{
            return HospitalDto.builder()
                    .id(hospital.getId())
                    .name(hospital.getName())
                    .address(hospital.getAddress())
                    .city(hospital.getCity())
                    .state(hospital.getState())
                    .pincode(hospital.getPincode())
                    .registrationNumber(hospital.getRegistrationNumber())
                    .phone(hospital.getPhone())
                    .email(hospital.getEmail())
                    .status(hospital.getStatus())
                    .build();
        }).collect(Collectors.toList());
    }
}

