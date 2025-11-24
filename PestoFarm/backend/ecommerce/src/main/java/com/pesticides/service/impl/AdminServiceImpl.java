package com.pesticides.service.impl;

import com.pesticides.domain.USER_ROLE;
import com.pesticides.exception.UserException;
import com.pesticides.modal.Product;
import com.pesticides.modal.User;
import com.pesticides.repository.UserRepository;
import com.pesticides.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User createAdminUser(User adminUser) {
        // Handle potential error with RuntimeException since Interface doesn't allow Checked Exception
        if (userRepository.findByEmail(adminUser.getEmail()) != null) {
            throw new RuntimeException("Admin user already exists with email: " + adminUser.getEmail());
        }
        adminUser.setPassword(passwordEncoder.encode(adminUser.getPassword()));
        adminUser.setRole(USER_ROLE.ROLE_ADMIN);
        adminUser.setEmailVerified(true);
        return userRepository.save(adminUser);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<Product> getAllProducts() {
        // Returning empty list to satisfy interface
        return List.of(); 
    }

    // Helper method (Not overridden) - Can throw Exception internally
    public User findUserById(Long userId) throws UserException {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found with id: " + userId));
    }
    
    public User getUserById(Long userId) {
         try {
            return findUserById(userId);
         } catch (UserException e) {
            throw new RuntimeException(e.getMessage());
         }
    }

    @Override
    public void deleteUser(Long userId) {
        try {
            User user = findUserById(userId);
            userRepository.delete(user);
        } catch (UserException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    public User updateUserRole(Long userId, String roleName) {
        try {
            User user = findUserById(userId);

            if (roleName.equals("ROLE_ADMIN")) {
                user.setRole(USER_ROLE.ROLE_ADMIN);
            } else if (roleName.equals("ROLE_SELLER")) {
                user.setRole(USER_ROLE.ROLE_SELLER);
            } else if (roleName.equals("ROLE_SCIENTIST")) {
                user.setRole(USER_ROLE.ROLE_SCIENTIST);
            } else {
                user.setRole(USER_ROLE.ROLE_USER);
            }
            return userRepository.save(user);

        } catch (UserException e) {
            throw new RuntimeException(e.getMessage());
        }
    }
}