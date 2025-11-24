package com.pesticides.service.impl;

import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.pesticides.domain.USER_ROLE;
import com.pesticides.modal.Scientist;
import com.pesticides.modal.Seller;
import com.pesticides.modal.User;
import com.pesticides.repository.ScientistRepository;
import com.pesticides.repository.SellerRepository;
import com.pesticides.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final ScientistRepository scientistRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String actualUsername = username;
        final String SELLER_PREFIX = "seller_";
        final String SCIENTIST_PREFIX = "scientist_";

        // --- CASE 1: SELLER LOGIN ---
        if (username.startsWith(SELLER_PREFIX)) {
            actualUsername = username.substring(SELLER_PREFIX.length());
            Seller seller = sellerRepository.findByEmail(actualUsername);
            
            if (seller != null) {
                // Convert Enum to Authority
                List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(USER_ROLE.ROLE_SELLER.toString()));
                
                // Return a Spring Security User object (Safe wrapper)
                return new org.springframework.security.core.userdetails.User(
                        seller.getEmail(), 
                        seller.getPassword(), 
                        authorities
                );
            }

        // --- CASE 2: SCIENTIST LOGIN ---
        } else if (username.startsWith(SCIENTIST_PREFIX)) {
            actualUsername = username.substring(SCIENTIST_PREFIX.length());
            Scientist scientist = scientistRepository.findByEmail(actualUsername);
            
            if (scientist != null) {
                List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(USER_ROLE.ROLE_SCIENTIST.toString()));
                
                return new org.springframework.security.core.userdetails.User(
                        scientist.getEmail(), 
                        scientist.getPassword(), 
                        authorities
                );
            }

        // --- CASE 3: NORMAL USER LOGIN ---
        } else {
            User user = userRepository.findByEmail(actualUsername);
            if (user != null) {
                // Since our User entity implements UserDetails, we can return it directly
                return user;
            }
        }

        throw new UsernameNotFoundException("User not found with email: " + actualUsername);
    }
}