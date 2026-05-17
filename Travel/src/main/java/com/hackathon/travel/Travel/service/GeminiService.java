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

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    private static final String GROQ_URL =
        "https://api.groq.com/openai/v1/chat/completions";

    private static final String GROQ_MODEL = "llama-3.3-70b-versatile";

    private static final String SYSTEM_PROMPT = """
        You are WanderTribe AI — an expert travel planner who has personally explored every corner of \
        Himachal Pradesh, Kashmir, Ladakh, and the Indian Himalayas. You have deep local knowledge about:
        
        - Specific hotels, their actual prices, and honest reviews
        - Named restaurants and dhabas with signature dishes and costs in INR
        - Exact trek routes with distances, difficulty, and gear needed
        - Real transport options with current fare ranges
        - Which passes are open in which months
        - Altitude sickness risks and precautions
        - Payment methods that work (cash vs UPI vs card) at each location
        - Offbeat hidden gems that only locals know
        - Festival dates and cultural events
        - Safety information and emergency contacts
        
        PERSONALIZATION:
        - In your FIRST response, briefly ask about the group: ages, fitness level, interests \
          (adventure/chill/spiritual/photography), dietary preferences, and any mobility concerns.
        - Use these preferences in ALL future suggestions to give a truly customized experience.
        - Remember what the user tells you and reference it later.
        
        RESPONSE FORMAT RULES:
        1. ALWAYS give specific names, prices in ₹, and distances — never be vague
        2. When trip details are already provided, use them directly. Do NOT ask for info already given.
        3. Format with clear markdown: headers (##), bullet points, **bold** for key info
        4. Include a mix of popular AND offbeat suggestions
        5. Mention best time of day to visit each place
        6. Warn about altitude sickness if destination is above 8,000 ft
        7. Suggest cheaper alternatives alongside premium options
        8. Keep responses conversational and enthusiastic but informative
        9. When creating itineraries, include realistic travel times between locations
        
        HOTEL RECOMMENDATIONS (ALWAYS put these at the END of your response):
        10. ALWAYS end your response with a "### Recommended Stays" section
        11. For each hotel include: name, price/night, distance from main attraction, \
            view description (mountain view, valley view, riverside, etc.), vibe (cozy/luxury/rustic/backpacker), \
            amenities, and payment method (cash/card/UPI)
        12. Include both budget and premium options
        13. Describe what the guest will SEE and FEEL — "wake up to snow-capped Dhauladhar peaks", \
            "fall asleep to the sound of river Beas", "sit by the bonfire under a billion stars"
        """;

    public GeminiService(DestinationKnowledgeBase knowledgeBase) {
        this.restClient = RestClient.create();
        this.knowledgeBase = knowledgeBase;
    }

    public String chat(String userMessage, List<ChatMessage> history, String tripContext) {
        String contextPrompt = buildContextFromHistory(history);
        String destination = extractDestination(tripContext);
        String localKnowledge = knowledgeBase.getKnowledgeForDestination(destination);

        String fullPrompt = SYSTEM_PROMPT + "\n\n" + tripContext +
                localKnowledge +
                "\n\nConversation so far:\n" + contextPrompt
                + "\n\nUser: " + userMessage + "\n\nAssistant:";
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

    /**
     * Tries Gemini first. If Gemini fails (quota, error, no key), falls back to Groq.
     * If both fail, returns an error message.
     */
    private String callAI(String prompt) {
        String geminiResult = callGemini(prompt);
        if (geminiResult != null) return geminiResult;

        String groqResult = callGroq(prompt);
        if (groqResult != null) return groqResult;

        return "Both AI providers are currently unavailable. Please try again in a minute.\n\n" +
               "**Setup tips:**\n" +
               "- Gemini: Set `gemini.api.key` in application.properties (free at https://aistudio.google.com/app/apikey)\n" +
               "- Groq: Set `groq.api.key` in application.properties (free at https://console.groq.com/keys)";
    }

    @SuppressWarnings("unchecked")
    private String callGemini(String prompt) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) return null;

        try {
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(Map.of("text", prompt)))
                )
            );

            Map<String, Object> response = restClient.post()
                    .uri(GEMINI_URL + "?key=" + geminiApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            System.out.println("[WanderTribe] Gemini failed: " + e.getMessage() + " — falling back to Groq");
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private String callGroq(String prompt) {
        if (groqApiKey == null || groqApiKey.isBlank()) return null;

        try {
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));
            messages.add(Map.of("role", "user", "content", prompt));

            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("model", GROQ_MODEL);
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 4096);

            Map<String, Object> response = restClient.post()
                    .uri(GROQ_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + groqApiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            System.out.println("[WanderTribe] Groq failed: " + e.getMessage());
            return null;
        }
    }

    private String buildContextFromHistory(List<ChatMessage> history) {
        if (history == null || history.isEmpty()) return "No previous conversation.";
        int startIdx = Math.max(0, history.size() - 10);
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
