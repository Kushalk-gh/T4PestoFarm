package com.pesticides.service;

import com.pesticides.modal.Product;
import com.pesticides.modal.User;
import java.util.List;

public interface AdminService {
    List<User> getAllUsers();
    User updateUserRole(Long userId, String role);
    void deleteUser(Long userId);
    List<Product> getAllProducts();
}
