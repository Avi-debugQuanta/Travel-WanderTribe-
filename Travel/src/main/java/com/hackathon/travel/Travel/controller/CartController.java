package com.hackathon.travel.Travel.controller;

import com.hackathon.travel.Travel.models.CartItem;
import com.hackathon.travel.Travel.models.Booking;
import com.hackathon.travel.Travel.models.BookingStatus;
import com.hackathon.travel.Travel.models.Wallet;
import com.hackathon.travel.Travel.Repository.CartItemRepository;
import com.hackathon.travel.Travel.Repository.BookingRepository;
import com.hackathon.travel.Travel.Repository.WalletRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(originPatterns = "*")
public class CartController {

    private final CartItemRepository cartItemRepository;
    private final BookingRepository bookingRepository;
    private final WalletRepository walletRepository;

    public CartController(CartItemRepository cartItemRepository,
                          BookingRepository bookingRepository,
                          WalletRepository walletRepository) {
        this.cartItemRepository = cartItemRepository;
        this.bookingRepository = bookingRepository;
        this.walletRepository = walletRepository;
    }

    @PostMapping
    public CartItem addToCart(@RequestBody CartItem item) {
        item.setNegotiatedPrice(item.getOriginalPrice());
        item.setNegotiated(false);
        item.setAddedAt(java.time.LocalDateTime.now());
        return cartItemRepository.save(item);
    }

    @GetMapping("/trip/{tripId}/user/{userId}")
    public List<CartItem> getCartItems(@PathVariable Long tripId, @PathVariable Long userId) {
        return cartItemRepository.findByTripIdAndUserId(tripId, userId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long id) {
        if (cartItemRepository.existsById(id)) {
            cartItemRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/negotiate")
    public ResponseEntity<Map<String, Object>> negotiate(@PathVariable Long id,
                                                          @RequestBody Map<String, Object> body) {
        return cartItemRepository.findById(id).map(item -> {
            double offered = ((Number) body.get("offeredPrice")).doubleValue();
            double original = item.getOriginalPrice();
            Map<String, Object> result = new LinkedHashMap<>();

            double minAcceptable = original * 0.80;

            if (offered >= minAcceptable) {
                item.setNegotiatedPrice(offered);
                item.setNegotiated(true);
                cartItemRepository.save(item);
                result.put("accepted", true);
                result.put("finalPrice", offered);
                result.put("message", "Deal accepted! You saved ₹" + Math.round(original - offered));
            } else {
                double counter = Math.round(original * 0.85);
                result.put("accepted", false);
                result.put("counterOffer", counter);
                result.put("message", "That's too low. Best I can do is ₹" + (int) counter +
                           " (was ₹" + (int) original + ")");
            }
            result.put("item", item);
            return ResponseEntity.ok(result);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/checkout")
    @Transactional
    public ResponseEntity<Map<String, Object>> checkout(@RequestBody Map<String, Object> body) {
        Long tripId = ((Number) body.get("tripId")).longValue();
        Long userId = ((Number) body.get("userId")).longValue();

        List<CartItem> items = cartItemRepository.findByTripIdAndUserId(tripId, userId);
        if (items.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cart is empty"));
        }

        double total = items.stream().mapToDouble(CartItem::getNegotiatedPrice).sum();

        Wallet wallet = walletRepository.findByUserId(userId).orElse(null);
        if (wallet == null || wallet.getBalance() < total) {
            double balance = wallet != null ? wallet.getBalance() : 0;
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("error", "Insufficient balance");
            err.put("required", total);
            err.put("balance", balance);
            err.put("shortfall", total - balance);
            return ResponseEntity.badRequest().body(err);
        }

        wallet.setBalance(wallet.getBalance() - total);
        walletRepository.save(wallet);

        for (CartItem item : items) {
            Booking booking = new Booking(tripId, userId, item.getItemType(),
                    item.getItemName(), item.getNegotiatedPrice());
            booking.setStatus(BookingStatus.CONFIRMED);
            booking.setDetails(item.getItemDetails());
            bookingRepository.save(booking);
        }

        cartItemRepository.deleteAll(items);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("totalPaid", total);
        result.put("newBalance", wallet.getBalance());
        result.put("bookingsCreated", items.size());
        return ResponseEntity.ok(result);
    }
}
