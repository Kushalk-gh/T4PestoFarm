package com.pesticides.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pesticides.modal.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
}
