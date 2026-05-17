package com.hackathon.travel.Travel.Repository;

import com.hackathon.travel.Travel.models.Booking;
import com.hackathon.travel.Travel.models.BookingType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByTripId(Long tripId);
    List<Booking> findByUserId(Long userId);
    List<Booking> findByTripIdAndType(Long tripId, BookingType type);
}
