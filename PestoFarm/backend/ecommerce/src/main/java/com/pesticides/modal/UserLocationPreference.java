package com.pesticides.modal;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_location_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLocationPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String choice; // allowWhileVisiting, onlyThisTime, dontAllow

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime savedAt;

    public UserLocationPreference(User user, String choice) {
        this.user = user;
        this.choice = choice;
    }
}
