package com.pesticides.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pesticides.modal.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem,Long> {
    
}
