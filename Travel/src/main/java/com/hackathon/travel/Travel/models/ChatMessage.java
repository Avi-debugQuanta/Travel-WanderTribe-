package com.hackathon.travel.Travel.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.Column;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tripId;
    private Long userId;

    @Enumerated(EnumType.STRING)
    private MessageRole role;

    @Column(length = 5000)
    private String content;

    private LocalDateTime timestamp;

    private String userName;

    public ChatMessage() {}

    public ChatMessage(Long tripId, Long userId, MessageRole role, String content) {
        this.tripId = tripId;
        this.userId = userId;
        this.role = role;
        this.content = content;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getTripId() { return tripId; }
    public Long getUserId() { return userId; }
    public MessageRole getRole() { return role; }
    public String getContent() { return content; }
    public LocalDateTime getTimestamp() { return timestamp; }

    public void setId(Long id) { this.id = id; }
    public void setTripId(Long tripId) { this.tripId = tripId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setRole(MessageRole role) { this.role = role; }
    public void setContent(String content) { this.content = content; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
