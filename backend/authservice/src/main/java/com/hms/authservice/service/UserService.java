package com.hms.authservice.service;

import com.hms.authservice.dto.RegisterRequest;
import com.hms.authservice.dto.UserDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface UserService {
    Page<UserDto> getUsers(Pageable pageable, String token, Integer hospitalId);

    String updateUser(Integer id, @Valid RegisterRequest request);

    void deleteUser(Integer id);

//    Page<UserDto> searchDoctors(String query, Integer hospitalId, Pageable pageable);

    List<UserDto> search(String query, Integer hospitalId);

    UserDto getUserById(Integer id);

    List<UserDto> getUserByIds(List<Integer> ids);

    Map<String, Integer> getUserCount(Integer hospitalId);
}
