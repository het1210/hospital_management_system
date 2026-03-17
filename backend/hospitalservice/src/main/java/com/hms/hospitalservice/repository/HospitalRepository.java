package com.hms.hospitalservice.repository;

import com.hms.hospitalservice.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalRepository  extends JpaRepository<Hospital,Integer> {
    @Query("SELECT COUNT(h.id) FROM Hospital h WHERE h.status = 'active'")
    int getActiveHospitalCount();
    @Query("SELECT COUNT(h.id) FROM Hospital h")
    int getHospitalCount();

//    @Query("SELECT h.id,h.name FROM Hospital h")
//    List<Hospital> findHospitals();
}
