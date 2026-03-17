package com.hms.authservice.service.impl;

import com.hms.authservice.entity.Role;
import com.hms.authservice.repository.RoleRepository;
import com.hms.authservice.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RoleServiceImpl implements RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public Map<Integer, String> getRoles() {
        Map<Integer,String> roles = new HashMap<>();

        List<Role> responses=roleRepository.findAll();
        responses.forEach(response -> roles.put(response.getId(), response.getName()));
        return roles;
    }
}
