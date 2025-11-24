package com.pesticides.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pesticides.modal.SellerReport;

public interface SellerReportRepository extends JpaRepository<SellerReport,Long> {
    
    SellerReport findBySellerId(Long sellerId);
}
