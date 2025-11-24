package com.pesticides.service.impl;

import com.pesticides.modal.Chat;
import com.pesticides.modal.Message;
import com.pesticides.modal.User;
import com.pesticides.modal.Scientist;
import com.pesticides.repository.MessageRepository;
import com.pesticides.request.SendMessageRequest;
import com.pesticides.service.ChatService;
import com.pesticides.service.MessageService;
import com.pesticides.service.UserService;
import com.pesticides.service.ScientistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ChatService chatService;
    private final UserService userService;
    private final ScientistService scientistService;

    /**
     * Handles sending a message, which may include text content, an image URL, or both.
     * It determines the sender's identity and validates participation in the chat.
     * * @param req The request containing chat details and content.
     * @param imageUrl The URL of the uploaded image (can be null).
     * @param jwt The JWT token to authenticate the sender.
     * @return The newly created Message object.
     * @throws Exception if sender is not authenticated, chat is not found, or sender is not a participant.
     */
    @Override
    public Message sendMessage(SendMessageRequest req, String imageUrl, String jwt) throws Exception { 
        
        Long senderId;
        String senderRole;
        
        try {
            // Check if the sender is a User
            User user = userService.findUserByJwtToken(jwt);
            senderId = user.getId();
            senderRole = "ROLE_USER";
        } catch (Exception userNotFound) {
            try {
                // Check if the sender is a Scientist
                Scientist scientist = scientistService.findScientistByJwtToken(jwt);
                senderId = scientist.getId();
                senderRole = "ROLE_SCIENTIST";
            } catch (Exception scientistNotFound) {
                // If neither user nor scientist is found
                throw new Exception("Sender identity could not be determined from JWT. Please log in.");
            }
        }

        Chat chat = chatService.findChatById(req.getChatId()); 
        
        if (senderRole.equals("ROLE_CUSTOMER") && chat.getUser().getId().longValue() != senderId.longValue()) {
            throw new Exception("User is not a participant in this chat.");
        }
        if (senderRole.equals("ROLE_SCIENTIST") && chat.getScientist().getId().longValue() != senderId.longValue()) {
            throw new Exception("Scientist is not a participant in this chat.");
        }

        
        if ((req.getContent() == null || req.getContent().trim().isEmpty()) && imageUrl == null) {
            throw new Exception("Cannot send an empty message or a message without content/image.");
        }

        Message message = new Message();
        message.setContent(req.getContent());
        
        // Set the image URL if provided by the FileService
        message.setImageUrl(imageUrl); 
        
        message.setChat(chat);
        message.setSenderId(senderId);
        message.setSenderRole(senderRole);
        message.setTimestamp(LocalDateTime.now());
        message.setIsRead(false);

        // Update Chat's last activity timestamp and save the chat
        chat.setUpdatedAt(LocalDateTime.now());
        chatService.save(chat);

        return messageRepository.save(message);
    }

    /**
     * Retrieves all messages for a specific chat, ordered chronologically.
     * * @param chatId The ID of the chat thread.
     * @return A list of Message objects.
     * @throws Exception if the chat is not found.
     */
    @Override
    public List<Message> getChatMessages(Long chatId) throws Exception {
        // Ensures the chat exists before attempting to retrieve messages
        chatService.findChatById(chatId); 
        return messageRepository.findByChatIdOrderByTimestampAsc(chatId);
    }
}
