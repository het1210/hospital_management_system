package com.hms.hospitalservice.service;

import com.hms.hospitalservice.dto.HospitalDto;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

public interface HospitalService {
    HospitalDto addHospital(@Valid HospitalDto hospitalRequest);

    Page<HospitalDto> getHospitals(Pageable pageable);

    HospitalDto updateHospital(@Valid HospitalDto hospitalRequest);

    void deleteHospital(Integer id);

    Map<String,Integer> getHospitalCount();

    List<HospitalDto> getHospitalNames(Integer id);

    List<HospitalDto> findAllByIds(List<Integer> hospitalIds);
}
