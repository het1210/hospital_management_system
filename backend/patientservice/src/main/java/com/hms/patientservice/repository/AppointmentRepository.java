package com.hms.patientservice.repository;

import com.hms.patientservice.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {

    @Query("SELECT a FROM Appointment a WHERE a.hospitalId = :hospitalId")
    Page<Appointment> findAllByHospitalId(Integer hospitalId, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.patientId = :patientId")
    Page<Appointment> findAllByPatientId(Integer patientId, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.patientId = :patientId")
    List<Appointment> findAllByPatientId(Integer patientId);

    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId AND ((a.appointmentStart < :end AND a.appointmentEnd > :start))")
    List<Appointment> findDoctorConflicts(Integer doctorId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.patientId = :patientId AND ((a.appointmentStart < :end AND a.appointmentEnd > :start))")
    List<Appointment> findPatientConflicts(Integer patientId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId AND ((a.appointmentStart < :end AND a.appointmentEnd > :start)) AND a.id != :excludeId")
    List<Appointment> findDoctorConflictsExcludingId(Integer doctorId, LocalDateTime start, LocalDateTime end, Integer excludeId);

    @Query("SELECT a FROM Appointment a WHERE a.patientId = :patientId AND ((a.appointmentStart < :end AND a.appointmentEnd > :start)) AND a.id != :excludeId")
    List<Appointment> findPatientConflictsExcludingId(Integer patientId, LocalDateTime start, LocalDateTime end, Integer excludeId);

    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId")
    List<Appointment> findAllByDoctorId(Integer doctorId);

    @Query("SELECT a,e.id,e.episode.id,e.type FROM Appointment a JOIN Encounter e on e.appointmentId=a.id" +
            " WHERE a.doctorId = :doctorId AND a.appointmentStart >= :from AND a.appointmentEnd <= :to")
    List<Object[]> findAllByDoctorIdInDateRange(Integer doctorId, LocalDateTime from, LocalDateTime to);

    @Query("SELECT a FROM Appointment a WHERE a.hospitalId = :hospitalId AND a.appointmentStart >= :from AND a.appointmentEnd <= :to")
    Page<Appointment> findAllByHospitalIdInDateRange(Integer hospitalId, Pageable pageable, LocalDateTime from, LocalDateTime to);

    //Fetch Todays Appointments for Doctor
    @Query("SELECT COUNT(a.id) FROM Appointment a WHERE a.doctorId = :userId AND a.appointmentStart >= :dateTimeStart AND a.appointmentEnd <= :dateTimeEnd")
    Integer getAppointmentCount(@Param("userId") Integer userId,@Param("dateTimeStart") LocalDateTime dateTimeStart,@Param("dateTimeEnd") LocalDateTime dateTimeEnd);


    @Query("SELECT COUNT(a.id) FROM Appointment a WHERE a.doctorId = :userId AND a.status=:status AND a.appointmentStart >= :dateTimeStart AND a.appointmentEnd <= :dateTimeEnd")
    Integer getAppointmentCount(@Param("userId") Integer userId,@Param("status") Appointment.AppointmentStatus status,@Param("dateTimeStart") LocalDateTime dateTimeStart,@Param("dateTimeEnd") LocalDateTime dateTimeEnd);

    //Fetch Todays Appointments for FrontDesk
    @Query("SELECT COUNT(a.id) FROM Appointment a WHERE a.appointmentStart >= :dateTimeStart AND a.appointmentEnd <= :dateTimeEnd")
    Integer getAppointmentCount(@Param("dateTimeStart") LocalDateTime dateTimeStart,@Param("dateTimeEnd") LocalDateTime dateTimeEnd);

    @Query("SELECT COUNT(a.id) FROM Appointment a WHERE a.status=:status AND a.appointmentStart >= :dateTimeStart AND a.appointmentEnd <= :dateTimeEnd")
    Integer getAppointmentCount(@Param("status") Appointment.AppointmentStatus status,@Param("dateTimeStart") LocalDateTime dateTimeStart,@Param("dateTimeEnd") LocalDateTime dateTimeEnd);

//    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId AND a.appointmentStart >= :to AND a.appointmentEnd <= :from ")
//    List<Appointment> findAllByDoctorIdInDateRange(Integer doctorId, LocalDateTime to, LocalDateTime from);
}
