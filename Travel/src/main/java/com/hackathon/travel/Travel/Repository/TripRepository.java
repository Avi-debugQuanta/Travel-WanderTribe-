package com.hackathon.travel.Travel.Repository;

import com.hackathon.travel.Travel.models.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripRepository extends JpaRepository<Trip, Long> {

}