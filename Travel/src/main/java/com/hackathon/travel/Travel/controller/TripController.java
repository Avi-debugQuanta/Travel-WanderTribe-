package com.hackathon.travel.Travel.controller;

import com.hackathon.travel.Travel.models.Trip;
import com.hackathon.travel.Travel.models.User;
import com.hackathon.travel.Travel.Repository.TripRepository;
import com.hackathon.travel.Travel.Repository.UserRepository;
import org.springframework.http.ResponseEntity;
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

    public TripController(TripRepository tripRepository, UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id) {
        if (tripRepository.existsById(id)) {
            tripRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{tripId}/members/{userId}")
    public ResponseEntity<Trip> addMember(@PathVariable Long tripId, @PathVariable Long userId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        if (trip == null || user == null) return ResponseEntity.notFound().build();
        trip.getMembers().add(user);
        return ResponseEntity.ok(tripRepository.save(trip));
    }

    @PostMapping("/{tripId}/invite")
    public ResponseEntity<?> inviteMember(@PathVariable Long tripId, @RequestBody Map<String, String> body) {
        String email = body.get("email");
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No user found with email: " + email));
        }

        trip.getMembers().add(user);
        tripRepository.save(trip);
        return ResponseEntity.ok(Map.of("message", user.getName() + " added to trip", "members", trip.getMembers()));
    }

    @GetMapping("/{tripId}/members")
    public ResponseEntity<Set<User>> getMembers(@PathVariable Long tripId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(trip.getMembers());
    }

    @DeleteMapping("/{tripId}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable Long tripId, @PathVariable Long userId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();
        trip.getMembers().removeIf(u -> u.getId().equals(userId));
        tripRepository.save(trip);
        return ResponseEntity.ok(Map.of("message", "Member removed", "members", trip.getMembers()));
    }
}
