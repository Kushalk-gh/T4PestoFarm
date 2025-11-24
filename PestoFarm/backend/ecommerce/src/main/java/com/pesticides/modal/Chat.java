package com.pesticides.modal;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    // The user who initiated the chat
    @ManyToOne
    private User user; 

    // The scientist involved in the chat
    @ManyToOne
    private Scientist scientist; 

    private LocalDateTime createdAt = LocalDateTime.now();
    
    // Last activity in the chat for quick sorting
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Messages in this chat
    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();

    // A brief subject or first message content
    private String subject; 
}