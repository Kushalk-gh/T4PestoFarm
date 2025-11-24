package com.pesticides.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pesticides.modal.Cart;
import com.pesticides.modal.CartItem;
import com.pesticides.modal.Product;

public interface CartItemRepository extends JpaRepository<CartItem,Long> {
    
    CartItem findByCartAndProductAndSize(Cart cart, Product product,String size);
}
