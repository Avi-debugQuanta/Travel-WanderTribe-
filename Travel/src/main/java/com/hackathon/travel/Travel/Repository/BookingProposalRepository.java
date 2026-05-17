package com.hackathon.travel.Travel.Repository;

import com.hackathon.travel.Travel.models.BookingProposal;
import com.hackathon.travel.Travel.models.ProposalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingProposalRepository extends JpaRepository<BookingProposal, Long> {
    List<BookingProposal> findByTripIdOrderByCreatedAtDesc(Long tripId);
    List<BookingProposal> findByTripIdAndStatus(Long tripId, ProposalStatus status);
}
