package com.hackathon.travel.Travel.controller;

import com.hackathon.travel.Travel.models.User;
import com.hackathon.travel.Travel.Repository.UserRepository;
import com.hackathon.travel.Travel.service.OtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(originPatterns = "*")
public class UserController {

    private final UserRepository userRepository;
    private final OtpService otpService;

    public UserController(UserRepository userRepository, OtpService otpService) {
        this.userRepository = userRepository;
        this.otpService = otpService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name = body.getOrDefault("name", "");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User(name, email, null);
            userRepository.save(user);
        } else if (name != null && !name.isBlank() && (user.getName() == null || user.getName().isBlank())) {
            user.setName(name);
            userRepository.save(user);
        }

        String otp = otpService.generateOtp(email);
        return ResponseEntity.ok(Map.of("message", "OTP sent to " + email, "email", email, "debug_otp", otp));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP required"));
        }

        if (otpService.verifyOtp(email, otp)) {
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                return ResponseEntity.ok(user);
            }
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired OTP"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        User existing = userRepository.findByEmail(user.getEmail()).orElse(null);
        if (existing != null) {
            if (user.getName() != null && !user.getName().isBlank()) existing.setName(user.getName());
            return ResponseEntity.ok(userRepository.save(existing));
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        return userRepository.findByEmail(email)
                .filter(u -> u.getPassword() != null && u.getPassword().equals(password))
                .map(u -> ResponseEntity.ok((Object) u))
                .orElse(ResponseEntity.status(401).body("Invalid credentials"));
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
