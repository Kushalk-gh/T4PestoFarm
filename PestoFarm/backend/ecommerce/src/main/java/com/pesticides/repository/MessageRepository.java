package com.pesticides.repository;

import com.pesticides.modal.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findByChatIdOrderByTimestampAsc(Long chatId);
}