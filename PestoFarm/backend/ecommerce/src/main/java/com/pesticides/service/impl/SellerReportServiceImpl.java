package com.pesticides.service.impl;

import org.springframework.stereotype.Service;

import com.pesticides.modal.Seller;
import com.pesticides.modal.SellerReport;
import com.pesticides.repository.SellerReportRepository;
import com.pesticides.service.SellerReportService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SellerReportServiceImpl implements SellerReportService {

    private final  SellerReportRepository sellerReportRepository;

    @Override
    public SellerReport getSellerReport(Seller seller) {
        SellerReport sr = sellerReportRepository.findBySellerId(seller.getId());

        if(sr==null){
            SellerReport newReport = new SellerReport();
            return sellerReportRepository.save(newReport);
        }
        return sr;
    }  

    @Override
    public SellerReport updateSellerReport(SellerReport sellerReport) {
        return sellerReportRepository.save(sellerReport);
    }
    
}
