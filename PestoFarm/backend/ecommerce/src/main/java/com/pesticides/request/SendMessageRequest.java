package com.pesticides.request;

import lombok.Data;

@Data
public class SendMessageRequest {
    
    // Used for sending a message in an existing chat
    private Long chatId; 
    
    // Used by a User to initiate a *new* chat with a specific scientist
    private Long scientistId; 
    
    // The content of the message
    private String content; 
}