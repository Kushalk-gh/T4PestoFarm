package com.pesticides.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pesticides.modal.Deal;

public interface DealRepository extends JpaRepository<Deal,Long> {
    
}
