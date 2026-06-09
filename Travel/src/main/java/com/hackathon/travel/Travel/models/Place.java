package com.hackathon.travel.Travel.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Place {
    private String id;
    private String name;
    private String subRegion;
    private double lat;
    private double lon;
    private int altitude_m;
    private String type;
    private List<String> tags;
    private double rating;
    private int reviewCount;
    private String reviewSnippet;
    private List<Integer> bestMonths;
    private int idealHours;
    private String bookingUrl;

    public Place() {}

    public String getId() { return id; }
    public String getName() { return name; }
    public String getSubRegion() { return subRegion; }
    public double getLat() { return lat; }
    public double getLon() { return lon; }
    public int getAltitude_m() { return altitude_m; }
    public String getType() { return type; }
    public List<String> getTags() { return tags; }
    public double getRating() { return rating; }
    public int getReviewCount() { return reviewCount; }
    public String getReviewSnippet() { return reviewSnippet; }
    public List<Integer> getBestMonths() { return bestMonths; }
    public int getIdealHours() { return idealHours; }
    public String getBookingUrl() { return bookingUrl; }

    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setSubRegion(String subRegion) { this.subRegion = subRegion; }
    public void setLat(double lat) { this.lat = lat; }
    public void setLon(double lon) { this.lon = lon; }
    public void setAltitude_m(int altitude_m) { this.altitude_m = altitude_m; }
    public void setType(String type) { this.type = type; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public void setRating(double rating) { this.rating = rating; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }
    public void setReviewSnippet(String reviewSnippet) { this.reviewSnippet = reviewSnippet; }
    public void setBestMonths(List<Integer> bestMonths) { this.bestMonths = bestMonths; }
    public void setIdealHours(int idealHours) { this.idealHours = idealHours; }
    public void setBookingUrl(String bookingUrl) { this.bookingUrl = bookingUrl; }
}
