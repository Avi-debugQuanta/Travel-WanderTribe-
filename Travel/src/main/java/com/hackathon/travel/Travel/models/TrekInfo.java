package com.hackathon.travel.Travel.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TrekInfo {
    private String id;
    private String name;
    private String base;
    private String endpoint;
    private int days;
    private String difficulty;
    private int altitude_m;
    private List<Integer> season;
    private String highlights;
    private boolean permit_required;
    private boolean guide_recommended;

    public TrekInfo() {}

    public String getId() { return id; }
    public String getName() { return name; }
    public String getBase() { return base; }
    public String getEndpoint() { return endpoint; }
    public int getDays() { return days; }
    public String getDifficulty() { return difficulty; }
    public int getAltitude_m() { return altitude_m; }
    public List<Integer> getSeason() { return season; }
    public String getHighlights() { return highlights; }
    public boolean isPermit_required() { return permit_required; }
    public boolean isGuide_recommended() { return guide_recommended; }

    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setBase(String base) { this.base = base; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
    public void setDays(int days) { this.days = days; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public void setAltitude_m(int altitude_m) { this.altitude_m = altitude_m; }
    public void setSeason(List<Integer> season) { this.season = season; }
    public void setHighlights(String highlights) { this.highlights = highlights; }
    public void setPermit_required(boolean permit_required) { this.permit_required = permit_required; }
    public void setGuide_recommended(boolean guide_recommended) { this.guide_recommended = guide_recommended; }
}
