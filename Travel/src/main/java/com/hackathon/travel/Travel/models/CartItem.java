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
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tripId;
    private Long userId;

    @Enumerated(EnumType.STRING)
    private BookingType itemType;

    private String itemName;
    private double originalPrice;
    private double negotiatedPrice;
    private boolean negotiated;

    @Column(length = 2000)
    private String itemDetails;

    private LocalDateTime addedAt;

    public CartItem() {}

    public CartItem(Long tripId, Long userId, BookingType itemType, String itemName, double originalPrice) {
        this.tripId = tripId;
        this.userId = userId;
        this.itemType = itemType;
        this.itemName = itemName;
        this.originalPrice = originalPrice;
        this.negotiatedPrice = originalPrice;
        this.negotiated = false;
        this.addedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getTripId() { return tripId; }
    public Long getUserId() { return userId; }
    public BookingType getItemType() { return itemType; }
    public String getItemName() { return itemName; }
    public double getOriginalPrice() { return originalPrice; }
    public double getNegotiatedPrice() { return negotiatedPrice; }
    public boolean isNegotiated() { return negotiated; }
    public String getItemDetails() { return itemDetails; }
    public LocalDateTime getAddedAt() { return addedAt; }

    public void setId(Long id) { this.id = id; }
    public void setTripId(Long tripId) { this.tripId = tripId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setItemType(BookingType itemType) { this.itemType = itemType; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public void setOriginalPrice(double originalPrice) { this.originalPrice = originalPrice; }
    public void setNegotiatedPrice(double negotiatedPrice) { this.negotiatedPrice = negotiatedPrice; }
    public void setNegotiated(boolean negotiated) { this.negotiated = negotiated; }
    public void setItemDetails(String itemDetails) { this.itemDetails = itemDetails; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}
