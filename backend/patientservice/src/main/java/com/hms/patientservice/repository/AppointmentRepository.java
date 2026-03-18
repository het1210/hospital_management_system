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

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {

    // ── Existing queries (keep all existing ones) ─────────────────────

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

    // Existing count queries
    @Query("SELECT COUNT(a.id) FROM Appointment a WHERE a.doctorId = :userId AND a.appointmentStart >= :dateTimeStart AND a.appointmentEnd <= :dateTimeEnd")
    Integer getAppointmentCount(@Param("userId") Integer userId, @Param("dateTimeStart") LocalDateTime dateTimeStart, @Param("dateTimeEnd") LocalDateTime dateTimeEnd);

    @Query("SELECT COUNT(a.id) FROM Appointment a WHERE a.doctorId = :userId AND a.status=:status AND a.appointmentStart >= :dateTimeStart AND a.appointmentEnd <= :dateTimeEnd")
    Integer getAppointmentCount(@Param("userId") Integer userId, @Param("status") Appointment.AppointmentStatus status, @Param("dateTimeStart") LocalDateTime dateTimeStart, @Param("dateTimeEnd") LocalDateTime dateTimeEnd);

    @Query("SELECT COUNT(a.id) FROM Appointment a WHERE a.appointmentStart >= :dateTimeStart AND a.appointmentEnd <= :dateTimeEnd")
    Integer getAppointmentCount(@Param("dateTimeStart") LocalDateTime dateTimeStart, @Param("dateTimeEnd") LocalDateTime dateTimeEnd);

    @Query("SELECT COUNT(a.id) FROM Appointment a WHERE a.status=:status AND a.appointmentStart >= :dateTimeStart AND a.appointmentEnd <= :dateTimeEnd")
    Integer getAppointmentCount(@Param("status") Appointment.AppointmentStatus status, @Param("dateTimeStart") LocalDateTime dateTimeStart, @Param("dateTimeEnd") LocalDateTime dateTimeEnd);

    // ── NEW: Dashboard analytics queries ──────────────────────────────

    /** Weekly trend for a specific doctor — count per day-of-week */
    @Query("SELECT FUNCTION('DAYNAME', a.appointmentStart), COUNT(a.id) " +
            "FROM Appointment a " +
            "WHERE a.doctorId = :doctorId AND a.appointmentStart >= :from AND a.appointmentStart <= :to " +
            "GROUP BY FUNCTION('DAYNAME', a.appointmentStart)")
    List<Object[]> getWeeklyTrendByDoctor(@Param("doctorId") Integer doctorId,
                                          @Param("from") LocalDateTime from,
                                          @Param("to") LocalDateTime to);

    /** Weekly trend for a hospital */
    @Query("SELECT FUNCTION('DAYNAME', a.appointmentStart), COUNT(a.id) " +
            "FROM Appointment a " +
            "WHERE a.hospitalId = :hospitalId AND a.appointmentStart >= :from AND a.appointmentStart <= :to " +
            "GROUP BY FUNCTION('DAYNAME', a.appointmentStart)")
    List<Object[]> getWeeklyTrendByHospital(@Param("hospitalId") Integer hospitalId,
                                            @Param("from") LocalDateTime from,
                                            @Param("to") LocalDateTime to);

    /** Weekly trend — all hospitals (superadmin) */
    @Query("SELECT FUNCTION('DAYNAME', a.appointmentStart), COUNT(a.id) " +
            "FROM Appointment a " +
            "WHERE a.appointmentStart >= :from AND a.appointmentStart <= :to " +
            "GROUP BY FUNCTION('DAYNAME', a.appointmentStart)")
    List<Object[]> getWeeklyTrendAll(@Param("from") LocalDateTime from,
                                     @Param("to") LocalDateTime to);

    /** Monthly trend (last 6 months) for a hospital */
    @Query("SELECT FUNCTION('MONTH', a.appointmentStart), COUNT(a.id) " +
            "FROM Appointment a " +
            "WHERE a.hospitalId = :hospitalId AND a.appointmentStart >= :from " +
            "GROUP BY FUNCTION('MONTH', a.appointmentStart) " +
            "ORDER BY FUNCTION('MONTH', a.appointmentStart)")
    List<Object[]> getMonthlyTrendByHospital(@Param("hospitalId") Integer hospitalId,
                                             @Param("from") LocalDateTime from);

    /** Monthly trend — all hospitals */
    @Query("SELECT FUNCTION('MONTH', a.appointmentStart), COUNT(a.id) " +
            "FROM Appointment a " +
            "WHERE a.appointmentStart >= :from " +
            "GROUP BY FUNCTION('MONTH', a.appointmentStart) " +
            "ORDER BY FUNCTION('MONTH', a.appointmentStart)")
    List<Object[]> getMonthlyTrendAll(@Param("from") LocalDateTime from);

    /** Monthly trend for a doctor */
    @Query("SELECT FUNCTION('MONTH', a.appointmentStart), COUNT(a.id) " +
            "FROM Appointment a " +
            "WHERE a.doctorId = :doctorId AND a.appointmentStart >= :from " +
            "GROUP BY FUNCTION('MONTH', a.appointmentStart)")
    List<Object[]> getMonthlyTrendByDoctor(@Param("doctorId") Integer doctorId,
                                           @Param("from") LocalDateTime from);

    /** Hourly distribution for today */
    @Query("SELECT FUNCTION('HOUR', a.appointmentStart), COUNT(a.id) " +
            "FROM Appointment a " +
            "WHERE a.hospitalId = :hospitalId AND a.appointmentStart >= :from AND a.appointmentStart <= :to " +
            "GROUP BY FUNCTION('HOUR', a.appointmentStart)")
    List<Object[]> getHourlyDistributionByHospital(@Param("hospitalId") Integer hospitalId,
                                                   @Param("from") LocalDateTime from,
                                                   @Param("to") LocalDateTime to);

    /** Hourly distribution for doctor today */
    @Query("SELECT FUNCTION('HOUR', a.appointmentStart), COUNT(a.id) " +
            "FROM Appointment a " +
            "WHERE a.doctorId = :doctorId AND a.appointmentStart >= :from AND a.appointmentStart <= :to " +
            "GROUP BY FUNCTION('HOUR', a.appointmentStart)")
    List<Object[]> getHourlyDistributionByDoctor(@Param("doctorId") Integer doctorId,
                                                 @Param("from") LocalDateTime from,
                                                 @Param("to") LocalDateTime to);

    /** Distinct patient count for a doctor */
    @Query("SELECT COUNT(DISTINCT a.patientId) FROM Appointment a WHERE a.doctorId = :doctorId")
    Integer getDistinctPatientCountByDoctor(@Param("doctorId") Integer doctorId);

    /** Upcoming appointments for a doctor */
    @Query("SELECT COUNT(a.id) FROM Appointment a WHERE a.doctorId = :doctorId AND a.appointmentStart > :now AND a.status != 'CANCELLED'")
    Integer getUpcomingAppointmentCountByDoctor(@Param("doctorId") Integer doctorId,
                                                @Param("now") LocalDateTime now);

    /** Today's consultations for a doctor */
    @Query("SELECT COUNT(c.id) FROM Consultation c WHERE c.doctorId = :doctorId AND c.encounter.startTime >= :from AND c.encounter.startTime <= :to")
    Integer getTodaysConsultationsForDoctor(@Param("doctorId") Integer doctorId,
                                            @Param("from") LocalDateTime from,
                                            @Param("to") LocalDateTime to);

    /** Recent appointments for activity feed */
    @Query("SELECT a FROM Appointment a WHERE a.hospitalId = :hospitalId ORDER BY a.createdAt DESC")
    List<Appointment> findRecentByHospital(@Param("hospitalId") Integer hospitalId, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId ORDER BY a.createdAt DESC")
    List<Appointment> findRecentByDoctor(@Param("doctorId") Integer doctorId, Pageable pageable);
}