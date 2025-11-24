package com.pesticides.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pesticides.domain.AccountStatus;
import com.pesticides.exception.CustomException;

import com.pesticides.modal.Scientist;
import com.pesticides.modal.ScientistReport;
import com.pesticides.modal.VerificationCode;
import com.pesticides.repository.VerificationCodeRepository;
import com.pesticides.request.LoginOtpRequest;
import com.pesticides.request.LoginRequest;
import com.pesticides.response.SignupRequest;
import com.pesticides.response.Apiresponse;
import com.pesticides.response.AuthResponse;
import com.pesticides.service.AuthService;
import com.pesticides.service.EmailService;
import com.pesticides.service.ScientistReportService;
import com.pesticides.service.ScientistService;
import com.pesticides.utils.OtpUtil;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/scientists")
public class ScientistController {

    private final ScientistService scientistService;
    private final VerificationCodeRepository verificationCodeRepository;
    private final AuthService authService;
    private final EmailService emailService;
    private final ScientistReportService scientistReportService;

    // 🧩 STEP 1: Send OTP for Scientist Signup/Login
    @PostMapping("/auth/send-otp")
    public ResponseEntity<Apiresponse> sendScientistOtp(@RequestBody LoginOtpRequest req) throws Exception {

        // 1️⃣ Generate OTP (no need to check if scientist exists, as this endpoint is for both signup and login)
        // For signup, scientist doesn't exist yet; for login, we send OTP regardless
        String otp = OtpUtil.generateOtp();
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setEmail(req.getEmail());
        verificationCode.setOtp(otp);
        verificationCode.setCreatedAt(LocalDateTime.now());
        verificationCode.setExpiresAt(LocalDateTime.now().plusMinutes(5));

        // Remove existing OTP if any
        VerificationCode existing = verificationCodeRepository.findByEmail(req.getEmail());
        if (existing != null) verificationCodeRepository.delete(existing);

        verificationCodeRepository.save(verificationCode);

        // 3️⃣ Send Email
        String subject = "Pestofarm Scientist OTP";
        String text = "Your OTP is: " + otp
                + "\nThis code is valid for 5 minutes.\n\nRegards,\nPestofarm Team";

        try {
            emailService.sendVerificationOtpEmail(req.getEmail(), otp, subject, text);
        } catch (MessagingException e) {
            throw new CustomException("Failed to send OTP: " + e.getMessage());
        }

        // 4️⃣ Response
        Apiresponse res = new Apiresponse();
        res.setMessage("OTP sent to your email.");

        return ResponseEntity.ok(res);
    }

    // 🧩 STEP 2: Scientist Registration (Signup)
    @PostMapping("/auth/signup")
    public ResponseEntity<AuthResponse> registerScientist(@RequestBody SignupRequest req) throws Exception {

        // 1️⃣ Create new scientist account
        String token = authService.createScientist(req);

        // 2️⃣ Response (OTP already sent in send-otp endpoint)
        AuthResponse res = new AuthResponse();
        res.setMessage("Signup successful! Please verify your email with OTP.");
        res.setJwt(token); // temporary until verified

        return new ResponseEntity<>(res, HttpStatus.CREATED);
    }

    // 🧩 STEP 2: Scientist Login (OTP or Password)
    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> loginScientist(@RequestBody LoginRequest req) throws Exception {

        // 1️⃣ Find scientist
        Scientist scientist = scientistService.findScientistByEmail(req.getEmail());
        if (scientist == null) {
            throw new CustomException("No scientist found with this email. Please register first.");
        }

        // 2️⃣ Check if password is provided — login directly
        if (req.getPassword() != null && !req.getPassword().isEmpty()) {
            if (!scientistService.checkPassword(scientist, req.getPassword())) {
                throw new CustomException("Invalid password.");
            }

            // Generate JWT after password login
            String jwt = authService.generateToken(scientist.getEmail(), scientist.getRole());
            AuthResponse res = new AuthResponse();
            res.setMessage("Login successful via password.");
            res.setJwt(jwt);
            return ResponseEntity.ok(res);
        }

        // 3️⃣ Else, login via OTP (send new OTP)
        String otp = OtpUtil.generateOtp();
        VerificationCode code = new VerificationCode();
        code.setEmail(scientist.getEmail());
        code.setOtp(otp);
        code.setCreatedAt(LocalDateTime.now());
        code.setExpiresAt(LocalDateTime.now().plusMinutes(5));

        VerificationCode existing = verificationCodeRepository.findByEmail(scientist.getEmail());
        if (existing != null) verificationCodeRepository.delete(existing);

        verificationCodeRepository.save(code);

        String subject = "Pestofarm Scientist Login OTP";
        String text = "Your OTP for login is: " + otp
                + "\nIt will expire in 5 minutes.\n\nRegards,\nPestofarm Team";

        try {
            emailService.sendVerificationOtpEmail(scientist.getEmail(), otp, subject, text);
        } catch (MessagingException e) {
            throw new CustomException("Failed to send login OTP: " + e.getMessage());
        }

        AuthResponse res = new AuthResponse();
        res.setMessage("OTP sent to your registered email for login.");
        return ResponseEntity.ok(res);
    }

    // 🧩 STEP 3: Verify Email or OTP (for both signup & login)
    @PostMapping("/auth/verify-email")
    public ResponseEntity<AuthResponse> verifyScientistEmail(
            @RequestParam String email,
            @RequestParam String otp
    ) throws Exception {

        scientistService.verifyEmail(email, otp);
        Scientist verifiedScientist = scientistService.findScientistByEmail(email);

        String jwt = authService.generateToken(verifiedScientist.getEmail(), verifiedScientist.getRole());

        AuthResponse res = new AuthResponse();
        res.setMessage("OTP verified successfully! You are now logged in.");
        res.setJwt(jwt);

        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    // 🧩 STEP 4: Get Scientist Profile
    @GetMapping("/profile")
    public ResponseEntity<Scientist> getScientistProfile(@RequestHeader("Authorization") String jwt) throws Exception {
        Scientist scientist = scientistService.findScientistByJwtToken(jwt);
        return ResponseEntity.ok(scientist);
    }

    // 🧩 STEP 5: Update Scientist Profile
    @PatchMapping
    public ResponseEntity<Scientist> updateScientist(
            @RequestHeader("Authorization") String jwt,
            @RequestBody Scientist scientist
    ) throws Exception {

        Scientist profile = scientistService.findScientistByJwtToken(jwt);
        Scientist updated = scientistService.updateScientist(profile.getId(), null); // Placeholder, need to implement mapping
        return ResponseEntity.ok(updated);
    }

    // 🧩 STEP 6: Delete Scientist Account
    @DeleteMapping("/delete")
    public ResponseEntity<Apiresponse> deleteScientistAccount(@RequestHeader("Authorization") String jwt) throws Exception {
        Scientist scientist = scientistService.findScientistByJwtToken(jwt);
        scientistService.deleteScientist(scientist.getId());

        Apiresponse res = new Apiresponse();
        res.setMessage("Your account has been deleted successfully.");
        return ResponseEntity.ok(res);
    }

    // 🧩 STEP 7: Scientist Report (optional)
    @GetMapping("/report")
    public ResponseEntity<ScientistReport> getScientistReport(@RequestHeader("Authorization") String jwt) throws Exception {
        Scientist scientist = scientistService.findScientistByJwtToken(jwt);
        ScientistReport report = scientistReportService.getScientistReport(scientist);
        return ResponseEntity.ok(report);
    }

    // 🧩 STEP 8: Admin or General Access (Optional)
    @GetMapping
    public ResponseEntity<List<Scientist>> getAllScientists(@RequestParam(required = false) AccountStatus status) {
        List<Scientist> scientists = scientistService.findAllScientists();
        return ResponseEntity.ok(scientists);
    }

    // 🧩 STEP 9: Change Password
    @PostMapping("/change-password")
    public ResponseEntity<AuthResponse> changePassword(
            @RequestHeader("Authorization") String jwt,
            @RequestParam String currentPassword,
            @RequestParam String newPassword,
            @RequestParam String otp
    ) throws Exception {
        if (jwt == null || jwt.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = jwt.startsWith("Bearer ") ? jwt.substring(7) : jwt;
        if (token.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            Scientist scientist = scientistService.changePassword(token, currentPassword, newPassword, otp);
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
}
