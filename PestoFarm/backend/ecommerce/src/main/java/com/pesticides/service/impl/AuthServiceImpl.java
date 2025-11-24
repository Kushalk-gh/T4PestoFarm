package com.pesticides.service.impl;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List; // Required for OTP expiration check

import org.springframework.mail.MailException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service; // Added for exception handling
import org.springframework.transaction.annotation.Transactional;

import com.pesticides.config.JwtProvider;
import com.pesticides.domain.USER_ROLE;
import com.pesticides.modal.Cart;
import com.pesticides.modal.Scientist;
import com.pesticides.modal.Seller;
import com.pesticides.modal.User;
import com.pesticides.modal.VerificationCode;
import com.pesticides.repository.CartRepository;
import com.pesticides.repository.ScientistRepository;
import com.pesticides.repository.SellerRepository;
import com.pesticides.repository.UserRepository;
import com.pesticides.repository.VerificationCodeRepository;
import com.pesticides.request.LoginRequest;
import com.pesticides.response.AuthResponse;
import com.pesticides.response.SignupRequest;
import com.pesticides.service.AuthService;
import com.pesticides.service.EmailService;
import com.pesticides.utils.OtpUtil;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CartRepository cartRepository;
    private final JwtProvider jwtProvider;
    private final VerificationCodeRepository verificationCodeRepository;
    private final EmailService emailService;
    private final CustomUserServiceImpl customUserService; // Assuming CustomUserServiceImpl exists
    private final SellerRepository sellerRepository;
    private final ScientistRepository scientistRepository;

    @Override
    public String createUser(SignupRequest req) throws Exception {

        VerificationCode verificationCode = verificationCodeRepository.findByEmail(req.getEmail());

        if(verificationCode == null){
            throw new Exception("Verification code not found. Please request OTP.");
        }
        
        // 1. Check Expiry Time
        if (verificationCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            verificationCodeRepository.delete(verificationCode);
            throw new Exception("OTP has expired. Please request a new one.");
        }

        // 2. Check OTP Match
        if(!verificationCode.getOtp().equals(req.getOtp())){
            throw new Exception("Wrong OTP.");
        }
        
        // Verification successful, delete code to prevent reuse
        verificationCodeRepository.delete(verificationCode);

        User user = userRepository.findByEmail(req.getEmail());

        if (user == null){

            User createdUser = new User();
            createdUser.setEmail(req.getEmail());
            createdUser.setFullname(req.getFullName()); // Assuming getFullName exists
        createdUser.setRole(USER_ROLE.ROLE_USER);
            createdUser.setMobile("1234567890");
            createdUser.setPassword(passwordEncoder.encode(req.getOtp())); // Using OTP as initial password
            createdUser.setEmailVerified(true); // Mark as verified
            
            user = userRepository.save(createdUser);
            
            Cart cart = new Cart();
            cart.setUser(user);
            cartRepository.save(cart);
        }
        
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(USER_ROLE.ROLE_USER.toString()));
        Authentication authentication = new UsernamePasswordAuthenticationToken(req.getEmail(), null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        return jwtProvider.generateToken(authentication);

    }

    /**
     * Sends an OTP for login or signup.
     * Uses the updated sendVerificationOtpEmail method.
     */
    @Override
    public void sentLoginOtp(String email, USER_ROLE role) throws Exception {
        
        String SIGNING_PREFIX = "signing_";
        String actualEmail = email;

        if (email.startsWith(SIGNING_PREFIX)) {
            actualEmail = email.substring(SIGNING_PREFIX.length());

            if (role.equals(USER_ROLE.ROLE_SELLER)) {
                Seller seller = sellerRepository.findByEmail(actualEmail);
                if (seller == null) {
                    throw new Exception("Seller not found");
                }
            } else {
                User user = userRepository.findByEmail(actualEmail);
                if (user == null) {
                    throw new Exception("User not exist with provided email");
                }
            }
        }

        VerificationCode existingCode = verificationCodeRepository.findByEmail(actualEmail);

        if (existingCode != null) {
            verificationCodeRepository.delete(existingCode);
        }
        
        String otp = "123456"; // Fixed OTP for testing purposes

        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setOtp(otp);
        verificationCode.setEmail(actualEmail);
        // Set creation and expiry time (5 minutes validity)
        verificationCode.setCreatedAt(LocalDateTime.now());
        verificationCode.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        verificationCodeRepository.save(verificationCode);

        String subject = "Pestofarm Login/Signup OTP";
        String text = "Your login/signup OTP is: " + otp + ". This code is valid for 5 minutes.";

        // CRITICAL CHANGE: Using the new method signature
        try {
            emailService.sendVerificationOtpEmail(actualEmail, otp, subject, text);
        } catch (MailException | MessagingException e) {
            // Re-throw as a runtime exception or a checked exception appropriate for your architecture
            throw new RuntimeException("Failed to send login OTP email.", e);
        }
    }

    @Override
    public AuthResponse signing(LoginRequest req) {
        String username = req.getEmail();
        String otp = req.getOtp();

        Authentication authentication = authenticate(username, otp);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtProvider.generateToken(authentication);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setJwt(token);
        authResponse.setMessage("Login success");

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String roleName = authorities.isEmpty() ? null : authorities.iterator().next().getAuthority();

        authResponse.setRole(USER_ROLE.valueOf(roleName));
        return authResponse;
    }

    private Authentication authenticate(String usernameWithPrefix, String otp) {
        
        UserDetails userDetails = customUserService.loadUserByUsername(usernameWithPrefix);
        
        String actualUsername = usernameWithPrefix;
        final String SELLER_PREFIX = "seller_";

        if(usernameWithPrefix.startsWith(SELLER_PREFIX)){
            actualUsername = usernameWithPrefix.substring(SELLER_PREFIX.length());
        }

        if(userDetails == null){
            throw new BadCredentialsException("Invalid username or user not found.");
        }

        VerificationCode verificationCode = verificationCodeRepository.findByEmail(actualUsername);

        if(verificationCode == null){
            throw new BadCredentialsException("Invalid username or OTP.");
        }
        
        // 1. Check Expiration
        if (verificationCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            verificationCodeRepository.delete(verificationCode);
            throw new BadCredentialsException("OTP has expired. Please request a new one.");
        }

        // 2. Check OTP Match
        if(!verificationCode.getOtp().equals(otp)){
            throw new BadCredentialsException("Wrong OTP.");
        }
        
        // OTP is valid and not expired, consume it (one-time use)
        verificationCodeRepository.delete(verificationCode);

        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    @Override
    public String createSeller(SignupRequest req) throws Exception {

        VerificationCode verificationCode = verificationCodeRepository.findByEmail(req.getEmail());

        if(verificationCode == null){
            throw new Exception("Verification code not found. Please request OTP.");
        }

        // 1. Check Expiry Time
        if (verificationCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            verificationCodeRepository.delete(verificationCode);
            throw new Exception("OTP has expired. Please request a new one.");
        }

        // 2. Check OTP Match
        if(!verificationCode.getOtp().equals(req.getOtp())){
            throw new Exception("Wrong OTP.");
        }

        // Verification successful, delete code to prevent reuse
        verificationCodeRepository.delete(verificationCode);

        Seller seller = sellerRepository.findByEmail(req.getEmail());

        if (seller == null){

            Seller createdSeller = new Seller();
            createdSeller.setEmail(req.getEmail());
            createdSeller.setSellerName(req.getFullName()); // Assuming getFullName exists
            createdSeller.setRole(USER_ROLE.ROLE_SELLER);
            createdSeller.setMobile(req.getMobile());
            createdSeller.setPassword(passwordEncoder.encode(req.getOtp())); // Using OTP as initial password
            createdSeller.setEmailVerified(true); // Mark as verified

            seller = sellerRepository.save(createdSeller);
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(USER_ROLE.ROLE_SELLER.toString()));
        Authentication authentication = new UsernamePasswordAuthenticationToken(req.getEmail(), null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        return jwtProvider.generateToken(authentication);

    }

    @Override
    @Transactional
    public String createScientist(SignupRequest req) throws Exception {

        VerificationCode verificationCode = verificationCodeRepository.findByEmail(req.getEmail());

        if(verificationCode == null){
            throw new Exception("Verification code not found. Please request OTP.");
        }

        // 1. Check Expiry Time
        if (verificationCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            verificationCodeRepository.delete(verificationCode);
            throw new Exception("OTP has expired. Please request a new one.");
        }

        // 2. Check OTP Match
        if(!verificationCode.getOtp().equals(req.getOtp())){
            throw new Exception("Wrong OTP.");
        }

        // Verification successful, delete code to prevent reuse
        verificationCodeRepository.delete(verificationCode);

        Scientist scientist = scientistRepository.findByEmail(req.getEmail());

        if (scientist == null){

            Scientist createdScientist = new Scientist();
            createdScientist.setEmail(req.getEmail());
            createdScientist.setScientistName(req.getFullName());
            createdScientist.setRole(USER_ROLE.ROLE_SCIENTIST);
            createdScientist.setMobile(req.getMobile());
            createdScientist.setPassword(passwordEncoder.encode(req.getOtp())); // Using OTP as initial password
            createdScientist.setEmailVerified(true); // Mark as verified

            scientist = scientistRepository.save(createdScientist);
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(USER_ROLE.ROLE_SCIENTIST.toString()));
        Authentication authentication = new UsernamePasswordAuthenticationToken(req.getEmail(), null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        return jwtProvider.generateToken(authentication);

    }

    @Override
public String generateToken(String email, USER_ROLE role) {
    List<GrantedAuthority> authorities = new ArrayList<>();
    authorities.add(new SimpleGrantedAuthority(role.toString()));

    // Create an unauthenticated token just for JWT generation purposes
    Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, authorities);

    return jwtProvider.generateToken(authentication);
}

}
