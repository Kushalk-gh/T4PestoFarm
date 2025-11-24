package com.pesticides.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pesticides.modal.PaymentOrder;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder,Long> {
    
    PaymentOrder findByPaymentLinkId(String paymentId);
}
