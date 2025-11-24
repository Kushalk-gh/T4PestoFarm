package com.pesticides.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pesticides.modal.HomeCategory;

public interface HomeCategoryRepository extends JpaRepository<HomeCategory,Long>{
    
}
