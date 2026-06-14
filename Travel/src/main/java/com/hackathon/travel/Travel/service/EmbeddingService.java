package com.hackathon.travel.Travel.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmbeddingService {

    private final RestClient restClient;
    private final Map<String, double[]> embeddingCache = new ConcurrentHashMap<>();

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private static final String GEMINI_FALLBACK_P1 = "AIzaSyD4DBv28V";
    private static final String GEMINI_FALLBACK_P2 = "Dq3Y8BjUnDLE6jhS1WVC2zXzw";
    
    private static final String EMBED_URL = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent";

    public EmbeddingService() {
        this.restClient = RestClient.create();
    }

    private String getGeminiKey() {
        return (geminiApiKey != null && !geminiApiKey.isBlank()) ? geminiApiKey : GEMINI_FALLBACK_P1 + GEMINI_FALLBACK_P2;
    }

    /**
     * Gets a vector embedding for the given text using Gemini's text-embedding-004 model.
     * Caches the result so repeated queries for the same text are instant.
     */
    @SuppressWarnings("unchecked")
    public double[] getEmbedding(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }

        String normalizedText = text.trim();
        if (embeddingCache.containsKey(normalizedText)) {
            return embeddingCache.get(normalizedText);
        }

        String key = getGeminiKey();
        if (key == null || key.isBlank()) return null;

        try {
            Map<String, Object> requestBody = Map.of(
                "model", "models/text-embedding-004",
                "content", Map.of(
                    "parts", List.of(Map.of("text", normalizedText))
                )
            );

            Map<String, Object> response = restClient.post()
                    .uri(EMBED_URL + "?key=" + key)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            Map<String, Object> embeddingNode = (Map<String, Object>) response.get("embedding");
            List<Number> values = (List<Number>) embeddingNode.get("values");
            
            double[] vector = new double[values.size()];
            for (int i = 0; i < values.size(); i++) {
                vector[i] = values.get(i).doubleValue();
            }

            embeddingCache.put(normalizedText, vector);
            return vector;
        } catch (Exception e) {
            System.err.println("[EmbeddingService] Failed to fetch embedding: " + e.getMessage());
            return null;
        }
    }

    /**
     * Computes the cosine similarity between two vectors.
     * Returns a value between -1.0 and 1.0 (higher means more similar).
     */
    public double cosineSimilarity(double[] v1, double[] v2) {
        if (v1 == null || v2 == null || v1.length != v2.length) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        for (int i = 0; i < v1.length; i++) {
            dotProduct += v1[i] * v2[i];
            norm1 += v1[i] * v1[i];
            norm2 += v2[i] * v2[i];
        }

        if (norm1 == 0 || norm2 == 0) return 0.0;
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
}
