package com.hackathon.travel.Travel.bean;    
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import com.hackathon.travel.Travel.models.Trip;   
import com.hackathon.travel.Travel.Repository.TripRepository;
import java.util.List;



@RestController          
public class Travelbean {

    private TripRepository tripRepository;
    
    public Travelbean(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }
    @GetMapping("/travelItenary")
    public  String getItenary(){
        return "Itenary is ready ";
    }

    @PostMapping("/createTrip")
    public Trip createTrip(@RequestBody Trip trip){
        return tripRepository.save(trip);
    }

    @GetMapping("/trips")
    public List<Trip> getAllTrips() {
      return tripRepository.findAll();
  }

}
