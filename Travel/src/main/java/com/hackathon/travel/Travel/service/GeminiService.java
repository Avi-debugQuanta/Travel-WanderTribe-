package com.hackathon.travel.Travel.service;

import com.hackathon.travel.Travel.models.Idea;
import com.hackathon.travel.Travel.models.ChatMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.http.MediaType;
import org.springframework.core.ParameterizedTypeReference;
import com.hackathon.travel.Travel.models.ai.ItineraryResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    private final RestClient restClient;

    @Value("${python.service.url:http://localhost:8000}")
    private String pythonServiceUrl;

    public GeminiService() {
        this.restClient = RestClient.create();
    }

    private String extractDestination(String tripContext) {
        if (tripContext == null) return "";
        for (String line : tripContext.split("\n")) {
            if (line.contains("Destination:")) {
                return line.substring(line.indexOf("Destination:") + 12).trim();
            }
        }
        return "";
    }

    public String chat(String userMessage, List<ChatMessage> history, String tripContext) {
        try {
            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("prompt", userMessage);
            
            List<Map<String, String>> historyList = new ArrayList<>();
            if (history != null) {
                for (ChatMessage msg : history) {
                    historyList.add(Map.of("role", msg.getRole().name(), "content", msg.getContent()));
                }
            }
            requestBody.put("history", historyList);
            
            Map<String, String> contextMap = new HashMap<>();
            if (tripContext != null) {
                contextMap.put("destination", extractDestination(tripContext));
                contextMap.put("fullContext", tripContext);
            }
            requestBody.put("tripContext", contextMap);

            Map<String, Object> response = restClient.post()
                    .uri(pythonServiceUrl + "/ai/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
                    
            return (String) response.get("response");
        } catch (Exception e) {
            return "AI Service Error: " + e.getMessage();
        }
    }

    public ItineraryResponse curateItinerary(String destination, String startDate, String endDate,
                                   String budget, String travelStyle, List<Idea> ideas,
                                   String chatSummary, String clarificationAnswers) {
        String ideasText = ideas.stream()
                .limit(5)
                .map(i -> "- " + i.getTitle() + " (" + i.getVoteCount() + " upvotes)")
                .collect(Collectors.joining("\n"));

        try {
            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("destination", destination);
            requestBody.put("startDate", startDate);
            requestBody.put("endDate", endDate);
            requestBody.put("budget", budget);
            requestBody.put("travelStyle", travelStyle);
            requestBody.put("ideas", ideasText);
            requestBody.put("chatSummary", chatSummary != null ? chatSummary : "");
            requestBody.put("clarificationAnswers", clarificationAnswers);

            Map<String, Object> response = restClient.post()
                    .uri(pythonServiceUrl + "/ai/curate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
                    
            ObjectMapper mapper = new ObjectMapper();
            return mapper.convertValue(response, ItineraryResponse.class);
        } catch (Exception e) {
            ItineraryResponse fallback = new ItineraryResponse();
            fallback.setTips(List.of("Error calling AI Service: " + e.getMessage()));
            return fallback;
        }
    }

    public String getSeasonRecommendation(String destination) {
        try {
            Map<String, Object> requestBody = Map.of("destination", destination);
            Map<String, Object> response = restClient.post()
                    .uri(pythonServiceUrl + "/ai/season")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
                    
            return (String) response.get("response");
        } catch (Exception e) {
            return "AI Service Error: " + e.getMessage();
        }
    }

    public void streamChat(String userMessage, List<ChatMessage> history, String tripContext, java.util.function.Consumer<String> onToken, Runnable onComplete, java.util.function.Consumer<String> onError) {
        try {
            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("prompt", userMessage);
            
            List<Map<String, String>> historyList = new ArrayList<>();
            if (history != null) {
                for (ChatMessage msg : history) {
                    historyList.add(Map.of("role", msg.getRole().name(), "content", msg.getContent()));
                }
            }
            requestBody.put("history", historyList);
            
            Map<String, String> contextMap = new HashMap<>();
            if (tripContext != null) {
                contextMap.put("destination", extractDestination(tripContext));
                contextMap.put("fullContext", tripContext);
            }
            requestBody.put("tripContext", contextMap);

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String jsonBody = mapper.writeValueAsString(requestBody);

            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(pythonServiceUrl + "/ai/chat/stream"))
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            client.sendAsync(request, java.net.http.HttpResponse.BodyHandlers.ofLines())
                    .thenAccept(response -> {
                        response.body().forEach(line -> {
                            if (line.startsWith("data: ")) {
                                String data = line.substring(6).trim();
                                if (data.equals("[DONE]")) {
                                    return;
                                }
                                try {
                                    com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(data);
                                    if (node.has("text")) {
                                        String content = node.get("text").asText();
                                        if (content != null && !content.isEmpty()) {
                                            onToken.accept(content);
                                        }
                                    } else if (node.has("error")) {
                                        onError.accept("Python Service Error: " + node.get("error").asText());
                                    }
                                } catch (Exception e) {
                                    // Ignore parse errors on partial streams
                                }
                            }
                        });
                        onComplete.run();
                    })
                    .exceptionally(e -> {
                        onError.accept("Stream failed: " + e.getMessage());
                        return null;
                    });
        } catch (Exception e) {
            onError.accept("Request failed: " + e.getMessage());
        }
    }
}
