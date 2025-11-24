package com.pesticides.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pesticides.domain.AccountStatus;
import com.pesticides.exception.CustomException;
import com.pesticides.exception.SellerException;
import com.pesticides.modal.Seller;
import com.pesticides.modal.SellerReport;
import com.pesticides.modal.VerificationCode;
import com.pesticides.repository.VerificationCodeRepository;
import com.pesticides.request.LoginOtpRequest;
import com.pesticides.request.LoginRequest;
import com.pesticides.response.SignupRequest;
import com.pesticides.response.Apiresponse;
import com.pesticides.response.AuthResponse;
import com.pesticides.service.AuthService;
import com.pesticides.service.EmailService;
import com.pesticides.service.SellerReportService;
import com.pesticides.service.SellerService;
import com.pesticides.utils.OtpUtil;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sellers")
public class SellerController {

    private final SellerService sellerService;
    private final VerificationCodeRepository verificationCodeRepository;
    private final AuthService authService;
    private final EmailService emailService;
    private final SellerReportService sellerReportService;

    // 🧩 STEP 1: Send OTP for Seller Signup/Login
    @PostMapping("/auth/send-otp")
    public ResponseEntity<Apiresponse> sendSellerOtp(@RequestBody LoginOtpRequest req) throws Exception {

        // 1️⃣ Generate OTP (no need to check if seller exists, as this endpoint is for both signup and login)
        // For signup, seller doesn't exist yet; for login, we send OTP regardless
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
        String subject = "Pestofarm Seller OTP";
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

    // 🧩 STEP 2: Seller Registration (Signup)
    @PostMapping("/auth/signup")
    public ResponseEntity<AuthResponse> registerSeller(@RequestBody SignupRequest req) throws Exception {

        // 1️⃣ Create new seller account
        String token = authService.createSeller(req);

        // 2️⃣ Response (OTP already sent in send-otp endpoint)
        AuthResponse res = new AuthResponse();
        res.setMessage("Signup successful! Please verify your email with OTP.");
        res.setJwt(token); // temporary until verified

        return new ResponseEntity<>(res, HttpStatus.CREATED);
    }

    // 🧩 STEP 2: Seller Login (OTP or Password)
    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> loginSeller(@RequestBody LoginRequest req) throws Exception {

        // 1️⃣ Find seller
        Seller seller = sellerService.getSellerByEmail(req.getEmail());
        if (seller == null) {
            throw new CustomException("No seller found with this email. Please register first.");
        }

        // 2️⃣ Check if password is provided — login directly
        if (req.getPassword() != null && !req.getPassword().isEmpty()) {
            if (!sellerService.checkPassword(seller, req.getPassword())) {
                throw new CustomException("Invalid password.");
            }

            // Generate JWT after password login
            String jwt = authService.generateToken(seller.getEmail(), seller.getRole());
            AuthResponse res = new AuthResponse();
            res.setMessage("Login successful via password.");
            res.setJwt(jwt);
            return ResponseEntity.ok(res);
        }

        // 3️⃣ Else, login via OTP (send new OTP)
        String otp = OtpUtil.generateOtp();
        VerificationCode code = new VerificationCode();
        code.setEmail(seller.getEmail());
        code.setOtp(otp);
        code.setCreatedAt(LocalDateTime.now());
        code.setExpiresAt(LocalDateTime.now().plusMinutes(5));

        VerificationCode existing = verificationCodeRepository.findByEmail(seller.getEmail());
        if (existing != null) verificationCodeRepository.delete(existing);

        verificationCodeRepository.save(code);

        String subject = "Pestofarm Seller Login OTP";
        String text = "Your OTP for login is: " + otp
                + "\nIt will expire in 5 minutes.\n\nRegards,\nPestofarm Team";

        try {
            emailService.sendVerificationOtpEmail(seller.getEmail(), otp, subject, text);
        } catch (MessagingException e) {
            throw new CustomException("Failed to send login OTP: " + e.getMessage());
        }

        AuthResponse res = new AuthResponse();
        res.setMessage("OTP sent to your registered email for login.");
        return ResponseEntity.ok(res);
    }

    // 🧩 STEP 3: Verify Email or OTP (for both signup & login)
    @PostMapping("/auth/verify-email")
    public ResponseEntity<AuthResponse> verifySellerEmail(
            @RequestParam String email,
            @RequestParam String otp
    ) throws Exception {

        sellerService.verifyEmail(email, otp);
        Seller verifiedSeller = sellerService.getSellerByEmail(email);

        String jwt = authService.generateToken(verifiedSeller.getEmail(), verifiedSeller.getRole());

        AuthResponse res = new AuthResponse();
        res.setMessage("OTP verified successfully! You are now logged in.");
        res.setJwt(jwt);

        return new ResponseEntity<>(res, HttpStatus.OK);
    }

   

    // 🧩 STEP 5: Update Seller Profile
    @PatchMapping
    public ResponseEntity<Seller> updateSeller(
            @RequestHeader("Authorization") String jwt,
            @RequestBody Seller seller
    ) throws Exception {

        Seller profile = sellerService.getSellerProfile(jwt);
        Seller updated = sellerService.updateSeller(profile.getId(), seller);
        return ResponseEntity.ok(updated);
    }


    
    @GetMapping("/{id}")
    public ResponseEntity<Seller> getSellerById(@PathVariable Long id) throws SellerException {
        Seller seller = sellerService.getSellerById(id);
        return new ResponseEntity<>(seller, HttpStatus.OK);
    }

    @GetMapping("/profile")
    public ResponseEntity<Seller> getSellerByJwt(@RequestHeader("Authorization") String jwt) throws Exception{
        
        Seller seller = sellerService.getSellerProfile(jwt);
        return new ResponseEntity<>(seller, HttpStatus.OK);
    }

     // 🧩 STEP 4: Get Seller Profile
     // above method and this method is almost same
    // @GetMapping("/profile")
    // public ResponseEntity<Seller> getSellerProfile(@RequestHeader("Authorization") String jwt) throws Exception {
    //     Seller seller = sellerService.getSellerProfile(jwt);
    //     return ResponseEntity.ok(seller);
    // }

    // 🧩 STEP 6: Delete Seller Account
    @DeleteMapping("/delete")
    public ResponseEntity<Apiresponse> deleteSellerAccount(@RequestHeader("Authorization") String jwt) throws Exception {
        Seller seller = sellerService.getSellerProfile(jwt);
        sellerService.deleteSeller(seller.getId());

        Apiresponse res = new Apiresponse();
        res.setMessage("Your account has been deleted successfully.");
        return ResponseEntity.ok(res);
    }

    // 🧩 STEP 7: Seller Report (optional)
    @GetMapping("/report")
    public ResponseEntity<SellerReport> getSellerReport(@RequestHeader("Authorization") String jwt) throws Exception {
        Seller seller = sellerService.getSellerProfile(jwt);
        SellerReport report = sellerReportService.getSellerReport(seller);
        return ResponseEntity.ok(report);
    }

    // 🧩 STEP 8: Admin or General Access (Optional)
    @GetMapping
    public ResponseEntity<List<Seller>> getAllSellers(@RequestParam(required = false) AccountStatus status) {
        List<Seller> sellers = sellerService.getAllSellers(status);
        return ResponseEntity.ok(sellers);
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
            Seller seller = sellerService.changePassword(token, currentPassword, newPassword, otp);
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
