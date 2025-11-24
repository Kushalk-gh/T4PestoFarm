package com.pesticides.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pesticides.modal.Order;
import com.pesticides.modal.PaymentOrder;
import com.pesticides.modal.Seller;
import com.pesticides.modal.SellerReport;
import com.pesticides.response.Apiresponse;
import com.pesticides.service.PaymentService;
import com.pesticides.service.SellerReportService;
import com.pesticides.service.SellerService;
import com.pesticides.service.TransactionService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class PaymentController {
    
    private final PaymentService paymentService;
    private final SellerService sellerService;
    private final SellerReportService sellerReportService;
    private final TransactionService transactionService;

    @GetMapping("/{paymentId}")
    public ResponseEntity<Apiresponse> paymentSuccessHandler(
        @PathVariable String paymentId,
        @RequestParam String paymentLinkId,
        @RequestHeader("Authorization") String jwt)
        throws Exception {

            PaymentOrder paymentOrder = paymentService.getPaymentOrderByPaymentId(paymentLinkId);

            boolean paymentSuccess =paymentService.ProceedPaymentOrder
            (paymentOrder, paymentId, paymentLinkId);

            if(paymentSuccess){
                for(Order order: paymentOrder.getOrders()){
                    transactionService.createTransaction(order);
                    Seller seller = sellerService.getSellerById(order.getSellerId());
                    SellerReport report = sellerReportService.getSellerReport(seller);
                    report.setTotalOrders(report.getTotalOrders()+1);
                    report.setTotalEarnings(report.getTotalEarnings()+order.getTotalSellingPrice());
                    report.setTotalSales(report.getTotalSales()+order.getOrderItems().size());
                    sellerReportService.updateSellerReport(report);

                }
            }

            Apiresponse res = new Apiresponse();
            res.setMessage("Payment successful");

            return new ResponseEntity<>(res, HttpStatus.CREATED);
    }
    
}
