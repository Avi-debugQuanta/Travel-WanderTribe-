package com.hackathon.travel.Travel.Repository;

import com.hackathon.travel.Travel.models.ProposalVote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProposalVoteRepository extends JpaRepository<ProposalVote, Long> {
    List<ProposalVote> findByProposalId(Long proposalId);
    Optional<ProposalVote> findByProposalIdAndUserId(Long proposalId, Long userId);
}
