package com.pesticides.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pesticides.modal.Address;

public interface AddressRepository extends JpaRepository<Address,Long> {
    
}
