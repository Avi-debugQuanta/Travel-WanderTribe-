package com.hackathon.travel.Travel.controller;

import com.hackathon.travel.Travel.models.*;
import com.hackathon.travel.Travel.models.ai.ItineraryResponse;
import com.hackathon.travel.Travel.Repository.*;
import com.hackathon.travel.Travel.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trips/{tripId}")
@CrossOrigin(originPatterns = "*")
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final IdeaRepository ideaRepository;
    private final TripRepository tripRepository;
    private final BookingRepository bookingRepository;
    private final BookingProposalRepository proposalRepository;
    private final GeminiService geminiService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatMessageRepository chatMessageRepository,
                          IdeaRepository ideaRepository,
                          TripRepository tripRepository,
                          BookingRepository bookingRepository,
                          BookingProposalRepository proposalRepository,
                          GeminiService geminiService,
                          SimpMessagingTemplate messagingTemplate) {
        this.chatMessageRepository = chatMessageRepository;
        this.ideaRepository = ideaRepository;
        this.tripRepository = tripRepository;
        this.bookingRepository = bookingRepository;
        this.proposalRepository = proposalRepository;
        this.geminiService = geminiService;
        this.messagingTemplate = messagingTemplate;
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

        messagingTemplate.convertAndSend("/topic/trip/" + tripId + "/chat", (Object) userMsg);

        boolean askAI = userText.toLowerCase().contains("@ai");
        if (askAI) {
            String cleanedMessage = userText.replaceAll("(?i)@ai\\s*", "").trim();
            if (cleanedMessage.isEmpty()) cleanedMessage = "Give me travel suggestions";
            final String finalMessage = cleanedMessage;

            Trip trip = tripRepository.findById(tripId).orElse(null);
            String tripContext = buildTripContext(trip, ideaRepository.findByTripId(tripId));

            List<ChatMessage> history = chatMessageRepository.findByTripIdOrderByTimestampAsc(tripId);
            
            ChatMessage aiMsg = new ChatMessage(tripId, null, MessageRole.AI, "");
            aiMsg.setUserName("WanderTribe AI");
            chatMessageRepository.save(aiMsg); // Get DB ID so frontend can merge chunks
            result.add(aiMsg);

            new Thread(() -> {
                StringBuilder fullResponse = new StringBuilder();
                geminiService.streamChat(finalMessage, history, tripContext,
                    (token) -> {
                        fullResponse.append(token);
                        aiMsg.setContent(fullResponse.toString());
                        messagingTemplate.convertAndSend("/topic/trip/" + tripId + "/chat", (Object) aiMsg);
                    },
                    () -> {
                        aiMsg.setContent(fullResponse.toString());
                        chatMessageRepository.save(aiMsg);
                        messagingTemplate.convertAndSend("/topic/trip/" + tripId + "/chat", (Object) aiMsg);
                    },
                    (error) -> {
                        fullResponse.append("\n\n[Error: ").append(error).append("]");
                        aiMsg.setContent(fullResponse.toString());
                        chatMessageRepository.save(aiMsg);
                        messagingTemplate.convertAndSend("/topic/trip/" + tripId + "/chat", (Object) aiMsg);
                    }
                );
            }).start();
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

        ctx.append("\nUse this info to give specific, relevant suggestions. ");
        ctx.append("Do NOT ask the user to provide destination, dates, or budget — you already have them.");
        return ctx.toString();
    }

    @GetMapping("/chat")
    public List<ChatMessage> getChatHistory(@PathVariable Long tripId) {
        return chatMessageRepository.findByTripIdOrderByTimestampAsc(tripId);
    }

    @DeleteMapping("/chat")
    public ResponseEntity<?> clearChatHistory(@PathVariable Long tripId,
                                               @RequestParam(required = false) String email) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip != null && email != null) {
            String leader = trip.getCreatedBy();
            if (leader != null && !leader.equalsIgnoreCase(email) && !leader.equalsIgnoreCase(email.split("@")[0])) {
                return ResponseEntity.status(403).body(Map.of("error", "Only the trip leader can clear chat"));
            }
        }

        List<ChatMessage> messages = chatMessageRepository.findByTripIdOrderByTimestampAsc(tripId);
        chatMessageRepository.deleteAll(messages);
        return ResponseEntity.ok(Map.of("status", "cleared", "count", String.valueOf(messages.size())));
    }

    @PostMapping("/curate")
    public ResponseEntity<Map<String, Object>> curateItinerary(@PathVariable Long tripId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();

        List<Idea> ideas = ideaRepository.findByTripId(tripId);
        List<ChatMessage> recentChat = chatMessageRepository.findByTripIdOrderByTimestampAsc(tripId);
        String chatSummary = buildChatSummary(recentChat);

        List<BookingProposal> approvedProposals = proposalRepository.findByTripIdAndStatus(tripId, ProposalStatus.APPROVED);
        List<Booking> confirmedBookings = bookingRepository.findByTripId(tripId).stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.PENDING)
                .collect(Collectors.toList());

        String bookingsContext = buildBookingsContext(approvedProposals, confirmedBookings);

        ItineraryResponse itinerary = geminiService.curateItinerary(
                trip.getDestination(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getBudget(),
                trip.getTravelStyle(),
                ideas,
                chatSummary + "\n\n" + bookingsContext
        );

        return ResponseEntity.ok(Map.of("itinerary", itinerary));
    }

    private String buildBookingsContext(List<BookingProposal> proposals, List<Booking> bookings) {
        StringBuilder sb = new StringBuilder();
        if (!proposals.isEmpty() || !bookings.isEmpty()) {
            sb.append("CONFIRMED/APPROVED BOOKINGS (MUST include these in the itinerary on their specific dates):\n");
            for (BookingProposal p : proposals) {
                sb.append("- [").append(p.getItemType()).append("] ").append(p.getItemName())
                  .append(" on ").append(p.getProposedDate()).append(" - ₹").append(p.getPrice()).append("\n");
            }
            for (Booking b : bookings) {
                sb.append("- [").append(b.getType()).append("] ").append(b.getProviderName())
                  .append(" - ₹").append(b.getPrice()).append("\n");
            }
        }
        return sb.toString();
    }

    @GetMapping("/ai-summary")
    public ResponseEntity<Map<String, String>> getAISummary(@PathVariable Long tripId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();

        List<Booking> bookings = bookingRepository.findByTripId(tripId);
        List<ChatMessage> recentChat = chatMessageRepository.findByTripIdOrderByTimestampAsc(tripId);
        List<BookingProposal> proposals = proposalRepository.findByTripIdAndStatus(tripId, ProposalStatus.APPROVED);

        double totalSpent = bookings.stream().mapToDouble(Booking::getPrice).sum();

        String prompt = "You are WanderTribe AI. Generate a brief, insightful TRIP SUMMARY ANALYSIS for this trip:\n\n" +
            "Destination: " + trip.getDestination() + "\n" +
            "Dates: " + trip.getStartDate() + " to " + trip.getEndDate() + "\n" +
            "Budget: ₹" + trip.getBudget() + " per person\n" +
            "Travel Style: " + trip.getTravelStyle() + "\n" +
            "Total bookings: " + bookings.size() + "\n" +
            "Total spent so far: ₹" + totalSpent + "\n" +
            "Approved proposals: " + proposals.size() + "\n\n" +
            (recentChat.size() > 0 ? "Recent chat topics:\n" + buildChatSummary(recentChat.subList(Math.max(0, recentChat.size()-10), recentChat.size())) + "\n\n" : "") +
            "Write a brief analysis (3-5 bullet points) covering:\n" +
            "1. Budget health (are they on track?)\n" +
            "2. Trip readiness score (1-10)\n" +
            "3. Key recommendation or missing element\n" +
            "4. Vibe check based on group chat\n" +
            "5. One pro tip for the destination\n" +
            "Keep it concise and fun. Use markdown formatting.";

        String summary = geminiService.chat(prompt, List.of(), "");
        return ResponseEntity.ok(Map.of("summary", summary));
    }

    private String buildChatSummary(List<ChatMessage> messages) {
        if (messages == null || messages.isEmpty()) return "";
        int start = Math.max(0, messages.size() - 30);
        StringBuilder sb = new StringBuilder();
        for (int i = start; i < messages.size(); i++) {
            ChatMessage m = messages.get(i);
            String sender = m.getUserName() != null ? m.getUserName() : m.getRole().name();
            sb.append(sender).append(": ").append(m.getContent()).append("\n");
        }
        return sb.toString();
    }

    @GetMapping("/season")
    public ResponseEntity<Map<String, String>> getSeasonInfo(@PathVariable Long tripId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();

        String recommendation = geminiService.getSeasonRecommendation(trip.getDestination());
        return ResponseEntity.ok(Map.of("recommendation", recommendation));
    }
}
