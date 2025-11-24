package com.pesticides.service.impl;

import com.pesticides.modal.Chat;
import com.pesticides.modal.User;
import com.pesticides.modal.Scientist;
import com.pesticides.repository.ChatRepository;
import com.pesticides.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatRepository chatRepository;

    @Override
    public Chat createChat(User user, Scientist scientist) {
        Chat chat = new Chat();
        chat.setUser(user);
        chat.setScientist(scientist);
        return chatRepository.save(chat);
    }

    @Override
    public Chat save(Chat chat) {
        return chatRepository.save(chat);
    }

    @Override
    public Chat findChatById(Long chatId) throws Exception {
        Optional<Chat> opt = chatRepository.findById(chatId);
        if(opt.isPresent()) {
            return opt.get();
        }
        throw new Exception("Chat not found with id: " + chatId);
    }

    @Override
    public List<Chat> findUsersChats(User user) {
        return chatRepository.findByUserId(user.getId());
    }

    @Override
    public List<Chat> findScientistsChats(Scientist scientist) {
        return chatRepository.findByScientistId(scientist.getId());
    }

    @Override
    public Chat findChatByUserAndScientist(Long userId, Long scientistId) {
        return chatRepository.findByUserAndScientist(userId, scientistId);
    }
}