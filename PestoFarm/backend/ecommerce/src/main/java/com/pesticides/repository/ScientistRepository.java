package com.pesticides.repository;

import com.pesticides.modal.Scientist;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ScientistRepository extends JpaRepository<Scientist,Long> {
    
    Scientist findByEmail(String email);
    
    List<Scientist> findBySpecialization(String specialization);
}