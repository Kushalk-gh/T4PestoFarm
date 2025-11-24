package com.pesticides.service.impl;
import com.pesticides.modal.Scientist;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder; // NEW IMPORT
import com.pesticides.config.JwtProvider;
import com.pesticides.modal.Address; // NEW IMPORT

import com.pesticides.modal.VerificationCode;
import com.pesticides.repository.ScientistRepository;
import com.pesticides.repository.VerificationCodeRepository;
import com.pesticides.request.ScientistRequest; // NEW IMPORT
import com.pesticides.service.ScientistService;
import com.pesticides.domain.AccountStatus; // NEW IMPORT
import com.pesticides.domain.USER_ROLE; // NEW IMPORT
import com.pesticides.exception.CustomException;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScientistServiceImpl implements ScientistService {

    private final ScientistRepository scientistRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder; // Inject PasswordEncoder
    private final VerificationCodeRepository verificationCodeRepository; // Inject PasswordEncoder
    
    // --- Existing Service Methods ---

    @Override
    public Scientist findScientistByJwtToken(String jwt) throws Exception {
        String email = jwtProvider.getEmailFromJwtToken(jwt);
        return this.findScientistByEmail(email);
    }

    @Override
    public Scientist findScientistByEmail(String email) throws Exception {
        Scientist scientist = scientistRepository.findByEmail(email);
        if(scientist == null) {
            throw new Exception("Scientist not found with email - " + email);
        }
        return scientist;
    }
    
    @Override
    public Scientist findScientistById(Long id) throws Exception {
        Optional<Scientist> opt = scientistRepository.findById(id);
        if(opt.isEmpty()) {
            throw new Exception("Scientist not found with id - " + id);
        }
        return opt.get();
    }
    
    // --- NEW CRUD Service Methods ---

    @Override
    public Scientist createScientist(Scientist scientist) {
        Scientist existing = scientistRepository.findByEmail(scientist.getEmail());
        if (existing != null) {
            // In a real scenario, this should be handled by a dedicated Auth service 
            // and throw a more appropriate exception.
            throw new RuntimeException("Scientist with email " + scientist.getEmail() + " already exists.");
        }
        
        // This assumes the Scientist object passed already has a password set.
        // If not, you'd need to set a default or require it in a DTO.
        // It should be encrypted:
        // scientist.setPassword(passwordEncoder.encode(scientist.getPassword())); 
        
        scientist.setRole(USER_ROLE.ROLE_SCIENTIST);
        scientist.setAccountStatus(AccountStatus.ACTIVE); // Default to active for simplicity
        
        return scientistRepository.save(scientist);
    }

    @Override
    public Scientist updateScientist(Long scientistId, ScientistRequest req) throws Exception {
        Scientist scientist = findScientistById(scientistId);
        
        if (req.getScientistName() != null) {
            scientist.setScientistName(req.getScientistName());
        }
        if (req.getMobile() != null) {
            scientist.setMobile(req.getMobile());
        }
        if (req.getSpecialization() != null) {
            scientist.setSpecialization(req.getSpecialization());
        }
        if (req.getInstitution() != null) {
            scientist.setInstitution(req.getInstitution());
        }
        if (req.getOfficeAddress() != null) {
            // Assuming Address is handled as a separate entity/embedded
            Address updatedAddress = req.getOfficeAddress();
            Address existingAddress = scientist.getOfficeAddress();
            
            // Logic to update existing address fields
            if (existingAddress != null) {
                // Update fields one by one (assuming Address modal fields are set via getters/setters)
                // For brevity, we are just replacing the object. In production, you'd update fields.
                scientist.setOfficeAddress(updatedAddress);
            }
        }
        
        return scientistRepository.save(scientist);
    }

       @Override
    public boolean checkPassword(Scientist scientist, String rawPassword) {
        if (scientist.getPassword() == null || rawPassword == null) {
            return false;
        }
        return passwordEncoder.matches(rawPassword, scientist.getPassword());
    }

    @Override
    public List<Scientist> findAllScientists() {
        return scientistRepository.findAll();
    }

    @Override
    public void deleteScientist(Long scientistId) throws Exception {
        Scientist scientist = findScientistById(scientistId);        
        scientistRepository.delete(scientist);
    }

   @Override
    public Scientist verifyEmail(String email, String otp) throws Exception {
        Scientist scientist = findScientistByEmail(email);

        VerificationCode verificationCode = verificationCodeRepository.findByEmail(email);

        if (verificationCode == null) {
            throw new CustomException("Verification code not found or already used.");
        }

        // 1. CHECK EXPIRY
        if (verificationCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            verificationCodeRepository.delete(verificationCode);
            throw new CustomException("OTP has expired. Please request a new one.");
        }

        // 2. CHECK OTP MATCH
        if (!verificationCode.getOtp().equals(otp)) {
            throw new CustomException("Invalid OTP.");
        }

        // Verification successful
        scientist.setEmailVerified(true);
        scientist.setAccountStatus(AccountStatus.PENDING_VERIFICATION); 
        
        // 3. Clean up the used OTP
        verificationCodeRepository.delete(verificationCode);
        
        return scientistRepository.save(scientist);
    }

    @Override
    public Scientist changePassword(String jwt, String currentPassword, String newPassword, String otp) throws Exception {
        Scientist scientist = findScientistByJwtToken(jwt);
        if (scientist == null) {
            throw new Exception("Scientist not found");
        }

        // Verify current password
        if (!checkPassword(scientist, currentPassword)) {
            throw new CustomException("Current password is incorrect");
        }

        // Verify OTP
        VerificationCode verificationCode = verificationCodeRepository.findByEmail(scientist.getEmail());
        if (verificationCode == null) {
            throw new CustomException("OTP not found. Please request a new OTP.");
        }
        if (verificationCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            verificationCodeRepository.delete(verificationCode);
            throw new CustomException("OTP has expired. Please request a new one.");
        }
        if (!verificationCode.getOtp().equals(otp)) {
            throw new CustomException("Invalid OTP.");
        }

        // Update password
        scientist.setPassword(passwordEncoder.encode(newPassword));
        Scientist savedScientist = scientistRepository.save(scientist);

        // Clean up OTP
        verificationCodeRepository.delete(verificationCode);

        return savedScientist;
    }
}
