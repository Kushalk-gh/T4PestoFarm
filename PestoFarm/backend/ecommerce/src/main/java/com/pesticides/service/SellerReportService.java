package com.pesticides.service;

import com.pesticides.modal.Seller;
import com.pesticides.modal.SellerReport;

public interface SellerReportService {
    
    SellerReport getSellerReport(Seller seller);
    SellerReport updateSellerReport(SellerReport sellerReport);
}
