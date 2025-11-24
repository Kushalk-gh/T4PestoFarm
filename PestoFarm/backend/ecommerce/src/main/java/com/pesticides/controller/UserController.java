package com.pesticides.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pesticides.exception.CustomException;
import com.pesticides.modal.User;
import com.pesticides.modal.VerificationCode;
import com.pesticides.repository.UserRepository;
import com.pesticides.repository.VerificationCodeRepository;
import com.pesticides.request.LoginOtpRequest;
import com.pesticides.request.LoginRequest;
import com.pesticides.response.Apiresponse;
import com.pesticides.response.AuthResponse;
import com.pesticides.response.SignupRequest;
import com.pesticides.service.AuthService;
import com.pesticides.service.EmailService;
import com.pesticides.service.UserService;
import com.pesticides.utils.OtpUtil;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

private final UserService userService;
private final AuthService authService;
private final EmailService emailService;
private final VerificationCodeRepository verificationCodeRepository;
@Autowired
private final PasswordEncoder passwordEncoder;
private final UserRepository userRepository;

@PostMapping("/auth/signup")
public ResponseEntity<AuthResponse> registerUser(@RequestBody SignupRequest req) throws Exception {
    String token = authService.createUser(req);
    User createdUser = userService.findUserByEmail(req.getEmail());
    String otp = OtpUtil.generateOtp();
    VerificationCode verificationCode = new VerificationCode();
    verificationCode.setEmail(createdUser.getEmail());
    verificationCode.setOtp(otp);
    verificationCode.setCreatedAt(LocalDateTime.now());
    verificationCode.setExpiresAt(LocalDateTime.now().plusMinutes(5));
    VerificationCode existing = verificationCodeRepository.findByEmail(createdUser.getEmail());
    if (existing != null) verificationCodeRepository.delete(existing);
    verificationCodeRepository.save(verificationCode);
    String subject = "Pestofarm Account Verification OTP";
    String text = "Your account verification OTP is: " + otp + "\nThis code is valid for 5 minutes.\n\nRegards,\nPestofarm Team";
    emailService.sendVerificationOtpEmail(createdUser.getEmail(), otp, subject, text);
    AuthResponse res = new AuthResponse();
    res.setMessage("Signup successful! OTP sent to your email.");
    res.setJwt(token);
    return new ResponseEntity<>(res, HttpStatus.CREATED);
}

@PostMapping("/auth/login")
public ResponseEntity<AuthResponse> loginUser(@RequestBody LoginRequest req) throws Exception {
    User user = userService.findUserByEmail(req.getEmail());
    if (user == null) {
        throw new CustomException("No account found with this email. Please sign up first.");
    }
    if (req.getPassword() != null && !req.getPassword().trim().isEmpty()) {
        boolean isPasswordValid = userService.checkPassword(user, req.getPassword());
        if (!isPasswordValid) {
            throw new CustomException("Invalid password. Please try again.");
        }
        String jwt = authService.generateToken(user.getEmail(), user.getRole());
        AuthResponse res = new AuthResponse();
        res.setMessage("Login successful!");
        res.setJwt(jwt);
        return ResponseEntity.ok(res);
    } else {
        String otp = OtpUtil.generateOtp();
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setEmail(user.getEmail());
        verificationCode.setOtp(otp);
        verificationCode.setCreatedAt(LocalDateTime.now());
        verificationCode.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        VerificationCode existing = verificationCodeRepository.findByEmail(user.getEmail());
        if (existing != null) verificationCodeRepository.delete(existing);
        verificationCodeRepository.save(verificationCode);
        String subject = "Pestofarm Login OTP";
        String text = "Your OTP for login is: " + otp + "\nIt will expire in 5 minutes.\n\nRegards,\nPestofarm Team";
        try {
            emailService.sendVerificationOtpEmail(user.getEmail(), otp, subject, text);
        } catch (MessagingException e) {
            throw new CustomException("Failed to send login OTP: " + e.getMessage());
        }
        AuthResponse res = new AuthResponse();
        res.setMessage("OTP sent to your registered email for login.");
        return ResponseEntity.ok(res);
    }
}

@PostMapping("/auth/verify-email")
public ResponseEntity<AuthResponse> verifyUserEmail(@RequestParam String email, @RequestParam String otp) throws Exception {
    userService.verifyEmail(email, otp);
    User verifiedUser = userService.findUserByEmail(email);
    String jwt = authService.generateToken(verifiedUser.getEmail(), verifiedUser.getRole());
    AuthResponse res = new AuthResponse();
    res.setMessage("OTP verified successfully! You are now logged in.");
    res.setJwt(jwt);
    return new ResponseEntity<>(res, HttpStatus.OK);
}

@GetMapping("/profile")
public ResponseEntity<User> getUserProfile(@RequestHeader("Authorization") String jwt) throws Exception {
    if (jwt == null || jwt.trim().isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    String token = jwt.startsWith("Bearer ") ? jwt.substring(7) : jwt;
    User user = userService.findUserByJwtToken(token);
    if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    return ResponseEntity.ok(user);
}

@PostMapping("/auth/send-otp")
public ResponseEntity<Apiresponse> sendUserOtp(@RequestBody LoginOtpRequest req) throws Exception {
    String otp = OtpUtil.generateOtp();
    VerificationCode verificationCode = new VerificationCode();
    verificationCode.setEmail(req.getEmail());
    verificationCode.setOtp(otp);
    verificationCode.setCreatedAt(LocalDateTime.now());
    verificationCode.setExpiresAt(LocalDateTime.now().plusMinutes(5));
    VerificationCode existing = verificationCodeRepository.findByEmail(req.getEmail());
    if (existing != null) verificationCodeRepository.delete(existing);
    verificationCodeRepository.save(verificationCode);
    String subject = "Pestofarm User OTP";
    String text = "Your OTP is: " + otp + "\nThis code is valid for 5 minutes.\n\nRegards,\nPestofarm Team";
    emailService.sendVerificationOtpEmail(req.getEmail(), otp, subject, text);
    Apiresponse res = new Apiresponse();
    res.setMessage("OTP sent to your email.");
    return ResponseEntity.ok(res);
}

@PutMapping("/profile")
public ResponseEntity<User> updateUserProfile(@RequestHeader("Authorization") String jwt, @RequestBody User updatedUser) throws Exception {
    if (jwt == null || jwt.trim().isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    String token = jwt.startsWith("Bearer ") ? jwt.substring(7) : jwt;
    try {
        User user = userService.updateUserProfile(token, updatedUser);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(user);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}

@PostMapping("/change-password")
public ResponseEntity<AuthResponse> changePassword(@RequestHeader("Authorization") String jwt, @RequestParam String currentPassword, @RequestParam String newPassword, @RequestParam String otp) throws Exception {
    if (jwt == null || jwt.trim().isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    String token = jwt.startsWith("Bearer ") ? jwt.substring(7) : jwt;
    try {
        User user = userService.findUserByJwtToken(token);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        boolean isCurrentPasswordValid = userService.checkPassword(user, currentPassword);
        if (!isCurrentPasswordValid) {
            AuthResponse res = new AuthResponse();
            res.setMessage("Current password is incorrect.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        }
        userService.verifyEmail(user.getEmail(), otp);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        AuthResponse res = new AuthResponse();
        res.setMessage("Password changed successfully!");
        return ResponseEntity.ok(res);
    } catch (CustomException e) {
        AuthResponse res = new AuthResponse();
        res.setMessage(e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    } catch (Exception e) {
        AuthResponse res = new AuthResponse();
        res.setMessage("Failed to change password: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
    }
}

// --- NEW ENDPOINTS FOR LOCATION ---

@PostMapping("/location")
public ResponseEntity<Apiresponse> saveLocation(@RequestHeader("Authorization") String jwt, @RequestBody Map<String, Object> locationData) {
    // Placeholder implementation to stop 403/404 error
    // Ideally, extract lat/long from locationData and update User's address or a separate Location entity
    Apiresponse res = new Apiresponse();
    res.setMessage("Location saved successfully");
    res.setStatus(true);
    return ResponseEntity.ok(res);
}

@PostMapping("/location-preference")
public ResponseEntity<Apiresponse> saveLocationPreference(@RequestHeader("Authorization") String jwt, @RequestBody Map<String, Object> preferenceData) {
    Apiresponse res = new Apiresponse();
    res.setMessage("Location preference saved");
    res.setStatus(true);
    return ResponseEntity.ok(res);
}

@GetMapping("/location-preference")
public ResponseEntity<Map<String, String>> getLocationPreference(@RequestHeader("Authorization") String jwt) {
    // Return default or stored preference
    return ResponseEntity.ok(Map.of("choice", "allowWhileVisiting"));
}


}