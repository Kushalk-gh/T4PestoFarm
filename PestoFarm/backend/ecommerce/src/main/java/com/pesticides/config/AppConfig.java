package com.pesticides.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.lang.NonNull;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
@EnableWebSecurity
public class AppConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.sessionManagement(management -> management.sessionCreationPolicy(
                SessionCreationPolicy.STATELESS)).authorizeHttpRequests(authorize -> authorize

                        // --- PUBLIC ENDPOINTS (NO AUTH REQUIRED) ---
                        .requestMatchers("/auth/signing").permitAll()
                        .requestMatchers("/auth/signup").permitAll()
                        .requestMatchers("/auth/sent/login-signup-otp").permitAll()

                        // User login endpoints
                        .requestMatchers("/api/users/auth/login").permitAll()
                        .requestMatchers("/api/users/auth/signup").permitAll()
                        .requestMatchers("/api/users/auth/send-otp").permitAll()
                        
                        // Seller & Scientist endpoints
                        .requestMatchers("/api/sellers/auth/**").permitAll()
                        .requestMatchers("/api/scientists/auth/**").permitAll()

                        // General auth path fallback
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        // Allow public GET access to products and scientists
                        .requestMatchers(HttpMethod.GET, "/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/scientists/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/scientists/**").permitAll()

                        // --- ADMIN ENDPOINTS (ROLE_ADMIN REQUIRED) ---
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")

                        // --- AUTHENTICATED ENDPOINTS ---
                        .requestMatchers("/api/**").authenticated()

                        // --- EVERYTHING ELSE IS PUBLIC ---
                        .anyRequest().permitAll()

                ).addFilterAfter(new JwtTokenValidator(), BasicAuthenticationFilter.class)
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()));
        return http.build();
    }

    private CorsConfigurationSource corsConfigurationSource() {
        return new CorsConfigurationSource() {
            @Override
            public CorsConfiguration getCorsConfiguration(@NonNull HttpServletRequest request) {

                CorsConfiguration cfg = new CorsConfiguration();
                cfg.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:63327"));
                cfg.setAllowedMethods(List.of("*"));
                cfg.setAllowedHeaders(List.of("*"));
                cfg.setAllowCredentials(true);
                cfg.setExposedHeaders(List.of("Authorization"));
                cfg.setMaxAge(3600L);
                return cfg;
            }
        };
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}