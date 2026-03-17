package com.hms.authservice.controller;

import com.hms.authservice.dto.ApiResponse;
import com.hms.authservice.dto.RegisterRequest;
import com.hms.authservice.dto.UserDto;
import com.hms.authservice.service.AuthService;
import com.hms.authservice.service.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN')")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        try{
            log.info("/api/user/register api is hit " + request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(authService.register(request));
        } catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN')")
    public ResponseEntity<ApiResponse<?>> getAllUsers(Pageable pageable,  @RequestHeader("Authorization") String token, @RequestParam(value = "hospital", required = false) Integer hospitalId){
        try{
            log.info("request to fetch user page with page Number " + pageable.getPageNumber());
            Page<UserDto> userDtoPage = userService.getUsers(pageable,token,hospitalId);
            return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Users Fetched ", userDtoPage));

        } catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/internal/{id}")
    public ApiResponse getUserById(@PathVariable("id") Integer id){
        try{
            log.info("/api/users/internal/id is called ");
            UserDto userDto  = userService.getUserById(id);
            return ApiResponse.success("user fetched with id : " + id, userDto);
        }catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/internal/ids")
    public ApiResponse getUserByIds(@RequestBody List<Integer> ids){
        try{
            log.info("/api/users/internal/id is called ");
            List<UserDto> userDto  = userService.getUserByIds(ids);
            return ApiResponse.success("user fetched with id : ", userDto);
        }catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN')")
    public ResponseEntity<ApiResponse<?>> updateUser(@PathVariable("id") Integer id, @Valid @RequestBody RegisterRequest request){
        try{
            log.info("request to update user with id :" + id);
            String response = userService.updateUser(id,request);
            return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("user updated with id: " + id,response ));
        } catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }



    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN')")
    public ResponseEntity<ApiResponse<?>> deleteUser(@PathVariable("id") Integer id){
        try{
            log.info("Request to delete the user with id: " + id);

            userService.deleteUser(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success("User Deleted with id: "+ id, id));

        }catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','FRONTDESK')")
    public ResponseEntity<ApiResponse<?>> searchDoctors(
            @RequestParam("query") String query,
            @RequestParam("hospitalId") Integer hospitalId){
        try{
            log.info("Request to search with query: " + query + " in hospital: " + hospitalId);
//            Page<UserDto> userDtoPage = userService.searchDoctors(query, hospitalId, pageable);
                List<UserDto> userDtoList = userService.search(query,hospitalId);
                for(UserDto dto : userDtoList){
                    System.out.println("DTODTO" + dto.getUserId());
                }
            return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Doctors fetched successfully", userDtoList));
        } catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

}
