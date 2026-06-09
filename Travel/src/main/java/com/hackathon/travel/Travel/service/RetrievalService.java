package com.hackathon.travel.Travel.service;

import com.hackathon.travel.Travel.models.Idea;
import com.hackathon.travel.Travel.models.Place;
import com.hackathon.travel.Travel.models.SubRegion;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Retrieval-Augmented Generation (RAG) retriever.
 * Given a free-text destination + travel style + group ideas + travel month,
 * it resolves which sub-regions are relevant and returns the best-matching
 * grounded places using a lightweight hybrid (lexical keyword + tag + season)
 * score. No paid embedding calls — keeps it free and fast.
 */
@Service
public class RetrievalService {

    private final RouteDatasetLoader dataset;

    public RetrievalService(RouteDatasetLoader dataset) {
        this.dataset = dataset;
    }

    public static class RetrievalResult {
        public final String entryHubId;
        public final List<Place> places;
        public final List<String> subRegions;

        public RetrievalResult(String entryHubId, List<Place> places, List<String> subRegions) {
            this.entryHubId = entryHubId;
            this.places = places;
            this.subRegions = subRegions;
        }

        public boolean isEmpty() { return places == null || places.isEmpty(); }
    }

    /** Map travel-style keywords to the place tags they prefer. */
    private static final Map<String, List<String>> STYLE_TAGS = new LinkedHashMap<>();
    static {
        STYLE_TAGS.put("adventure", Arrays.asList("adventure", "trek", "paragliding", "skiing", "snow", "high-pass", "camping", "river-rafting"));
        STYLE_TAGS.put("offbeat", Arrays.asList("offbeat", "quiet", "village", "isolated", "hidden", "no-roads", "offgrid"));
        STYLE_TAGS.put("chill", Arrays.asList("cafes", "riverside", "chill", "backpacker", "hot-springs", "quiet"));
        STYLE_TAGS.put("relax", Arrays.asList("cafes", "riverside", "chill", "hot-springs", "quiet", "forest"));
        STYLE_TAGS.put("spiritual", Arrays.asList("temple", "monastery", "buddhist", "pilgrimage", "gurudwara"));
        STYLE_TAGS.put("family", Arrays.asList("viewpoint", "temple", "snow", "ropeway", "heritage", "lake"));
        STYLE_TAGS.put("sightseeing", Arrays.asList("viewpoint", "heritage", "temple", "monastery", "iconic", "waterfall"));
        STYLE_TAGS.put("nature", Arrays.asList("lake", "waterfall", "forest", "nature", "national-park", "tea-gardens"));
        STYLE_TAGS.put("luxury", Arrays.asList("resorts", "mall-road", "shopping", "heritage"));
        STYLE_TAGS.put("party", Arrays.asList("cafes", "backpacker", "trance", "live-music", "nightlife"));
    }

    /**
     * Resolve which sub-regions a free-text destination refers to.
     * Matches on sub-region name, place names and tags, then pulls in directly
     * connected sub-regions so the planner can route across valleys.
     */
    public List<String> resolveSubRegions(String destination) {
        String q = norm(destination);
        Set<String> matched = new LinkedHashSet<>();

        for (SubRegion sr : dataset.getAllSubRegions()) {
            if (q.contains(norm(sr.getName())) || norm(sr.getName()).contains(q)) {
                matched.add(sr.getId());
            }
        }

        for (Place p : dataset.getAllPlaces()) {
            if (q.contains(norm(p.getName()))) {
                matched.add(p.getSubRegion());
            }
        }

        // Keyword aliases for common phrasings.
        if (matched.isEmpty()) {
            if (q.contains("spiti") || q.contains("lahaul") || q.contains("kaza")) matched.add("lahaul_spiti");
            if (q.contains("parvati") || q.contains("kasol") || q.contains("tosh") || q.contains("kheerganga")) matched.add("parvati_valley");
            if (q.contains("manali") || q.contains("kullu") || q.contains("solang")) matched.add("kullu_manali");
            if (q.contains("shimla") || q.contains("kufri") || q.contains("narkanda")) matched.add("shimla_area");
            if (q.contains("dharamshala") || q.contains("mcleod") || q.contains("triund") || q.contains("kangra") || q.contains("bir")) matched.add("dharamshala_kangra");
        }

        // Pull in directly connected sub-regions for richer routing options.
        Set<String> expanded = new LinkedHashSet<>(matched);
        for (String id : matched) {
            SubRegion sr = dataset.getSubRegion(id);
            if (sr != null && sr.getConnectedTo() != null) {
                expanded.addAll(sr.getConnectedTo());
            }
        }
        return new ArrayList<>(expanded);
    }

    /** Determine the best entry hub for the primary destination. */
    private String resolveEntryHub(String destination, List<String> subRegions) {
        String q = norm(destination);
        // If the destination names an actual place, use it as the hub.
        for (Place p : dataset.getAllPlaces()) {
            if (q.contains(norm(p.getName())) && subRegions.contains(p.getSubRegion())) {
                return p.getId();
            }
        }
        // Otherwise fall back to the first matched sub-region's entry hub.
        for (String srId : subRegions) {
            SubRegion sr = dataset.getSubRegion(srId);
            if (sr != null && sr.getEntryHub() != null) return sr.getEntryHub();
        }
        return null;
    }

    /**
     * Main retrieval entry point. Returns grounded places ranked by relevance.
     *
     * @param month 1-12 travel month, or 0 if unknown (season filter skipped).
     */
    public RetrievalResult retrievePlaces(String destination, String travelStyle,
                                          List<Idea> ideas, int month, int maxPlaces) {
        if (!dataset.isLoaded()) {
            return new RetrievalResult(null, new ArrayList<>(), new ArrayList<>());
        }
        // The primary sub-regions are the ones the destination explicitly names.
        // We pool candidates from these to keep the trip geographically coherent
        // (no pulling Spiti/Shimla into a short Manali trip). Connected regions
        // are only used as a fallback when the primary pool is too small.
        List<String> primary = resolveSubRegionsPrimaryOnly(destination);
        List<String> expanded = resolveSubRegions(destination);
        if (primary.isEmpty() && expanded.isEmpty()) {
            return new RetrievalResult(null, new ArrayList<>(), new ArrayList<>());
        }

        List<String> pool = primary.isEmpty() ? expanded : new ArrayList<>(primary);
        int poolSize = 0;
        for (String srId : pool) poolSize += inSeasonCount(dataset.getPlacesBySubRegion(srId), month);
        // Only reach into connected regions when the named region is genuinely
        // too small to fill a trip (keeps trips coherent within one valley).
        if (poolSize < 6) {
            for (String srId : expanded) if (!pool.contains(srId)) pool.add(srId);
        }

        String entryHub = resolveEntryHub(destination, pool);
        List<String> subRegions = pool;

        Set<String> styleTags = styleTagsFor(travelStyle);
        Set<String> ideaKeywords = ideaKeywords(ideas);

        List<ScoredPlace> scored = new ArrayList<>();
        for (String srId : subRegions) {
            boolean isPrimary = primary.isEmpty() || primary.contains(srId);
            for (Place p : dataset.getPlacesBySubRegion(srId)) {
                double score = scorePlace(p, styleTags, ideaKeywords, month, isPrimary, p.getId().equals(entryHub));
                if (score > Double.NEGATIVE_INFINITY) {
                    scored.add(new ScoredPlace(p, score));
                }
            }
        }

        scored.sort((a, b) -> Double.compare(b.score, a.score));

        List<Place> result = new ArrayList<>();
        // Always include the entry hub first if present so routing has a start.
        if (entryHub != null && dataset.getPlace(entryHub) != null) {
            result.add(dataset.getPlace(entryHub));
        }
        for (ScoredPlace sp : scored) {
            if (result.size() >= maxPlaces) break;
            if (!containsPlace(result, sp.place.getId())) {
                result.add(sp.place);
            }
        }
        return new RetrievalResult(entryHub, result, subRegions);
    }

    private List<String> resolveSubRegionsPrimaryOnly(String destination) {
        String q = norm(destination);
        Set<String> matched = new LinkedHashSet<>();
        for (SubRegion sr : dataset.getAllSubRegions()) {
            if (q.contains(norm(sr.getName())) || norm(sr.getName()).contains(q)) matched.add(sr.getId());
        }
        for (Place p : dataset.getAllPlaces()) {
            if (q.contains(norm(p.getName()))) matched.add(p.getSubRegion());
        }
        if (matched.isEmpty()) {
            if (q.contains("spiti") || q.contains("lahaul") || q.contains("kaza")) matched.add("lahaul_spiti");
            if (q.contains("parvati") || q.contains("kasol") || q.contains("tosh") || q.contains("kheerganga")) matched.add("parvati_valley");
            if (q.contains("manali") || q.contains("kullu") || q.contains("solang")) matched.add("kullu_manali");
            if (q.contains("shimla") || q.contains("kufri") || q.contains("narkanda")) matched.add("shimla_area");
            if (q.contains("dharamshala") || q.contains("mcleod") || q.contains("triund") || q.contains("kangra") || q.contains("bir")) matched.add("dharamshala_kangra");
        }
        return new ArrayList<>(matched);
    }

    private double scorePlace(Place p, Set<String> styleTags, Set<String> ideaKeywords,
                              int month, boolean isPrimary, boolean isHub) {
        double score = 0;

        // Season fit: hard filter when month is known.
        if (month >= 1 && month <= 12 && p.getBestMonths() != null && !p.getBestMonths().isEmpty()) {
            if (p.getBestMonths().contains(month)) {
                score += 3.0;
            } else {
                // Not in season — heavily penalise but keep hub reachable.
                if (!isHub) return Double.NEGATIVE_INFINITY;
            }
        }

        // Base popularity from rating.
        score += p.getRating();

        // Tag overlap with travel style.
        if (p.getTags() != null) {
            for (String tag : p.getTags()) {
                if (styleTags.contains(tag)) score += 1.5;
                if (ideaKeywords.contains(tag)) score += 1.0;
            }
        }

        // Group-idea keyword match on the place name.
        String name = norm(p.getName());
        for (String kw : ideaKeywords) {
            if (kw.length() >= 4 && name.contains(kw)) score += 2.0;
        }

        if (isPrimary) score += 2.0;
        if (isHub) score += 5.0;

        return score;
    }

    private Set<String> styleTagsFor(String travelStyle) {
        Set<String> tags = new LinkedHashSet<>();
        if (travelStyle == null) return tags;
        String s = norm(travelStyle);
        for (Map.Entry<String, List<String>> e : STYLE_TAGS.entrySet()) {
            if (s.contains(e.getKey())) tags.addAll(e.getValue());
        }
        // Default to a balanced mix if nothing matched.
        if (tags.isEmpty()) {
            tags.addAll(Arrays.asList("viewpoint", "cafes", "trek", "temple", "lake", "waterfall"));
        }
        return tags;
    }

    private Set<String> ideaKeywords(List<Idea> ideas) {
        Set<String> kws = new LinkedHashSet<>();
        if (ideas == null) return kws;
        for (Idea i : ideas) {
            if (i.getTitle() != null) {
                for (String w : norm(i.getTitle()).split("[^a-z0-9]+")) {
                    if (w.length() >= 4) kws.add(w);
                }
            }
        }
        return kws;
    }

    private int inSeasonCount(List<Place> places, int month) {
        if (month < 1 || month > 12) return places.size();
        int c = 0;
        for (Place p : places) {
            if (p.getBestMonths() == null || p.getBestMonths().isEmpty() || p.getBestMonths().contains(month)) c++;
        }
        return c;
    }

    private boolean containsPlace(List<Place> list, String id) {
        for (Place p : list) if (p.getId().equals(id)) return true;
        return false;
    }

    private String norm(String s) {
        return s == null ? "" : s.toLowerCase(Locale.ROOT).trim();
    }

    private static class ScoredPlace {
        final Place place;
        final double score;
        ScoredPlace(Place place, double score) { this.place = place; this.score = score; }
    }
}
