package com.hms.authservice.service.impl;

import com.hms.authservice.dto.HospitalDto;
import com.hms.authservice.dto.RegisterRequest;
import com.hms.authservice.dto.UserDto;
import com.hms.authservice.entity.Role;
import com.hms.authservice.entity.Users;
import com.hms.authservice.feignclient.HospitalFeignClient;
import com.hms.authservice.repository.RoleRepository;
import com.hms.authservice.repository.UsersRepository;
import com.hms.authservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private HospitalFeignClient hospitalFeignClient;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Page<UserDto> getUsers(Pageable pageable, String token, Integer hospitalId) {
        Page<Users> usersPage;

        if(hospitalId != null){
           usersPage = usersRepository.findAllByUserType(pageable,hospitalId);
        }
        else {
            usersPage = usersRepository.findAll(pageable);
        }

        List<Integer> hospitalIds = new ArrayList<>();

        for(Users user : usersPage.getContent()){
            hospitalIds.add(user.getHospitalId());
        }

        List<HospitalDto> hospitalDtos = hospitalFeignClient.getHospitalsByIds(token,hospitalIds);
        System.out.println("hospitals " + hospitalDtos);
        return usersPage.map(users ->{

            HospitalDto hospitalDto = hospitalDtos.stream().filter(dto ->
                    dto.getId() == users.getHospitalId()).findFirst().orElse(null);

                return UserDto.builder()
                        .userId(users.getId())
                        .hospital(hospitalDto)
                        .username(users.getUsername())
                        .email(users.getEmail())
                        .firstName(users.getFirstName())
                        .lastName(users.getLastName())
                        .phone(users.getPhone())
                        .gender(users.getGender().toString())
                        .status(users.getStatus())
                        .dateOfBirth(users.getDateOfBirth())
                        .roles(users.getRoles().stream().map(Role::getId).toList())
                        .build();
                });
    }

    @Override
    public String updateUser(Integer id, RegisterRequest request) {


        Users user = usersRepository.findById(id).orElseThrow(()-> new RuntimeException("USER NOT FOUND"));
        if(!user.getUsername().equalsIgnoreCase(request.getUsername())){
            if (usersRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Username already taken");
            }
        }
        if(!user.getEmail().equalsIgnoreCase(request.getEmail())){
            if (usersRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already registered");
            }
        }

//        if(!user.getPassword().equalsIgnoreCase(passwordEncoder.encode(request.getPassword()))){
//            throw new RuntimeException("Incorrect Password");
//        }

        user.setId(id);
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setHospitalId(request.getHospitalId());
        user.setGender(Users.Gender.valueOf(request.getGender()));
        user.setDateOfBirth(request.getDateOfBirth());
        user.setStatus(request.getStatus());
        // Assign rolesName
        Set<Role> roles = request.getRoles().stream()
                .map(roleId -> roleRepository.findById(roleId)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleId)))
                .collect(Collectors.toSet());
        user.setRoles(roles);

        Users updatedUser = usersRepository.save(user);

        return "User Updated Successfully with id:" + updatedUser.getId();
    }

    @Override
    public void deleteUser(Integer id) {
        Users user = usersRepository.findById(id).orElseThrow(() -> new RuntimeException("User Not Found with id: " + id));

        usersRepository.delete(user);
        return;
    }

    @Override
    public List<UserDto> search(String query, Integer hospitalId) {
        List<Users> userDtoList = usersRepository.search(query,hospitalId);
        System.out.println("Service class");

        return userDtoList.stream().map(user ->
                UserDto.builder().userId(user.getId())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName()).build()
        ).collect(Collectors.toList());

    }

    @Override
    public UserDto getUserById(Integer id) {
        Users user = usersRepository.findById(id).orElseThrow(() -> new RuntimeException("user not found with id: " + id));

        return UserDto.builder()
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    @Override
    public List<UserDto> getUserByIds(List<Integer> ids) {
        List<Users> usersList = usersRepository.findAllById(ids);

        return usersList.stream().map(user ->
                UserDto.builder().userId(user.getId())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName()).build()
        ).collect(Collectors.toList());
    }

//    @Override
//    public Page<UserDto> searchDoctors(String query, Integer hospitalId, Pageable pageable) {
//        Page<Users> usersPage = usersRepository.searchDoctors(query, hospitalId, pageable);
//
//        return usersPage.map(users ->
//                UserDto.builder()
//                        .userId(users.getId())
//                        .username(users.getUsername())
//                        .email(users.getEmail())
//                        .firstName(users.getFirstName())
//                        .lastName(users.getLastName())
//                        .phone(users.getPhone())
//                        .gender(users.getGender().toString())
//                        .status(users.getStatus())
//                        .dateOfBirth(users.getDateOfBirth())
//                        .roles(users.getRoles().stream().map(Role::getId).toList())
//                        .build());
//    }
}
