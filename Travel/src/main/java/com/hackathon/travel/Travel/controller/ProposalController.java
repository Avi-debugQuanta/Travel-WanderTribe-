package com.hackathon.travel.Travel.controller;

import com.hackathon.travel.Travel.models.*;
import com.hackathon.travel.Travel.Repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/trips/{tripId}/proposals")
@CrossOrigin(origins = "http://localhost:5173")
public class ProposalController {

    private final BookingProposalRepository proposalRepo;
    private final ProposalVoteRepository voteRepo;
    private final TripRepository tripRepo;
    private final CartItemRepository cartItemRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public ProposalController(BookingProposalRepository proposalRepo,
                              ProposalVoteRepository voteRepo,
                              TripRepository tripRepo,
                              CartItemRepository cartItemRepo,
                              SimpMessagingTemplate messagingTemplate) {
        this.proposalRepo = proposalRepo;
        this.voteRepo = voteRepo;
        this.tripRepo = tripRepo;
        this.cartItemRepo = cartItemRepo;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping
    public ResponseEntity<?> createProposal(@PathVariable Long tripId, @RequestBody Map<String, String> body) {
        try {
            BookingProposal p = new BookingProposal();
            p.setTripId(tripId);
            p.setProposedBy(Long.parseLong(body.getOrDefault("userId", "0")));
            p.setProposedByName(body.getOrDefault("userName", ""));
            p.setItemType(BookingType.valueOf(body.get("itemType")));
            p.setItemName(body.get("itemName"));
            p.setItemDetails(body.getOrDefault("itemDetails", ""));
            p.setPrice(Double.parseDouble(body.getOrDefault("price", "0")));
            p.setProposedDate(body.getOrDefault("proposedDate", ""));
            p.setStatus(ProposalStatus.PENDING);
            p.setCreatedAt(LocalDateTime.now());
            proposalRepo.save(p);

            messagingTemplate.convertAndSend("/topic/trip/" + tripId + "/notifications",
                (Object) Map.of("type", "NEW_PROPOSAL", "message", p.getProposedByName() + " proposed " + p.getItemName(),
                        "proposalId", p.getId()));

            return ResponseEntity.ok(p);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public List<Map<String, Object>> getProposals(@PathVariable Long tripId) {
        List<BookingProposal> proposals = proposalRepo.findByTripIdOrderByCreatedAtDesc(tripId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (BookingProposal p : proposals) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("tripId", p.getTripId());
            m.put("proposedBy", p.getProposedBy());
            m.put("proposedByName", p.getProposedByName());
            m.put("itemType", p.getItemType());
            m.put("itemName", p.getItemName());
            m.put("itemDetails", p.getItemDetails());
            m.put("price", p.getPrice());
            m.put("proposedDate", p.getProposedDate());
            m.put("status", p.getStatus());
            m.put("createdAt", p.getCreatedAt());
            m.put("votes", voteRepo.findByProposalId(p.getId()));
            result.add(m);
        }
        return result;
    }

    @PostMapping("/{proposalId}/vote")
    public ResponseEntity<?> vote(@PathVariable Long tripId,
                                   @PathVariable Long proposalId,
                                   @RequestBody Map<String, String> body) {
        try {
            BookingProposal p = proposalRepo.findById(proposalId).orElse(null);
            if (p == null) return ResponseEntity.notFound().build();
            if (p.getStatus() != ProposalStatus.PENDING)
                return ResponseEntity.badRequest().body(Map.of("error", "Proposal already " + p.getStatus()));

            Long userId = Long.parseLong(body.get("userId"));
            String userName = body.getOrDefault("userName", "");
            VoteType voteType = VoteType.valueOf(body.get("vote"));

            Optional<ProposalVote> existing = voteRepo.findByProposalIdAndUserId(proposalId, userId);
            if (existing.isPresent()) {
                existing.get().setVote(voteType);
                existing.get().setVotedAt(LocalDateTime.now());
                voteRepo.save(existing.get());
            } else {
                ProposalVote v = new ProposalVote();
                v.setProposalId(proposalId);
                v.setUserId(userId);
                v.setUserName(userName);
                v.setVote(voteType);
                v.setVotedAt(LocalDateTime.now());
                voteRepo.save(v);
            }

            List<ProposalVote> allVotes = voteRepo.findByProposalId(proposalId);
            Trip trip = tripRepo.findById(tripId).orElse(null);
            int memberCount = trip != null ? Math.max(trip.getMembers().size(), 1) : 1;

            long approveCount = allVotes.stream().filter(v -> v.getVote() == VoteType.APPROVE).count();
            long rejectCount = allVotes.stream().filter(v -> v.getVote() == VoteType.REJECT).count();

            messagingTemplate.convertAndSend("/topic/trip/" + tripId + "/notifications",
                (Object) Map.of("type", "VOTE_CAST", "message", userName + " voted " + voteType + " on " + p.getItemName(),
                        "proposalId", proposalId, "approveCount", approveCount, "rejectCount", rejectCount));

            if (approveCount >= memberCount) {
                p.setStatus(ProposalStatus.APPROVED);
                proposalRepo.save(p);

                CartItem ci = new CartItem(tripId, p.getProposedBy(), p.getItemType(), p.getItemName(), p.getPrice());
                ci.setItemDetails(p.getItemDetails());
                ci.setProposedDate(p.getProposedDate());
                cartItemRepo.save(ci);

                messagingTemplate.convertAndSend("/topic/trip/" + tripId + "/notifications",
                    (Object) Map.of("type", "PROPOSAL_APPROVED", "message", p.getItemName() + " approved by all and added to cart!",
                            "proposalId", proposalId));
            } else if (rejectCount > memberCount / 2) {
                p.setStatus(ProposalStatus.REJECTED);
                proposalRepo.save(p);

                messagingTemplate.convertAndSend("/topic/trip/" + tripId + "/notifications",
                    (Object) Map.of("type", "PROPOSAL_REJECTED", "message", p.getItemName() + " was rejected by the group",
                            "proposalId", proposalId));
            }

            return ResponseEntity.ok(Map.of("votes", allVotes, "status", p.getStatus()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
