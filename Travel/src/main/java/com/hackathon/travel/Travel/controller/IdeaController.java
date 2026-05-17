package com.hackathon.travel.Travel.controller;

import com.hackathon.travel.Travel.models.Idea;
import com.hackathon.travel.Travel.models.Category;
import com.hackathon.travel.Travel.Repository.IdeaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}/ideas")
@CrossOrigin(originPatterns = "*")
public class IdeaController {

    private final IdeaRepository ideaRepository;

    public IdeaController(IdeaRepository ideaRepository) {
        this.ideaRepository = ideaRepository;
    }

    @PostMapping
    public Idea submitIdea(@PathVariable Long tripId, @RequestBody Idea idea) {
        idea.setTripId(tripId);
        idea.setVoteCount(0);
        return ideaRepository.save(idea);
    }

    @GetMapping
    public List<Idea> getIdeas(@PathVariable Long tripId,
                               @RequestParam(required = false) Category category) {
        if (category != null) {
            return ideaRepository.findByTripIdAndCategory(tripId, category);
        }
        return ideaRepository.findByTripId(tripId);
    }

    @PostMapping("/{ideaId}/vote")
    public ResponseEntity<Idea> voteIdea(@PathVariable Long tripId, @PathVariable Long ideaId) {
        return ideaRepository.findById(ideaId).map(idea -> {
            idea.setVoteCount(idea.getVoteCount() + 1);
            return ResponseEntity.ok(ideaRepository.save(idea));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{ideaId}/comment")
    public ResponseEntity<Idea> addComment(@PathVariable Long tripId, @PathVariable Long ideaId,
                                            @RequestBody Map<String, String> body) {
        return ideaRepository.findById(ideaId).map(idea -> {
            String userName = body.getOrDefault("userName", "Anonymous");
            String text = body.getOrDefault("text", "");
            String existing = idea.getComments() != null ? idea.getComments() : "[]";
            String newComment = "{\"user\":\"" + userName.replace("\"", "'") +
                    "\",\"text\":\"" + text.replace("\"", "'") +
                    "\",\"time\":" + System.currentTimeMillis() + "}";
            if (existing.equals("[]")) {
                idea.setComments("[" + newComment + "]");
            } else {
                idea.setComments(existing.substring(0, existing.length() - 1) + "," + newComment + "]");
            }
            return ResponseEntity.ok(ideaRepository.save(idea));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{ideaId}")
    public ResponseEntity<Void> deleteIdea(@PathVariable Long tripId, @PathVariable Long ideaId) {
        if (ideaRepository.existsById(ideaId)) {
            ideaRepository.deleteById(ideaId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
