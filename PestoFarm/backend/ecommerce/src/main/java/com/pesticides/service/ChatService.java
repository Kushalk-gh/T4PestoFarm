package com.pesticides.service;

import com.pesticides.modal.Chat;
import com.pesticides.modal.User;
import com.pesticides.modal.Scientist;
import java.util.List;

public interface ChatService {
    
    Chat createChat(User user, Scientist scientist);
    
    Chat save(Chat chat);

    Chat findChatById(Long chatId) throws Exception;
    
    List<Chat> findUsersChats(User user);
    
    List<Chat> findScientistsChats(Scientist scientist);
    
    Chat findChatByUserAndScientist(Long userId, Long scientistId);
}