package com.hackathon.travel.Travel.controller;

import com.hackathon.travel.Travel.models.ChatMessage;
import com.hackathon.travel.Travel.models.MessageRole;
import com.hackathon.travel.Travel.models.Idea;
import com.hackathon.travel.Travel.models.Trip;
import com.hackathon.travel.Travel.Repository.ChatMessageRepository;
import com.hackathon.travel.Travel.Repository.IdeaRepository;
import com.hackathon.travel.Travel.Repository.TripRepository;
import com.hackathon.travel.Travel.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final IdeaRepository ideaRepository;
    private final TripRepository tripRepository;
    private final GeminiService geminiService;

    public ChatController(ChatMessageRepository chatMessageRepository,
                          IdeaRepository ideaRepository,
                          TripRepository tripRepository,
                          GeminiService geminiService) {
        this.chatMessageRepository = chatMessageRepository;
        this.ideaRepository = ideaRepository;
        this.tripRepository = tripRepository;
        this.geminiService = geminiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<List<ChatMessage>> sendMessage(@PathVariable Long tripId,
                                                          @RequestBody Map<String, String> body) {
        String userText = body.get("message");
        String userName = body.getOrDefault("userName", "");
        Long userId = body.containsKey("userId") && body.get("userId") != null && !body.get("userId").isBlank()
                ? Long.parseLong(body.get("userId")) : null;

        ChatMessage userMsg = new ChatMessage(tripId, userId, MessageRole.USER, userText);
        userMsg.setUserName(userName);
        chatMessageRepository.save(userMsg);

        List<ChatMessage> result = new ArrayList<>();
        result.add(userMsg);

        boolean askAI = userText.toLowerCase().contains("@ai");
        if (askAI) {
            String cleanedMessage = userText.replaceAll("(?i)@ai\\s*", "").trim();
            if (cleanedMessage.isEmpty()) cleanedMessage = "Give me travel suggestions";

            Trip trip = tripRepository.findById(tripId).orElse(null);
            String tripContext = buildTripContext(trip, ideaRepository.findByTripId(tripId));

            List<ChatMessage> history = chatMessageRepository.findByTripIdOrderByTimestampAsc(tripId);
            String aiResponse = geminiService.chat(cleanedMessage, history, tripContext);

            ChatMessage aiMsg = new ChatMessage(tripId, null, MessageRole.AI, aiResponse);
            aiMsg.setUserName("WanderTribe AI");
            chatMessageRepository.save(aiMsg);
            result.add(aiMsg);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/ideas/{ideaId}/analyze")
    public ResponseEntity<Map<String, String>> analyzeIdea(@PathVariable Long tripId,
                                                            @PathVariable Long ideaId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();

        Idea targetIdea = ideaRepository.findById(ideaId).orElse(null);
        if (targetIdea == null) return ResponseEntity.notFound().build();

        List<Idea> allIdeas = ideaRepository.findByTripId(tripId);
        String tripContext = buildTripContext(trip, allIdeas);

        String prompt = "In exactly 1-2 sentences, analyze how adding this idea affects the trip itinerary:\n" +
                "Idea: [" + targetIdea.getCategory() + "] " + targetIdea.getTitle() +
                (targetIdea.getDescription() != null ? " - " + targetIdea.getDescription() : "") +
                "\n\nTrip context:\n" + tripContext +
                "\n\nBe specific about timing impact, cost impact, and what it adds to the experience. Keep it under 50 words.";

        String analysis = geminiService.chat(prompt, List.of(), tripContext);
        return ResponseEntity.ok(Map.of("analysis", analysis));
    }

    private String buildTripContext(Trip trip, List<Idea> ideas) {
        if (trip == null) return "";
        StringBuilder ctx = new StringBuilder("CURRENT TRIP DETAILS (already known, do NOT ask the user for these):\n");
        if (trip.getDestination() != null) ctx.append("- Destination: ").append(trip.getDestination()).append("\n");
        if (trip.getStartDate() != null) ctx.append("- Start Date: ").append(trip.getStartDate()).append("\n");
        if (trip.getEndDate() != null) ctx.append("- End Date: ").append(trip.getEndDate()).append("\n");
        if (trip.getBudget() != null) ctx.append("- Budget: ₹").append(trip.getBudget()).append("\n");
        if (trip.getTravelStyle() != null) ctx.append("- Travel Style: ").append(trip.getTravelStyle()).append("\n");
        if (trip.getDescription() != null) ctx.append("- Description: ").append(trip.getDescription()).append("\n");
        if (trip.getFood() != null) ctx.append("- Food Preferences: ").append(trip.getFood()).append("\n");
        if (trip.getTransportation() != null) ctx.append("- Transport Preference: ").append(trip.getTransportation()).append("\n");

        if (ideas != null && !ideas.isEmpty()) {
            ctx.append("\nGROUP IDEAS SUBMITTED SO FAR:\n");
            for (Idea idea : ideas) {
                ctx.append("- [").append(idea.getCategory()).append("] ")
                   .append(idea.getTitle());
                if (idea.getDescription() != null) ctx.append(": ").append(idea.getDescription());
                ctx.append(" (").append(idea.getVoteCount()).append(" votes)\n");
            }
        }

        ctx.append("\nUse this trip info to give specific, relevant suggestions. ");
        ctx.append("Do NOT ask the user to provide destination, dates, or budget — you already have them.");
        return ctx.toString();
    }

    @GetMapping("/chat")
    public List<ChatMessage> getChatHistory(@PathVariable Long tripId) {
        return chatMessageRepository.findByTripIdOrderByTimestampAsc(tripId);
    }

    @DeleteMapping("/chat")
    public ResponseEntity<Map<String, String>> clearChatHistory(@PathVariable Long tripId) {
        List<ChatMessage> messages = chatMessageRepository.findByTripIdOrderByTimestampAsc(tripId);
        chatMessageRepository.deleteAll(messages);
        return ResponseEntity.ok(Map.of("status", "cleared", "count", String.valueOf(messages.size())));
    }

    @PostMapping("/curate")
    public ResponseEntity<Map<String, String>> curateItinerary(@PathVariable Long tripId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();

        List<Idea> ideas = ideaRepository.findByTripId(tripId);
        String itinerary = geminiService.curateItinerary(
                trip.getDestination(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getBudget(),
                trip.getTravelStyle(),
                ideas
        );

        return ResponseEntity.ok(Map.of("itinerary", itinerary));
    }

    @GetMapping("/season")
    public ResponseEntity<Map<String, String>> getSeasonInfo(@PathVariable Long tripId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();

        String recommendation = geminiService.getSeasonRecommendation(trip.getDestination());
        return ResponseEntity.ok(Map.of("recommendation", recommendation));
    }
}
