package com.pesticides.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pesticides.config.JwtProvider;
import com.pesticides.domain.AccountStatus;
import com.pesticides.domain.USER_ROLE;
import com.pesticides.exception.CustomException;
import com.pesticides.exception.SellerException;
import com.pesticides.modal.Address;
import com.pesticides.modal.Seller;
import com.pesticides.modal.VerificationCode;
import com.pesticides.repository.AddressRepository;
import com.pesticides.repository.SellerRepository;
import com.pesticides.repository.VerificationCodeRepository;
import com.pesticides.service.GeocodingService;
import com.pesticides.service.SellerService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SellerServiceImpl implements SellerService {

    private final SellerRepository sellerRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final AddressRepository addressRepository;
    private final GeocodingService geocodingService;
    private final VerificationCodeRepository verificationCodeRepository;

    @Override
    public Seller getSellerProfile(String jwt) throws Exception {
        String email = jwtProvider.getEmailFromJwtToken(jwt);
        return this.getSellerByEmail(email);
    }

    @Override
    public Seller createSeller(Seller seller) throws SellerException {
        Seller sellerExists = sellerRepository.findByEmail(seller.getEmail());
        if(sellerExists !=null){
            throw new SellerException("seller already exists, use different email");
        }

        Address pickupAddress = seller.getPickupAddress();

        if(pickupAddress != null) {
            geocodingService.geocodeAddress(pickupAddress);
        }

        Address savedAddress = null;
        if (pickupAddress != null) {
            savedAddress = addressRepository.save(pickupAddress);
        }
        Seller newSeller = new Seller();
        newSeller.setEmail(seller.getEmail());
        newSeller.setPassword(passwordEncoder.encode(seller.getPassword()));
        newSeller.setSellerName(seller.getSellerName());
        newSeller.setPickupAddress(savedAddress);
        newSeller.setGSTIN(seller.getGSTIN());
        newSeller.setRole(USER_ROLE.ROLE_SELLER);
        newSeller.setMobile(seller.getMobile());
        newSeller.setBankDetails(seller.getBankDetails());
        newSeller.setBusinessDetails(seller.getBusinessDetails());

        return sellerRepository.save(newSeller);
    }

    @Override
    public Seller getSellerById(Long id) throws SellerException {
        return sellerRepository.findById(id).orElseThrow(()-> new SellerException("seller not found with id - "+id));
    }

    @Override
    public Seller getSellerByEmail(String Email) throws SellerException {
        Seller seller = sellerRepository.findByEmail(Email);

        if (seller == null){
            throw new SellerException("seller not found ...");
        }
        return seller;
    }

    @Override
    public List<Seller> getAllSellers(AccountStatus status) {
        return sellerRepository.findByAccountStatus(status);
    }

    @Override
    public Seller updateSeller(Long id, Seller seller) throws SellerException {
        Seller existingSeller = this.getSellerById(id);
        boolean addressChanged = false;

        if(seller.getSellerName() != null){
            existingSeller.setSellerName(seller.getSellerName());
        }

        if(seller.getMobile() != null){
            existingSeller.setMobile(seller.getMobile());
        }

        if(seller.getEmail() != null){
            existingSeller.setEmail(seller.getEmail());
        }

        if(seller.getBusinessDetails() != null
        && seller.getBusinessDetails().getBusinessName() != null){
            existingSeller.getBusinessDetails().setBusinessName(
                seller.getBusinessDetails().getBusinessName()
            );
        }

        if(seller.getBankDetails() != null
        && seller.getBankDetails().getAccountHolderName() != null
        && seller.getBankDetails().getIfscCode() != null
        && seller.getBankDetails().getAccountNumber() != null)
        {

            existingSeller.getBankDetails().setAccountHolderName(
                seller.getBankDetails().getAccountHolderName()
            );

             existingSeller.getBankDetails().setAccountNumber(
                seller.getBankDetails().getAccountNumber()
            );

             existingSeller.getBankDetails().setIfscCode(
                seller.getBankDetails().getIfscCode()
            );
         }

        if(seller.getPickupAddress() != null
        && seller.getPickupAddress().getStreetAddress() != null
        && seller.getPickupAddress().getMobile() != null
        && seller.getPickupAddress().getCity() != null
        && seller.getPickupAddress().getState() != null )
        {
             existingSeller.getPickupAddress().setStreetAddress(
                seller.getPickupAddress().getStreetAddress()
            );

             existingSeller.getPickupAddress().setCity(
                seller.getPickupAddress().getCity()
            );

             existingSeller.getPickupAddress().setState(
                seller.getPickupAddress().getState()
            );

             existingSeller.getPickupAddress().setMobile(
                seller.getPickupAddress().getMobile()
            );

             existingSeller.getPickupAddress().setZipCode(
                seller.getPickupAddress().getZipCode()
            );

            addressChanged = true;
        }

        if(seller.getGSTIN() != null){
            existingSeller.setGSTIN(seller.getGSTIN());
        }

        if (addressChanged) {
            Address updatedAddress = geocodingService.geocodeAddress(existingSeller.getPickupAddress());
            existingSeller.setPickupAddress(updatedAddress);
        }

        return sellerRepository.save(existingSeller);
    }

    @Override
    public void deleteSeller(Long id) throws SellerException {
        Seller seller = getSellerById(id);
        sellerRepository.delete(seller);

    }

    @Override
    public Seller verifyEmail(String email, String otp) throws Exception {
        Seller seller = getSellerByEmail(email);

        VerificationCode verificationCode = verificationCodeRepository.findByEmail(email);

        if (verificationCode == null) {
            throw new CustomException("Verification code not found or already used.");
        }

        if (verificationCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            verificationCodeRepository.delete(verificationCode);
            throw new CustomException("OTP has expired. Please request a new one.");
        }

        if (!verificationCode.getOtp().equals(otp)) {
            throw new CustomException("Invalid OTP.");
        }

        seller.setEmailVerified(true);
        seller.setAccountStatus(AccountStatus.PENDING_VERIFICATION);

        verificationCodeRepository.delete(verificationCode);

        return sellerRepository.save(seller);
    }

    @Override
    public Seller updateSellerAccountStatus(Long sellerId, AccountStatus status) throws Exception {
        Seller seller = getSellerById(sellerId);
        seller.setAccountStatus(status);
        return sellerRepository.save(seller);
    }

    @Override
    public boolean checkPassword(Seller seller, String rawPassword) {
        if (seller.getPassword() == null || rawPassword == null) {
            return false;
        }
        return passwordEncoder.matches(rawPassword, seller.getPassword());
    }

    @Override
    public Seller changePassword(String jwt, String currentPassword, String newPassword, String otp) throws Exception {
        Seller seller = getSellerProfile(jwt);
        if (seller == null) {
            throw new Exception("Seller not found");
        }

        if (!checkPassword(seller, currentPassword)) {
            throw new CustomException("Current password is incorrect");
        }

        VerificationCode verificationCode = verificationCodeRepository.findByEmail(seller.getEmail());
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

        seller.setPassword(passwordEncoder.encode(newPassword));
        Seller savedSeller = sellerRepository.save(seller);

        verificationCodeRepository.delete(verificationCode);

        return savedSeller;
    }
}
