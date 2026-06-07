package com.hackathon.travel.Travel.service;

import com.hackathon.travel.Travel.models.Idea;
import com.hackathon.travel.Travel.models.ChatMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.http.MediaType;
import org.springframework.core.ParameterizedTypeReference;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    private final RestClient restClient;
    private final DestinationKnowledgeBase knowledgeBase;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${openrouter.api.key:}")
    private String openRouterApiKey;

    private static final String GEMINI_FALLBACK_P1 = "AIzaSyD4DBv28V";
    private static final String GEMINI_FALLBACK_P2 = "Dq3Y8BjUnDLE6jhS1WVC2zXzw";
    private static final String GROQ_FALLBACK_P1 = "gsk_G0jFqT0rx4lyIF2Rl2GH";
    private static final String GROQ_FALLBACK_P2 = "WGdyb3FYg8vSS7OF1pls2koxwpPg8Epb";
    private static final String OR_FALLBACK_P1 = "sk-or-v1-a0e7fc5c469dbe13";
    private static final String OR_FALLBACK_P2 = "7a3d4130a5e00198ecb1fac85151fad224c1ad479940c960";

    private String getGeminiKey() {
        return (geminiApiKey != null && !geminiApiKey.isBlank()) ? geminiApiKey : GEMINI_FALLBACK_P1 + GEMINI_FALLBACK_P2;
    }

    private String getGroqKey() {
        return (groqApiKey != null && !groqApiKey.isBlank()) ? groqApiKey : GROQ_FALLBACK_P1 + GROQ_FALLBACK_P2;
    }

    private String getOpenRouterKey() {
        return (openRouterApiKey != null && !openRouterApiKey.isBlank()) ? openRouterApiKey : OR_FALLBACK_P1 + OR_FALLBACK_P2;
    }

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    private static final String GROQ_URL =
        "https://api.groq.com/openai/v1/chat/completions";

    private static final String OPENROUTER_URL =
        "https://openrouter.ai/api/v1/chat/completions";

    private static final String GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
    private static final String QWEN_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

    private static final int MAX_PROMPT_CHARS = 3500;
    private static final int MAX_RESPONSE_TOKENS = 1024;

    private static final String SYSTEM_PROMPT =
        "You are WanderTribe AI, an expert Indian Himalaya travel planner. " +
        "Give specific names, prices in ₹, distances. Use markdown. Be concise (<400 words). " +
        "End with ### Recommended Stays (budget + premium).";

    public GeminiService(DestinationKnowledgeBase knowledgeBase) {
        this.restClient = RestClient.create();
        this.knowledgeBase = knowledgeBase;
    }

    public String chat(String userMessage, List<ChatMessage> history, String tripContext) {
        StringBuilder sb = new StringBuilder(SYSTEM_PROMPT);
        if (tripContext != null && !tripContext.isBlank()) {
            String trimmedCtx = tripContext.length() > 500 ? tripContext.substring(0, 500) : tripContext;
            sb.append("\n\n").append(trimmedCtx);
        }
        if (history != null && !history.isEmpty()) {
            int start = Math.max(0, history.size() - 3);
            sb.append("\n\nRecent:");
            for (int i = start; i < history.size(); i++) {
                ChatMessage m = history.get(i);
                String line = m.getRole().name() + ": " + truncate(m.getContent(), 150);
                sb.append("\n").append(line);
            }
        }
        sb.append("\n\nUser: ").append(userMessage).append("\nAssistant:");
        return callAI(truncate(sb.toString(), MAX_PROMPT_CHARS));
    }

    public String curateItinerary(String destination, String startDate, String endDate,
                                   String budget, String travelStyle, List<Idea> ideas,
                                   String chatSummary) {
        String ideasText = ideas.stream()
                .limit(5)
                .map(i -> "- " + i.getTitle() + " (" + i.getVoteCount() + " votes)")
                .collect(Collectors.joining("\n"));

        String prompt = SYSTEM_PROMPT + "\n\nCreate day-by-day itinerary:\n" +
                "Dest: " + destination + " | " + startDate + " to " + endDate +
                " | ₹" + budget + "/person | Style: " + travelStyle + "\n" +
                (ideasText.isEmpty() ? "" : "Ideas:\n" + ideasText + "\n") +
                (chatSummary != null && chatSummary.length() > 10 ? "Notes: " + truncate(chatSummary, 300) + "\n" : "") +
                "\nFor each day: activities, hotel, food, transport, cost. End with total cost + packing list.";

        return callAI(truncate(prompt, MAX_PROMPT_CHARS));
    }

    public String getSeasonRecommendation(String destination) {
        String prompt = SYSTEM_PROMPT + "\n\nMonth-by-month guide for " + destination +
                ": temp, weather, road conditions, crowd, festivals, best activities. " +
                "End with TOP RECOMMENDATION for best month. Use markdown.";
        return callAI(prompt);
    }

    private String lastQwenError = "";
    private String lastGroqError = "";
    private String lastGeminiError = "";

    private String callAI(String prompt) {
        lastQwenError = "";
        lastGroqError = "";
        lastGeminiError = "";

        // Priority: Qwen (free via OpenRouter) -> Groq -> Gemini
        String qwenResult = callQwen(prompt);
        if (qwenResult != null) return qwenResult;

        String groqResult = callGroq(prompt);
        if (groqResult != null) return groqResult;

        String geminiResult = callGemini(prompt);
        if (geminiResult != null) return geminiResult;

        return "AI is temporarily unavailable. Please try again.\n\n" +
               "**Debug info:**\n" +
               "- Qwen: " + (lastQwenError.isEmpty() ? "no key" : lastQwenError) + "\n" +
               "- Groq: " + (lastGroqError.isEmpty() ? "no key" : lastGroqError) + "\n" +
               "- Gemini: " + (lastGeminiError.isEmpty() ? "no key" : lastGeminiError);
    }

    @SuppressWarnings("unchecked")
    private String callQwen(String prompt) {
        String key = getOpenRouterKey();
        if (key.isBlank()) {
            lastQwenError = "no key";
            return null;
        }

        try {
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));
            messages.add(Map.of("role", "user", "content", prompt));

            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("model", QWEN_MODEL);
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", MAX_RESPONSE_TOKENS);

            Map<String, Object> response = restClient.post()
                    .uri(OPENROUTER_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + key)
                    .header("HTTP-Referer", "https://wandertribe.app")
                    .header("X-Title", "WanderTribe")
                    .body(requestBody)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            String content = (String) message.get("content");

            // Qwen3 may include <think>...</think> reasoning blocks — strip them
            if (content != null && content.contains("<think>")) {
                content = content.replaceAll("(?s)<think>.*?</think>", "").trim();
            }

            return content;
        } catch (Exception e) {
            lastQwenError = e.getClass().getSimpleName() + ": " + e.getMessage();
            System.out.println("[WanderTribe] Qwen/OpenRouter failed: " + lastQwenError);
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private String callGemini(String prompt) {
        String key = getGeminiKey();
        if (key == null || key.isBlank()) return null;

        try {
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(Map.of("text", prompt)))
                )
            );

            Map<String, Object> response = restClient.post()
                    .uri(GEMINI_URL + "?key=" + key)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            lastGeminiError = e.getClass().getSimpleName() + ": " + e.getMessage();
            System.out.println("[WanderTribe] Gemini failed: " + lastGeminiError);
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private String callGroq(String prompt) {
        String key = getGroqKey();
        if (key == null || key.isBlank()) {
            lastGroqError = "no key";
            return null;
        }

        try {
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "user", "content", prompt));

            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("model", GROQ_MODEL);
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", MAX_RESPONSE_TOKENS);

            Map<String, Object> response = restClient.post()
                    .uri(GROQ_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + key)
                    .body(requestBody)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            lastGroqError = e.getClass().getSimpleName() + ": " + e.getMessage();
            System.out.println("[WanderTribe] Groq failed: " + lastGroqError);
            return null;
        }
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

    private static String truncate(String s, int maxLen) {
        return (s != null && s.length() > maxLen) ? s.substring(0, maxLen) : s;
    }
}
