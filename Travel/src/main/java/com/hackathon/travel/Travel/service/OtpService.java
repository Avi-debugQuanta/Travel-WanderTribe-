package com.hackathon.travel.Travel.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final JavaMailSender mailSender;
    private final ConcurrentHashMap<String, OtpEntry> otpStore = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public OtpService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public String generateOtp(String email) {
        String otp = String.format("%06d", random.nextInt(1000000));
        otpStore.put(email, new OtpEntry(otp, System.currentTimeMillis() + 300_000));

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("WanderTribe - Your Login OTP");
            message.setText(
                "Your WanderTribe verification code is: " + otp + "\n\n" +
                "This code expires in 5 minutes.\n\n" +
                "If you didn't request this, please ignore this email.\n\n" +
                "Happy Travels!\nWanderTribe Team"
            );
            message.setFrom("wandertribe.otp@gmail.com");
            mailSender.send(message);
        } catch (Exception e) {
            System.out.println("Email send failed (OTP still valid): " + e.getMessage());
            System.out.println("OTP for " + email + ": " + otp);
        }

        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        OtpEntry entry = otpStore.get(email);
        if (entry == null) return false;
        if (System.currentTimeMillis() > entry.expiresAt) {
            otpStore.remove(email);
            return false;
        }
        if (entry.otp.equals(otp)) {
            otpStore.remove(email);
            return true;
        }
        return false;
    }

    private static class OtpEntry {
        final String otp;
        final long expiresAt;
        OtpEntry(String otp, long expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }
    }
}
