package com.hackathon.travel.Travel.controller;

import com.hackathon.travel.Travel.models.Trip;
import com.hackathon.travel.Travel.models.User;
import com.hackathon.travel.Travel.Repository.TripRepository;
import com.hackathon.travel.Travel.Repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "http://localhost:5173")
public class TripController {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public TripController(TripRepository tripRepository, UserRepository userRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping
    public Trip createTrip(@RequestBody Trip trip) {
        return tripRepository.save(trip);
    }

    @GetMapping
    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable Long id) {
        return tripRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trip> updateTrip(@PathVariable Long id, @RequestBody Trip updated) {
        return tripRepository.findById(id).map(trip -> {
            trip.setDestination(updated.getDestination());
            trip.setStartDate(updated.getStartDate());
            trip.setEndDate(updated.getEndDate());
            trip.setBudget(updated.getBudget());
            trip.setDescription(updated.getDescription());
            trip.setTravelStyle(updated.getTravelStyle());
            trip.setVibePreference(updated.getVibePreference());
            trip.setActivities(updated.getActivities());
            trip.setFood(updated.getFood());
            trip.setTransportation(updated.getTransportation());
            trip.setAccommodations(updated.getAccommodations());
            return ResponseEntity.ok(tripRepository.save(trip));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{tripId}/join")
    public ResponseEntity<?> joinTrip(@PathVariable Long tripId, @RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String password = body.get("password");
            Trip trip = tripRepository.findById(tripId).orElse(null);
            if (trip == null) return ResponseEntity.notFound().build();

            if (trip.getTripPassword() != null && !trip.getTripPassword().isBlank()) {
                if (password == null || !password.equals(trip.getTripPassword())) {
                    return ResponseEntity.status(403).body(Map.of("error", "Wrong trip password"));
                }
            }

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setName(body.getOrDefault("name", email.split("@")[0]));
                user = userRepository.save(user);
            }

            trip.getMembers().add(user);
            tripRepository.save(trip);

            messagingTemplate.convertAndSend("/topic/trip/" + tripId + "/notifications",
                (Object) Map.of("type", "MEMBER_JOINED", "message", user.getName() + " joined the trip!"));

            return ResponseEntity.ok(Map.of("message", user.getName() + " joined the trip!", "tripId", tripId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to join trip: " + e.getMessage()));
        }
    }

    @PutMapping("/{tripId}/password")
    public ResponseEntity<?> setTripPassword(@PathVariable Long tripId, @RequestBody Map<String, String> body) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();
        trip.setTripPassword(body.get("password"));
        tripRepository.save(trip);
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrip(@PathVariable Long id, @RequestParam(required = false) String email) {
        Trip trip = tripRepository.findById(id).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();

        if (email != null && !isLeader(trip, email)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the trip leader can delete this trip"));
        }

        tripRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{tripId}/members/{userId}")
    public ResponseEntity<Trip> addMember(@PathVariable Long tripId, @PathVariable Long userId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        if (trip == null || user == null) return ResponseEntity.notFound().build();
        trip.getMembers().add(user);

        messagingTemplate.convertAndSend("/topic/trip/" + tripId + "/notifications",
            (Object) Map.of("type", "MEMBER_JOINED", "message", user.getName() + " joined the trip!"));

        return ResponseEntity.ok(tripRepository.save(trip));
    }

    @PostMapping("/{tripId}/invite")
    public ResponseEntity<?> inviteMember(@PathVariable Long tripId, @RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            Trip trip = tripRepository.findById(tripId).orElse(null);
            if (trip == null) return ResponseEntity.notFound().build();

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setName(email.split("@")[0]);
                user = userRepository.save(user);
            }

            trip.getMembers().add(user);
            tripRepository.save(trip);

            messagingTemplate.convertAndSend("/topic/trip/" + tripId + "/notifications",
                (Object) Map.of("type", "MEMBER_JOINED", "message", user.getName() + " was invited to the trip!"));

            return ResponseEntity.ok(Map.of("message", user.getName() + " added to trip", "members", trip.getMembers()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to invite: " + e.getMessage()));
        }
    }

    @GetMapping("/{tripId}/members")
    public ResponseEntity<Set<User>> getMembers(@PathVariable Long tripId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(trip.getMembers());
    }

    @DeleteMapping("/{tripId}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable Long tripId, @PathVariable Long userId,
                                           @RequestParam(required = false) String email) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();

        if (email != null && !isLeader(trip, email)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the trip leader can remove members"));
        }

        trip.getMembers().removeIf(u -> u.getId().equals(userId));
        tripRepository.save(trip);
        return ResponseEntity.ok(Map.of("message", "Member removed", "members", trip.getMembers()));
    }

    private boolean isLeader(Trip trip, String email) {
        if (trip.getCreatedBy() == null) return false;
        return trip.getCreatedBy().equalsIgnoreCase(email) ||
               trip.getCreatedBy().equalsIgnoreCase(email.split("@")[0]);
    }
}
