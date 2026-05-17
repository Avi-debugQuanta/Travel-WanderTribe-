package com.hackathon.travel.Travel.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;

@Entity
@Table(name = "wallets")
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Long userId;

    private double balance;

    public Wallet() {}

    public Wallet(Long userId) {
        this.userId = userId;
        this.balance = 0;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public double getBalance() { return balance; }

    public void setId(Long id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setBalance(double balance) { this.balance = balance; }
}
