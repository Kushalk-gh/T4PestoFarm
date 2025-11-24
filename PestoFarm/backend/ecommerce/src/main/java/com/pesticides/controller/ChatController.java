package com.pesticides.controller;

import com.pesticides.modal.Chat;
import com.pesticides.modal.Message;
import com.pesticides.modal.User;
import com.pesticides.modal.Scientist;
import com.pesticides.request.SendMessageRequest;
import com.pesticides.service.ChatService;
import com.pesticides.service.MessageService;
import com.pesticides.service.UserService;
import com.pesticides.service.ScientistService;
import com.pesticides.service.FileService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final MessageService messageService;
    private final UserService userService;
    private final ScientistService scientistService;
    private final FileService fileService; 

    /**
     * POST /api/chats/user/send - Handles multipart/form-data (text + optional image)
     */
    @PostMapping("/user/send")
    public ResponseEntity<Message> userInitiateOrSendMessage(
        // @RequestBody is replaced by @ModelAttribute for multipart form data
        @ModelAttribute SendMessageRequest req, 
        @RequestParam(value = "image", required = false) MultipartFile image, 
        @RequestHeader("Authorization") String jwt) throws Exception {

        User user = userService.findUserByJwtToken(jwt);
        Chat chat;
        String imageUrl = null;
        
        // 1. Handle File Upload (if image exists)
        if (image != null && !image.isEmpty()) {
            imageUrl = fileService.uploadFile(image, "chat_images");
        }

        if (req.getChatId() == null && req.getScientistId() != null) {
            Scientist scientist = scientistService.findScientistById(req.getScientistId());
            chat = chatService.findChatByUserAndScientist(user.getId(), scientist.getId());
            if (chat == null) {
                chat = chatService.createChat(user, scientist);
            }
            req.setChatId(chat.getId()); 
        } else if (req.getChatId() != null) {
            chat = chatService.findChatById(req.getChatId());
            if (chat.getUser().getId().longValue() != user.getId().longValue()) {
                 return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        } else {
            throw new Exception("To send a message, either chatId (existing) or scientistId (new) is required.");
        }

        Message message = messageService.sendMessage(req, imageUrl, jwt); 

        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }

    /**
     * POST /api/chats/scientist/send - Handles multipart/form-data (text + optional image)
     * The scientist can reply using the same enhanced endpoint.
     */
    @PostMapping("/scientist/send")
    public ResponseEntity<Message> scientistSendMessage(
        @ModelAttribute SendMessageRequest req,
        @RequestParam(value = "image", required = false) MultipartFile image,
        @RequestHeader("Authorization") String jwt) throws Exception {

        if (req.getChatId() == null) {
            throw new Exception("Scientist must reply to an existing chat. Chat ID required.");
        }
        
        String imageUrl = null;
        // 1. Handle File Upload (if image exists)
        if (image != null && !image.isEmpty()) {
            imageUrl = fileService.uploadFile(image, "chat_images");
        }
        
        Scientist scientist = scientistService.findScientistByJwtToken(jwt);
        Chat chat = chatService.findChatById(req.getChatId());
        
        // Validation: Ensure the scientist is a participant in this chat
        if (chat.getScientist().getId() != scientist.getId()) {
             return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        // 2. Send Message (pass the generated URL)
        Message message = messageService.sendMessage(req, imageUrl, jwt); 

        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }
    
/**
     * GET /api/chats/user
     * Get all chat threads for the authenticated User.
     */
    @GetMapping("/user")
    public ResponseEntity<List<Chat>> getUsersChats(
        @RequestHeader("Authorization") String jwt) throws Exception {
        
        User user = userService.findUserByJwtToken(jwt);
        List<Chat> chats = chatService.findUsersChats(user);
        
        return new ResponseEntity<>(chats, HttpStatus.OK);
    }

    /**
     * GET /api/chats/scientist
     * Get all chat threads for the authenticated Scientist.
     */
    @GetMapping("/scientist")
    public ResponseEntity<List<Chat>> getScientistsChats(
        @RequestHeader("Authorization") String jwt) throws Exception {
        
        Scientist scientist = scientistService.findScientistByJwtToken(jwt);
        List<Chat> chats = chatService.findScientistsChats(scientist);
        
        return new ResponseEntity<>(chats, HttpStatus.OK);
    }
    
    /**
     * GET /api/chats/{chatId}/messages
     * Get all messages for a specific chat (accessible by either participant).
     */
    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<Message>> getChatMessages(
        @PathVariable Long chatId,
        @RequestHeader("Authorization") String jwt) throws Exception {
        
        // The service layer should only return the messages if the authenticated user 
        // is one of the participants. We validate the participant here.
        Chat chat = chatService.findChatById(chatId);
        
        try {
            // Check if the sender is the User participant
            User user = userService.findUserByJwtToken(jwt);
            if (chat.getUser().getId().longValue() != user.getId().longValue()) {
                throw new Exception("Not the chat user.");
            }
        } catch (Exception userAuthException) {
            try {
                // Check if the sender is the Scientist participant
                Scientist scientist = scientistService.findScientistByJwtToken(jwt);
                if (chat.getScientist().getId().longValue() != scientist.getId().longValue()) {
                    throw new Exception("Not the chat scientist.");
                }
            } catch (Exception scientistAuthException) {
                 return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        }
        
        List<Message> messages = messageService.getChatMessages(chatId);
        
        return new ResponseEntity<>(messages, HttpStatus.OK);
    }

}