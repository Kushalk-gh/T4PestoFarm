package com.pesticides.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pesticides.domain.AccountStatus;
import com.pesticides.modal.Seller;
// import java.util.List;


public interface SellerRepository extends JpaRepository<Seller,Long>{
    Seller findByEmail(String email);
    List<Seller> findByAccountStatus(AccountStatus status);    
}
