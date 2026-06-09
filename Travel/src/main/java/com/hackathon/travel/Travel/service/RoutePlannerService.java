package com.hackathon.travel.Travel.service;

import com.hackathon.travel.Travel.models.Place;
import com.hackathon.travel.Travel.models.RouteEdge;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Set;

/**
 * Turns a set of retrieved places into a geographically coherent, day-by-day
 * route. Uses the route graph for real travel times:
 *  - Dijkstra shortest path (by drive/trek hours) between any two places
 *  - Greedy nearest-neighbour ordering from the entry hub
 *  - Daily time-budget splitting (travel + sightseeing hours per day)
 */
@Service
public class RoutePlannerService {

    private final RouteDatasetLoader dataset;

    public RoutePlannerService(RouteDatasetLoader dataset) {
        this.dataset = dataset;
    }

    /** A single travel leg from one place to the next, possibly via intermediate hops. */
    public static class Leg {
        public final Place from;
        public final Place to;
        public final double km;
        public final double hours;
        public final String risk;
        public final String mode;
        public final List<String> viaNames;

        public Leg(Place from, Place to, double km, double hours, String risk, String mode, List<String> viaNames) {
            this.from = from;
            this.to = to;
            this.km = km;
            this.hours = hours;
            this.risk = risk;
            this.mode = mode;
            this.viaNames = viaNames;
        }
    }

    public static class DayPlan {
        public int day;
        public final List<Place> places = new ArrayList<>();
        public final List<Leg> legs = new ArrayList<>();
        public double driveKm = 0;
        public double driveHours = 0;
        public double activityHours = 0;

        public DayPlan(int day) { this.day = day; }
    }

    private static class PathResult {
        boolean found;
        double km;
        double hours;
        String risk = "green";
        List<String> viaNames = new ArrayList<>();
        String mode = "drive";
    }

    /**
     * Plan an ordered, day-split route.
     *
     * @param places       retrieved candidate places (first one ideally the hub)
     * @param entryHubId   start place id (nullable)
     * @param totalDays    number of trip days
     * @param travelStyle  affects how aggressive the daily travel budget is
     */
    public List<DayPlan> plan(List<Place> places, String entryHubId, int totalDays, String travelStyle) {
        List<DayPlan> result = new ArrayList<>();
        if (places == null || places.isEmpty()) return result;
        if (totalDays < 1) totalDays = 1;

        List<Place> ordered = greedyOrder(places, entryHubId);

        // Trim to what can realistically be visited so nothing gets crammed.
        int maxPerDay = maxPlacesPerDay(travelStyle);
        int cap = Math.min(ordered.size(), totalDays * maxPerDay);
        if (cap < ordered.size()) ordered = new ArrayList<>(ordered.subList(0, cap));

        int n = ordered.size();
        int days = Math.min(totalDays, n);

        // Even round-robin distribution: place i -> day floor(i * days / n).
        // Guarantees every day is used and no single day is overloaded.
        DayPlan[] buckets = new DayPlan[days];
        for (int d = 0; d < days; d++) buckets[d] = new DayPlan(d + 1);

        for (int i = 0; i < n; i++) {
            int d = (int) ((long) i * days / n);
            if (d >= days) d = days - 1;
            buckets[d].places.add(ordered.get(i));
        }

        // Build travel legs between consecutive places; a leg belongs to the day
        // of the place being travelled TO (i.e. it's that day's transfer/drive).
        for (int i = 1; i < n; i++) {
            Place prev = ordered.get(i - 1);
            Place cur = ordered.get(i);
            int d = (int) ((long) i * days / n);
            if (d >= days) d = days - 1;
            Leg leg = buildLeg(prev, cur);
            buckets[d].legs.add(leg);
            buckets[d].driveKm += leg.km;
            buckets[d].driveHours += leg.hours;
        }

        for (DayPlan dp : buckets) {
            for (Place p : dp.places) dp.activityHours += Math.max(2, p.getIdealHours());
            result.add(dp);
        }
        return result;
    }

    private int maxPlacesPerDay(String style) {
        String s = style == null ? "" : style.toLowerCase(Locale.ROOT);
        if (s.contains("adventure") || s.contains("road")) return 3;
        if (s.contains("chill") || s.contains("relax")) return 2;
        return 3;
    }

    /** Greedy nearest-neighbour ordering starting from the hub. */
    private List<Place> greedyOrder(List<Place> places, String entryHubId) {
        List<Place> pool = new ArrayList<>(places);
        List<Place> ordered = new ArrayList<>();

        Place start = null;
        for (Place p : pool) {
            if (p.getId().equals(entryHubId)) { start = p; break; }
        }
        if (start == null) start = pool.get(0);

        ordered.add(start);
        pool.remove(start);

        Place curr = start;
        while (!pool.isEmpty()) {
            Place nearest = null;
            double best = Double.MAX_VALUE;
            for (Place cand : pool) {
                double cost = travelCost(curr, cand);
                if (cost < best) { best = cost; nearest = cand; }
            }
            if (nearest == null) nearest = pool.get(0);
            ordered.add(nearest);
            pool.remove(nearest);
            curr = nearest;
        }
        return ordered;
    }

    private double travelCost(Place a, Place b) {
        PathResult pr = shortestPath(a.getId(), b.getId());
        if (pr.found) return pr.hours;
        // Disconnected in the graph — fall back to straight-line proxy so we still order sensibly.
        return 100 + haversineKm(a, b) / 30.0;
    }

    private Leg buildLeg(Place from, Place to) {
        PathResult pr = shortestPath(from.getId(), to.getId());
        if (pr.found) {
            return new Leg(from, to, round(pr.km), round(pr.hours), pr.risk, pr.mode, pr.viaNames);
        }
        double km = haversineKm(from, to);
        return new Leg(from, to, round(km), round(km / 35.0), "amber", "drive", new ArrayList<>());
    }

    /** Dijkstra over the route graph, weighted by duration_hours. */
    private PathResult shortestPath(String fromId, String toId) {
        PathResult result = new PathResult();
        if (fromId.equals(toId)) { result.found = true; return result; }

        Map<String, Double> dist = new HashMap<>();
        Map<String, RouteEdge> prevEdge = new HashMap<>();
        Map<String, String> prevNode = new HashMap<>();
        Set<String> visited = new HashSet<>();
        PriorityQueue<String> pq = new PriorityQueue<>(
                (x, y) -> Double.compare(dist.getOrDefault(x, Double.MAX_VALUE), dist.getOrDefault(y, Double.MAX_VALUE)));

        dist.put(fromId, 0.0);
        pq.add(fromId);

        while (!pq.isEmpty()) {
            String u = pq.poll();
            if (!visited.add(u)) continue;
            if (u.equals(toId)) break;
            for (RouteEdge e : dataset.getEdgesFrom(u)) {
                double nd = dist.getOrDefault(u, Double.MAX_VALUE) + e.getDuration_hours();
                if (nd < dist.getOrDefault(e.getTo(), Double.MAX_VALUE)) {
                    dist.put(e.getTo(), nd);
                    prevEdge.put(e.getTo(), e);
                    prevNode.put(e.getTo(), u);
                    pq.add(e.getTo());
                }
            }
        }

        if (!dist.containsKey(toId)) return result; // not found

        // Reconstruct path.
        LinkedList<RouteEdge> path = new LinkedList<>();
        String cur = toId;
        while (prevEdge.containsKey(cur)) {
            RouteEdge e = prevEdge.get(cur);
            path.addFirst(e);
            cur = prevNode.get(cur);
        }

        result.found = true;
        int riskRank = 0;
        boolean anyTrek = false, anyDrive = false;
        for (int i = 0; i < path.size(); i++) {
            RouteEdge e = path.get(i);
            result.km += e.getKm();
            result.hours += e.getDuration_hours();
            riskRank = Math.max(riskRank, riskRank(e.getRisk()));
            if ("trek".equalsIgnoreCase(e.getMode())) anyTrek = true; else anyDrive = true;
            // Record intermediate stop names (exclude the final destination).
            if (i < path.size() - 1) {
                Place via = dataset.getPlace(e.getTo());
                if (via != null) result.viaNames.add(via.getName());
            }
        }
        result.risk = riskLabel(riskRank);
        result.mode = (anyTrek && anyDrive) ? "drive+trek" : (anyTrek ? "trek" : "drive");
        return result;
    }

    private int riskRank(String risk) {
        if (risk == null) return 0;
        switch (risk.toLowerCase(Locale.ROOT)) {
            case "red": return 2;
            case "amber": return 1;
            default: return 0;
        }
    }

    private String riskLabel(int rank) {
        switch (rank) {
            case 2: return "red";
            case 1: return "amber";
            default: return "green";
        }
    }

    private double haversineKm(Place a, Place b) {
        double R = 6371;
        double dLat = Math.toRadians(b.getLat() - a.getLat());
        double dLon = Math.toRadians(b.getLon() - a.getLon());
        double s = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(a.getLat())) * Math.cos(Math.toRadians(b.getLat()))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
    }

    private double round(double v) { return Math.round(v * 10.0) / 10.0; }

    // Exposed for callers that want simple A->B facts.
    public Leg leg(String fromId, String toId) {
        Place a = dataset.getPlace(fromId);
        Place b = dataset.getPlace(toId);
        if (a == null || b == null) return null;
        return buildLeg(a, b);
    }
}
