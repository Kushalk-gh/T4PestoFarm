package com.pesticides.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.boot.context.event.ApplicationReadyEvent;

import com.pesticides.domain.USER_ROLE;
import com.pesticides.modal.User;
import com.pesticides.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AdminSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAILS:admin@pestofarm.com}")
    private String adminEmails;

    @EventListener(ApplicationReadyEvent.class)
    public void seedAdmins() {
        try {
            if (adminEmails == null || adminEmails.isBlank()) return;
            List<String> emails = Arrays.stream(adminEmails.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .toList();

            for (String email : emails) {
                User existing = userRepository.findByEmail(email);
                if (existing == null) {
                    User admin = new User();
                    admin.setEmail(email);
                    // default password - please change in production
                    admin.setPassword(passwordEncoder.encode("admin@213"));
                    admin.setFullname("Admin");
                    admin.setRole(USER_ROLE.ROLE_ADMIN);
                    admin.setEmailVerified(true);
                    userRepository.save(admin);
                    System.out.println("[AdminSeeder] Created admin user: " + email);
                } else if (existing.getRole() != USER_ROLE.ROLE_ADMIN) {
                    existing.setRole(USER_ROLE.ROLE_ADMIN);
                    existing.setEmailVerified(true);
                    userRepository.save(existing);
                    System.out.println("[AdminSeeder] Updated existing user to admin: " + email);
                } else {
                    System.out.println("[AdminSeeder] Admin already exists: " + email);
                }
            }
        } catch (Exception e) {
            System.err.println("[AdminSeeder] Error seeding admin users: " + e.getMessage());
        }
    }
}
