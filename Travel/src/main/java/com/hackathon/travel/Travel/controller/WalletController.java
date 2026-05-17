package com.hackathon.travel.Travel.controller;

import com.hackathon.travel.Travel.models.Wallet;
import com.hackathon.travel.Travel.Repository.WalletRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(originPatterns = "*")
public class WalletController {

    private final WalletRepository walletRepository;

    public WalletController(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    @GetMapping("/{userId}")
    public Wallet getBalance(@PathVariable Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> walletRepository.save(new Wallet(userId)));
    }

    @PostMapping("/{userId}/add")
    public Wallet addFunds(@PathVariable Long userId, @RequestBody Map<String, Object> body) {
        double amount = ((Number) body.get("amount")).doubleValue();
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> walletRepository.save(new Wallet(userId)));
        wallet.setBalance(wallet.getBalance() + amount);
        return walletRepository.save(wallet);
    }
}
