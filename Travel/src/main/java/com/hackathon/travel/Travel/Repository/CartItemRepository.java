package com.hackathon.travel.Travel.Repository;

import com.hackathon.travel.Travel.models.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByTripIdAndUserId(Long tripId, Long userId);
    void deleteAllByTripIdAndUserId(Long tripId, Long userId);
}
