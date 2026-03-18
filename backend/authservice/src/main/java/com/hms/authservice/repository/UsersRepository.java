package com.hms.authservice.repository;

import com.hms.authservice.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsersRepository extends JpaRepository<Users, Integer> {

    Optional<Users> findByUsername(String username);

    Optional<Users> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM Users u WHERE u.username = :val OR u.email = :val")
    Optional<Users> findByUsernameOrEmail(String val);

    @Query("SELECT u FROM Users u WHERE u.hospitalId = :hospitalId")
    Page<Users> findAllByUserType(Pageable pageable, Integer hospitalId);

//    @Query("SELECT u FROM Users u JOIN u.roles r WHERE r.name = 'DOCTOR' " +
//           "AND u.hospitalId = :hospitalId " +
//           "AND (LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
//           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) " +
//           "OR LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')))")
//    Page<Users> searchDoctors(String query, Integer hospitalId, Pageable pageable);

//    @Query("SELECT u FROM Users u WHERE u.hospitalId = :hospitalId AND (u.firstName LIKE '%:query%' OR u.lastName LIKE '%:query%')")
//    Page<Users> searchDoctors(String query, Integer hospitalId, Pageable pageable);SELECT * FROM roles;


    @Query("SELECT u FROM Users u JOIN u.roles r WHERE r.name = 'ROLE_DOCTOR' AND u.hospitalId = :hospitalId AND (u.firstName LIKE CONCAT('%', :query, '%') OR u.lastName LIKE CONCAT('%', :query, '%'))")
    List<Users> search(@Param("query") String query, @Param("hospitalId") Integer hospitalId);

    @Query("SELECT COUNT(u) FROM Users u WHERE u.hospitalId = :hospitalId AND u.status = 'active' ")
    Integer getTotalUSer(@Param("hospitalId") Integer hospitalId);

    @Query("SELECT COUNT(u) FROM Users u WHERE u.status = 'active' ")
    Integer getTotalUSer();

    @Query("SELECT COUNT(u) FROM Users u JOIN u.roles r WHERE u.hospitalId = :hospitalId and r.id = 3 AND u.status = 'active'")
    Integer getTotalDoctorUSer(@Param("hospitalId") Integer hospitalId);

    @Query("SELECT COUNT(u) FROM Users u JOIN u.roles r WHERE r.id = 3 AND u.status = 'active'")
    Integer getTotalDoctorUSer();

    @Query("SELECT COUNT(u) FROM Users u JOIN u.roles r WHERE u.hospitalId = :hospitalId and r.id = 4 AND u.status = 'active'")
    Integer getTotalNurse(Integer hospitalId);

    @Query("SELECT COUNT(u) FROM Users u JOIN u.roles r WHERE r.id = 4 AND u.status = 'active'")
    Integer getTotalNurse();


//    @Query("SELECT u FROM Users u WHERE u.id IN :ids")
//    List<Users> findAll(@Param("ids") List<Integer> ids);
}
