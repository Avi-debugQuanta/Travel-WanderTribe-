package com.hackathon.travel.Travel.Repository;

import com.hackathon.travel.Travel.models.Idea;
import com.hackathon.travel.Travel.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IdeaRepository extends JpaRepository<Idea, Long> {
    List<Idea> findByTripId(Long tripId);
    List<Idea> findByTripIdAndCategory(Long tripId, Category category);
}
