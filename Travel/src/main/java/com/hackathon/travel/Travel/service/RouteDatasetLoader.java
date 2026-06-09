package com.hackathon.travel.Travel.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackathon.travel.Travel.models.Place;
import com.hackathon.travel.Travel.models.RegionData;
import com.hackathon.travel.Travel.models.RouteEdge;
import com.hackathon.travel.Travel.models.SubRegion;
import com.hackathon.travel.Travel.models.TrekInfo;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Loads the route-graph knowledge base (himachal.json) at startup and builds an
 * in-memory adjacency graph used by retrieval and route planning. This is the
 * "ground truth" that keeps the AI from hallucinating impossible geography.
 */
@Service
public class RouteDatasetLoader {

    private static final String[] DATASET_FILES = { "data/himachal.json" };

    private final Map<String, Place> placesById = new LinkedHashMap<>();
    private final Map<String, SubRegion> subRegionsById = new LinkedHashMap<>();
    private final Map<String, List<Place>> placesBySubRegion = new HashMap<>();
    private final Map<String, List<RouteEdge>> adjacency = new HashMap<>();
    private final List<RouteEdge> allEdges = new ArrayList<>();
    private final List<TrekInfo> allTreks = new ArrayList<>();

    @PostConstruct
    public void load() {
        ObjectMapper mapper = new ObjectMapper();
        for (String file : DATASET_FILES) {
            try (InputStream is = new ClassPathResource(file).getInputStream()) {
                RegionData data = mapper.readValue(is, RegionData.class);
                ingest(data);
                System.out.println("[RouteDatasetLoader] Loaded " + file + ": "
                        + (data.getPlaces() != null ? data.getPlaces().size() : 0) + " places, "
                        + (data.getEdges() != null ? data.getEdges().size() : 0) + " edges, "
                        + (data.getTreks() != null ? data.getTreks().size() : 0) + " treks");
            } catch (Exception e) {
                System.err.println("[RouteDatasetLoader] Failed to load " + file + ": " + e.getMessage());
            }
        }
        System.out.println("[RouteDatasetLoader] Graph ready: " + placesById.size()
                + " places, " + allEdges.size() + " directed edges.");
    }

    private void ingest(RegionData data) {
        if (data.getSubRegions() != null) {
            for (SubRegion sr : data.getSubRegions()) {
                subRegionsById.put(sr.getId(), sr);
            }
        }
        if (data.getPlaces() != null) {
            for (Place p : data.getPlaces()) {
                placesById.put(p.getId(), p);
                placesBySubRegion.computeIfAbsent(p.getSubRegion(), k -> new ArrayList<>()).add(p);
            }
        }
        if (data.getEdges() != null) {
            for (RouteEdge e : data.getEdges()) {
                addEdge(e);
                if (e.isBidirectional()) {
                    addEdge(e.reversed());
                }
            }
        }
        if (data.getTreks() != null) {
            allTreks.addAll(data.getTreks());
        }
    }

    private void addEdge(RouteEdge e) {
        allEdges.add(e);
        adjacency.computeIfAbsent(e.getFrom(), k -> new ArrayList<>()).add(e);
    }

    public Place getPlace(String id) { return placesById.get(id); }

    public Map<String, Place> getPlacesById() { return placesById; }

    public List<Place> getAllPlaces() { return new ArrayList<>(placesById.values()); }

    public List<Place> getPlacesBySubRegion(String subRegionId) {
        return placesBySubRegion.getOrDefault(subRegionId, new ArrayList<>());
    }

    public SubRegion getSubRegion(String id) { return subRegionsById.get(id); }

    public List<SubRegion> getAllSubRegions() { return new ArrayList<>(subRegionsById.values()); }

    public List<RouteEdge> getEdgesFrom(String placeId) {
        return adjacency.getOrDefault(placeId, new ArrayList<>());
    }

    public RouteEdge getEdge(String fromId, String toId) {
        for (RouteEdge e : getEdgesFrom(fromId)) {
            if (e.getTo().equals(toId)) return e;
        }
        return null;
    }

    public List<RouteEdge> getAllEdges() { return allEdges; }

    public List<TrekInfo> getAllTreks() { return allTreks; }

    public List<TrekInfo> getTreksForPlaces(List<String> placeIds) {
        List<TrekInfo> result = new ArrayList<>();
        for (TrekInfo t : allTreks) {
            if (placeIds.contains(t.getBase()) || placeIds.contains(t.getEndpoint())) {
                result.add(t);
            }
        }
        return result;
    }

    public boolean isLoaded() { return !placesById.isEmpty(); }
}
