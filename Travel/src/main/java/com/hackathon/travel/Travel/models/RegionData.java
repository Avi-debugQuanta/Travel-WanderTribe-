package com.hackathon.travel.Travel.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RegionData {
    private String region;
    private String regionName;
    private List<SubRegion> subRegions = new ArrayList<>();
    private List<Place> places = new ArrayList<>();
    private List<RouteEdge> edges = new ArrayList<>();
    private List<TrekInfo> treks = new ArrayList<>();

    public RegionData() {}

    public String getRegion() { return region; }
    public String getRegionName() { return regionName; }
    public List<SubRegion> getSubRegions() { return subRegions; }
    public List<Place> getPlaces() { return places; }
    public List<RouteEdge> getEdges() { return edges; }
    public List<TrekInfo> getTreks() { return treks; }

    public void setRegion(String region) { this.region = region; }
    public void setRegionName(String regionName) { this.regionName = regionName; }
    public void setSubRegions(List<SubRegion> subRegions) { this.subRegions = subRegions; }
    public void setPlaces(List<Place> places) { this.places = places; }
    public void setEdges(List<RouteEdge> edges) { this.edges = edges; }
    public void setTreks(List<TrekInfo> treks) { this.treks = treks; }
}
