package com.pesticides.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pesticides.modal.Wishlist;

public interface WishlistRepository extends JpaRepository<Wishlist,Long> {

    Wishlist findByUserId(Long userId);
    
}
