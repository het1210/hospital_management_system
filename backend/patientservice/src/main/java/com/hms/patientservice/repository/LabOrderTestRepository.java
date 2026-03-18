package com.hms.patientservice.repository;

import com.hms.patientservice.entity.LabOrderTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabOrderTestRepository extends JpaRepository<LabOrderTest, Integer> {

    List<LabOrderTest> findByLabOrderId(Integer labOrderId);

    // Check if ALL tests for an order are completed
    @Query("SELECT COUNT(t) FROM LabOrderTest t " +
            "WHERE t.labOrder.id = :orderId AND t.status != 'COMPLETED'")
    Integer countPendingTests(@Param("orderId") Integer orderId);
}
