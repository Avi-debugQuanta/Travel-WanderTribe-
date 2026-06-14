package com.hackathon.travel.Travel;

import com.hackathon.travel.Travel.service.RetrievalService;
import com.hackathon.travel.Travel.service.RoutePlannerService;
import com.hackathon.travel.Travel.service.RouteDatasetLoader;
import com.hackathon.travel.Travel.models.Place;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RagPipelineTest {

    private static RouteDatasetLoader loader;
    private static RetrievalService retrieval;
    private static RoutePlannerService planner;

    @BeforeAll
    static void setup() {
        loader = new RouteDatasetLoader();
        loader.load();
        com.hackathon.travel.Travel.service.EmbeddingService embeddingService = new com.hackathon.travel.Travel.service.EmbeddingService();
        retrieval = new RetrievalService(loader, embeddingService);
        planner = new RoutePlannerService(loader);
    }

    @Test
    void datasetLoads() {
        assertTrue(loader.isLoaded(), "dataset should load");
        assertTrue(loader.getAllPlaces().size() >= 55, "should have 55+ places");
        System.out.println("Places=" + loader.getAllPlaces().size()
                + " Edges=" + loader.getAllEdges().size()
                + " Treks=" + loader.getAllTreks().size());
    }

    @Test
    void manaliRouteIsCoherent() {
        printPlan("Manali", "Adventure", 5, 6);
    }

    @Test
    void parvatiRouteIsCoherent() {
        printPlan("Kasol Parvati Valley", "Offbeat", 4, 9);
    }

    @Test
    void spitiRouteIsCoherent() {
        printPlan("Spiti Valley", "Adventure", 7, 7);
    }

    private void printPlan(String dest, String style, int days, int month) {
        RetrievalService.RetrievalResult r =
                retrieval.retrievePlaces(dest, style, new ArrayList<>(), month, days * 3);
        System.out.println("\n=== " + dest + " (" + style + ", " + days + "d, month " + month + ") ===");
        System.out.println("subRegions=" + r.subRegions + " hub=" + r.entryHubId);
        assertFalse(r.isEmpty(), "retrieval should not be empty for " + dest);

        var plan = planner.plan(r.places, r.entryHubId, days, style);
        assertFalse(plan.isEmpty(), "plan should not be empty for " + dest);
        for (var d : plan) {
            StringBuilder names = new StringBuilder();
            for (Place p : d.places) names.append(p.getName()).append(" -> ");
            System.out.printf("Day %d: %s [%.0f km, %.1f hrs]%n", d.day, names, d.driveKm, d.driveHours);
            for (var leg : d.legs) {
                System.out.printf("    %s->%s %.0fkm %.1fh %s %s%n",
                        leg.from.getName(), leg.to.getName(), leg.km, leg.hours, leg.mode, leg.risk);
            }
        }
    }
}
