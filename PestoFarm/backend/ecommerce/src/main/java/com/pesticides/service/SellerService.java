package com.pesticides.service;

import java.util.List;

import com.pesticides.domain.AccountStatus;
import com.pesticides.exception.SellerException;
import com.pesticides.modal.Seller;

public interface SellerService {
    
    Seller getSellerProfile(String jwt) throws Exception;
    Seller createSeller(Seller seller) throws Exception;
    Seller getSellerById(Long id) throws SellerException;
    Seller getSellerByEmail(String Email) throws Exception;
    List<Seller> getAllSellers(AccountStatus status);
    Seller updateSeller(Long id, Seller seller) throws Exception;
    void deleteSeller(Long id) throws Exception;
    
    // CRITICAL: Updated method to include verification logic
    Seller verifyEmail(String email, String otp) throws Exception; 
    
    Seller updateSellerAccountStatus(Long sellerId, AccountStatus status) throws Exception;
    boolean checkPassword(Seller seller, String rawPassword);
    Seller changePassword(String jwt, String currentPassword, String newPassword, String otp) throws Exception;
}