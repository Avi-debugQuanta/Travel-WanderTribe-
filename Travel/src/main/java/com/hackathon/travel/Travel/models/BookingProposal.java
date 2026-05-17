package com.hackathon.travel.Travel.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_proposals")
public class BookingProposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tripId;
    private Long proposedBy;
    private String proposedByName;

    @Enumerated(EnumType.STRING)
    private BookingType itemType;

    private String itemName;

    @Column(length = 2000)
    private String itemDetails;

    private double price;
    private String proposedDate;

    @Enumerated(EnumType.STRING)
    private ProposalStatus status;

    private LocalDateTime createdAt;

    public BookingProposal() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }
    public Long getProposedBy() { return proposedBy; }
    public void setProposedBy(Long proposedBy) { this.proposedBy = proposedBy; }
    public String getProposedByName() { return proposedByName; }
    public void setProposedByName(String proposedByName) { this.proposedByName = proposedByName; }
    public BookingType getItemType() { return itemType; }
    public void setItemType(BookingType itemType) { this.itemType = itemType; }
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public String getItemDetails() { return itemDetails; }
    public void setItemDetails(String itemDetails) { this.itemDetails = itemDetails; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getProposedDate() { return proposedDate; }
    public void setProposedDate(String proposedDate) { this.proposedDate = proposedDate; }
    public ProposalStatus getStatus() { return status; }
    public void setStatus(ProposalStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
