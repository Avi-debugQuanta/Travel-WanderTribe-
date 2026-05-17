package com.hackathon.travel.Travel.controller;

import com.hackathon.travel.Travel.models.Booking;
import com.hackathon.travel.Travel.models.BookingStatus;
import com.hackathon.travel.Travel.models.BookingType;
import com.hackathon.travel.Travel.Repository.BookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingRepository bookingRepository;

    public BookingController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {
        booking.setStatus(BookingStatus.PENDING);
        return bookingRepository.save(booking);
    }

    @GetMapping("/trip/{tripId}")
    public List<Booking> getBookingsByTrip(@PathVariable Long tripId,
                                            @RequestParam(required = false) BookingType type) {
        if (type != null) {
            return bookingRepository.findByTripIdAndType(tripId, type);
        }
        return bookingRepository.findByTripId(tripId);
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getBookingsByUser(@PathVariable Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<Booking> confirmBooking(@PathVariable Long id) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setStatus(BookingStatus.CONFIRMED);
            return ResponseEntity.ok(bookingRepository.save(booking));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setStatus(BookingStatus.CANCELLED);
            return ResponseEntity.ok(bookingRepository.save(booking));
        }).orElse(ResponseEntity.notFound().build());
    }
}
