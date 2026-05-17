package com.hackathon.travel.Travel.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.Column;

@Entity
@Table(name = "ideas")
public class Idea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tripId;
    private Long userId;
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private Category category;

    private int voteCount;

    @Column(length = 5000)
    private String comments;

    public Idea() {}

    public Idea(Long tripId, Long userId, String title, String description, Category category) {
        this.tripId = tripId;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.category = category;
        this.voteCount = 0;
    }

    public Long getId() { return id; }
    public Long getTripId() { return tripId; }
    public Long getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Category getCategory() { return category; }
    public int getVoteCount() { return voteCount; }
    public String getComments() { return comments; }

    public void setId(Long id) { this.id = id; }
    public void setTripId(Long tripId) { this.tripId = tripId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setCategory(Category category) { this.category = category; }
    public void setVoteCount(int voteCount) { this.voteCount = voteCount; }
    public void setComments(String comments) { this.comments = comments; }
}
