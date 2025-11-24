package com.pesticides.repository;

import com.pesticides.modal.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    
    List<Chat> findByUserId(Long userId);
    
    List<Chat> findByScientistId(Long scientistId);
    
    @Query("SELECT c FROM Chat c WHERE c.user.id = :userId AND c.scientist.id = :scientistId")
    Chat findByUserAndScientist(@Param("userId") Long userId, @Param("scientistId") Long scientistId);
}