package com.pesticides.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pesticides.modal.Category;


public interface CategoryRepository extends JpaRepository<Category,Long> {
    
    Category findByCategoryId(String categoryId);
}
