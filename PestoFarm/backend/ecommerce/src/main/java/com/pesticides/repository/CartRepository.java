package com.pesticides.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pesticides.modal.Cart;

public interface CartRepository extends JpaRepository<Cart,Long>{

    Cart findByUserId(Long id);
    
    
}
