package com.hackathon.travel.Travel.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SubRegion {
    private String id;
    private String name;
    private String entryHub;
    private List<String> connectedTo;

    public SubRegion() {}

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEntryHub() { return entryHub; }
    public List<String> getConnectedTo() { return connectedTo; }

    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEntryHub(String entryHub) { this.entryHub = entryHub; }
    public void setConnectedTo(List<String> connectedTo) { this.connectedTo = connectedTo; }
}
