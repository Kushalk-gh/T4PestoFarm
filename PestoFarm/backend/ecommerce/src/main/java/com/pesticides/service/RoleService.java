package com.pesticides.service;

import com.pesticides.modal.Role;

import java.util.List;

public interface RoleService {
    Role createRole(Role role);
    List<Role> getAllRoles();
    Role getRoleById(Long id);
    Role getRoleByName(String name);
    void deleteRole(Long id);
}
