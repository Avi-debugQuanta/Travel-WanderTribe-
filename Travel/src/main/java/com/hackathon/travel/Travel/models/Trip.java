package com.hackathon.travel.Travel.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String destination;
    private String startDate;
    private String endDate;
    private String budget;
    private String activities;
    private String accommodations;
    private String transportation;
    private String food;
    private String createdBy;

    @Column(length = 2000)
    private String description;

    private String travelStyle;
    private String vibePreference;

    @ManyToMany
    @JoinTable(
        name = "trip_members",
        joinColumns = @JoinColumn(name = "trip_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnoreProperties("trips")
    private Set<User> members = new HashSet<>();

    public Trip() {}

    public Long getId() { return id; }
    public String getDestination() { return destination; }
    public String getStartDate() { return startDate; }
    public String getEndDate() { return endDate; }
    public String getBudget() { return budget; }
    public String getActivities() { return activities; }
    public String getAccommodations() { return accommodations; }
    public String getTransportation() { return transportation; }
    public String getFood() { return food; }
    public String getCreatedBy() { return createdBy; }
    public String getDescription() { return description; }
    public String getTravelStyle() { return travelStyle; }
    public String getVibePreference() { return vibePreference; }
    public Set<User> getMembers() { return members; }

    public void setId(Long id) { this.id = id; }
    public void setDestination(String destination) { this.destination = destination; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public void setBudget(String budget) { this.budget = budget; }
    public void setActivities(String activities) { this.activities = activities; }
    public void setAccommodations(String accommodations) { this.accommodations = accommodations; }
    public void setTransportation(String transportation) { this.transportation = transportation; }
    public void setFood(String food) { this.food = food; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public void setDescription(String description) { this.description = description; }
    public void setTravelStyle(String travelStyle) { this.travelStyle = travelStyle; }
    public void setVibePreference(String vibePreference) { this.vibePreference = vibePreference; }
    public void setMembers(Set<User> members) { this.members = members; }
}
