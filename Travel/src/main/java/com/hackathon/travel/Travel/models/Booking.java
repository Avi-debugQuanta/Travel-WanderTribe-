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
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tripId;
    private Long userId;

    @Enumerated(EnumType.STRING)
    private BookingType type;

    @Column(length = 2000)
    private String details;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private String providerName;
    private double price;
    private LocalDateTime bookedAt;

    public Booking() {}

    public Booking(Long tripId, Long userId, BookingType type, String providerName, double price) {
        this.tripId = tripId;
        this.userId = userId;
        this.type = type;
        this.providerName = providerName;
        this.price = price;
        this.status = BookingStatus.PENDING;
        this.bookedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getTripId() { return tripId; }
    public Long getUserId() { return userId; }
    public BookingType getType() { return type; }
    public String getDetails() { return details; }
    public BookingStatus getStatus() { return status; }
    public String getProviderName() { return providerName; }
    public double getPrice() { return price; }
    public LocalDateTime getBookedAt() { return bookedAt; }

    public void setId(Long id) { this.id = id; }
    public void setTripId(Long tripId) { this.tripId = tripId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setType(BookingType type) { this.type = type; }
    public void setDetails(String details) { this.details = details; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    public void setPrice(double price) { this.price = price; }
    public void setBookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; }
}
