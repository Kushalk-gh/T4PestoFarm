package com.pesticides.service.impl;

import javax.crypto.SecretKey;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pesticides.config.JWT_CONSTANT;
import com.pesticides.domain.USER_ROLE;
import com.pesticides.exception.UserException;
import com.pesticides.modal.User;
import com.pesticides.repository.UserRepository;
import com.pesticides.service.UserService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User findUserByJwtToken(String jwt) {
        try {
            // Extract token from Authorization header (remove "Bearer " prefix)
            String token = jwt;
            if (jwt.startsWith("Bearer ")) {
                token = jwt.substring(7).trim();
            }

            // Extract email from JWT token
            SecretKey key = Keys.hmacShaKeyFor(JWT_CONSTANT.SECRET_KEY.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();

            String email = String.valueOf(claims.get("email"));

            // Find user by email
            return findUserByEmail(email);
        } catch (Exception e) {
            throw new RuntimeException("Invalid JWT token: " + e.getMessage());
        }
    }

    @Override
    public User findUserByEmail(String email) throws Exception {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UserException("User not found with email: " + email);
        }
        return user;
    }

    @Override
    public User verifyEmail(String email, String otp) throws Exception {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'verifyEmail'");
    }

    @Override
    public User updateUserProfile(String jwt, User updatedUser) throws Exception {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'updateUserProfile'");
    }

    @Override
    public boolean checkPassword(User user, String rawPassword) {
        // Fixed: Matches raw password against the user's encoded password
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }

    @Override
    public User changePassword(String jwt, String currentPassword, String newPassword, String otp) throws Exception {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'changePassword'");
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