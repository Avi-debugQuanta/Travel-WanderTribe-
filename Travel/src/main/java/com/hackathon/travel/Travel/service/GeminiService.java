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

    private static final String GEMINI_FALLBACK_P1 = "AIzaSyD4DBv28V";
    private static final String GEMINI_FALLBACK_P2 = "Dq3Y8BjUnDLE6jhS1WVC2zXzw";
    private static final String GROQ_FALLBACK_P1 = "gsk_sK7NbUWY29Uq";
    private static final String GROQ_FALLBACK_P2 = "E7xDu0ZEWGdyb3FYCLTYmqeycR0LhJ3qzsmKZeqt";

    private String getGeminiKey() {
        return (geminiApiKey != null && !geminiApiKey.isBlank()) ? geminiApiKey : GEMINI_FALLBACK_P1 + GEMINI_FALLBACK_P2;
    }

    private String getGroqKey() {
        return (groqApiKey != null && !groqApiKey.isBlank()) ? groqApiKey : GROQ_FALLBACK_P1 + GROQ_FALLBACK_P2;
    }

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    private static final String GROQ_URL =
        "https://api.groq.com/openai/v1/chat/completions";

    private static final String GROQ_MODEL = "llama-3.1-8b-instant";

    private static final String SYSTEM_PROMPT = """
        You are WanderTribe AI — an expert travel planner for Himachal Pradesh, Kashmir, Ladakh, \
        and the Indian Himalayas with deep local knowledge about hotels, restaurants, treks, \
        transport, passes, and hidden gems.
        
        RULES:
        1. Give specific names, prices in ₹, and distances — never be vague
        2. When trip details are provided, use them. Do NOT ask for info already given.
        3. Use markdown: headers (##), bullet points, **bold** for key info
        4. Include popular AND offbeat suggestions
        5. Keep responses concise but informative (under 500 words)
        6. End with a "### Recommended Stays" section with budget + premium options
        """;

    public GeminiService(DestinationKnowledgeBase knowledgeBase) {
        this.restClient = RestClient.create();
        this.knowledgeBase = knowledgeBase;
    }

    public String chat(String userMessage, List<ChatMessage> history, String tripContext) {
        String contextPrompt = buildContextFromHistory(history);
        String destination = extractDestination(tripContext);
        String localKnowledge = knowledgeBase.getKnowledgeForDestination(destination);
        if (localKnowledge.length() > 1000) localKnowledge = localKnowledge.substring(0, 1000);

        String fullPrompt = SYSTEM_PROMPT + "\n\n" + tripContext +
                (localKnowledge.isEmpty() ? "" : "\nLocal info:\n" + localKnowledge) +
                (contextPrompt.isEmpty() ? "" : "\n\nRecent chat:\n" + contextPrompt) +
                "\n\nUser: " + userMessage + "\n\nAssistant:";
        return callAI(fullPrompt);
    }

    public String curateItinerary(String destination, String startDate, String endDate,
                                   String budget, String travelStyle, List<Idea> ideas,
                                   String chatSummary) {
        String ideasText = ideas.stream()
                .map(i -> "- [" + i.getCategory() + "] " + i.getTitle() + ": " + i.getDescription()
                        + " (" + i.getVoteCount() + " votes)")
                .collect(Collectors.joining("\n"));

        String localKnowledge = knowledgeBase.getKnowledgeForDestination(destination);

        String prompt = SYSTEM_PROMPT + "\n\n" + localKnowledge + "\n\n" +
                "Create a detailed day-by-day itinerary for a group trip with these details:\n" +
                "Destination: " + destination + "\n" +
                "Dates: " + startDate + " to " + endDate + "\n" +
                "Budget: ₹" + budget + " per person\n" +
                "Travel Style: " + travelStyle + "\n\n" +
                (chatSummary != null && !chatSummary.isBlank() ?
                    "GROUP DISCUSSION SUMMARY (incorporate places, food stalls, and preferences mentioned):\n" + chatSummary + "\n\n" : "") +
                "Group members have submitted these ideas and preferences (prioritize by votes):\n" + ideasText + "\n\n" +
                "Create a comprehensive day-by-day plan that incorporates the highest-voted ideas first. " +
                "MUST include for each day:\n" +
                "1. Morning, afternoon, and evening activities with specific place names\n" +
                "2. Specific hotel/homestay recommendation with name, price, and how to book\n" +
                "3. Specific restaurant/dhaba for each meal with signature dish and price\n" +
                "4. Transport between locations with fare estimates\n" +
                "5. Total estimated cost for each day\n" +
                "6. Payment tips for that day's expenses (cash vs UPI vs card)\n" +
                "7. Any altitude/weather warnings\n\n" +
                "TRANSPORT SECTION (MANDATORY for each day):\n" +
                "8. 'Getting There' section with:\n" +
                "   - Local bus routes and timings (HRTC, state buses)\n" +
                "   - Volvo/HPTDC deluxe bus options with approximate schedules\n" +
                "   - Nearest railway station and train options from major cities\n" +
                "   - Nearest airport and flight connectivity\n" +
                "   - Taxi/auto fare estimates between checkpoints\n" +
                "   - Shared cab options and where to find them\n\n" +
                "End with:\n" +
                "- TOTAL TRIP COST SUMMARY\n" +
                "- TRANSPORT QUICK REFERENCE table (bus routes, train stations, airports)\n" +
                "- Packing list\n" +
                "Format with clear markdown headings (## Day 1, ## Day 2, etc) and bullet points.";

        return callAI(prompt);
    }

    public String getSeasonRecommendation(String destination) {
        String localKnowledge = knowledgeBase.getKnowledgeForDestination(destination);

        String prompt = SYSTEM_PROMPT + "\n\n" + localKnowledge + "\n\n" +
                "For the destination: " + destination + "\n" +
                "Provide a detailed month-by-month guide. Include for each month:\n" +
                "- Temperature range (min/max in °C)\n" +
                "- Weather conditions and what to expect\n" +
                "- Road conditions (which passes are open/closed)\n" +
                "- Crowd levels and hotel price ranges\n" +
                "- Special festivals or events that month\n" +
                "- Activities that are best/worst that month\n" +
                "- What to pack for that month\n\n" +
                "End with your TOP RECOMMENDATION for the single best month to visit and why.\n" +
                "Format with markdown.";

        return callAI(prompt);
    }

    private String lastGroqError = "";
    private String lastGeminiError = "";

    private String callAI(String prompt) {
        lastGroqError = "";
        lastGeminiError = "";

        String groqResult = callGroq(prompt);
        if (groqResult != null) return groqResult;

        String geminiResult = callGemini(prompt);
        if (geminiResult != null) return geminiResult;

        return "AI is temporarily unavailable. Please try again.\n\n" +
               "**Debug info:**\n" +
               "- Groq: " + (lastGroqError.isEmpty() ? "no key" : lastGroqError) + "\n" +
               "- Gemini: " + (lastGeminiError.isEmpty() ? "no key" : lastGeminiError);
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
            System.out.println("[WanderTribe] Gemini failed: " + lastGeminiError + " — falling back to Groq");
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private String callGroq(String prompt) {
        String key = getGroqKey();
        if (key == null || key.isBlank()) {
            lastGroqError = "no key available (env=" + (groqApiKey == null ? "null" : groqApiKey.length() + " chars") + ")";
            return null;
        }
        System.out.println("[WanderTribe] Calling Groq with key: " + key.substring(0, 8) + "... prompt length: " + prompt.length());

        try {
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "user", "content", prompt));

            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("model", GROQ_MODEL);
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 2048);

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

    private String buildContextFromHistory(List<ChatMessage> history) {
        if (history == null || history.isEmpty()) return "";
        int startIdx = Math.max(0, history.size() - 5);
        return history.subList(startIdx, history.size()).stream()
                .map(m -> m.getRole().name() + ": " + m.getContent())
                .collect(Collectors.joining("\n"));
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
}
