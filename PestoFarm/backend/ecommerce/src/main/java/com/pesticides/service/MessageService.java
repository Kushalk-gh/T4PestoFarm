package com.pesticides.service;

import com.pesticides.modal.Message;
import com.pesticides.request.SendMessageRequest;
import java.util.List;

public interface MessageService {
    
    Message sendMessage(SendMessageRequest req, String imageUrl, String jwt) throws Exception; 
    
    List<Message> getChatMessages(Long chatId) throws Exception;
}