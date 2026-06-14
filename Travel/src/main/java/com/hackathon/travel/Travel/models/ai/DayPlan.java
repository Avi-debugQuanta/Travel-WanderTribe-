package com.hackathon.travel.Travel.models.ai;

import java.util.List;

public class DayPlan {
    private int day;
    private String title;
    private String route;
    private String scenicRating;
    private List<String> stops;
    private List<String> schedule;
    private String hotel;
    private List<String> food;
    private List<String> risks;
    private String guide;
    private String budget;
    private List<String> tips;

    public DayPlan() {}

    public int getDay() { return day; }
    public void setDay(int day) { this.day = day; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }

    public String getScenicRating() { return scenicRating; }
    public void setScenicRating(String scenicRating) { this.scenicRating = scenicRating; }

    public List<String> getStops() { return stops; }
    public void setStops(List<String> stops) { this.stops = stops; }

    public List<String> getSchedule() { return schedule; }
    public void setSchedule(List<String> schedule) { this.schedule = schedule; }

    public String getHotel() { return hotel; }
    public void setHotel(String hotel) { this.hotel = hotel; }

    public List<String> getFood() { return food; }
    public void setFood(List<String> food) { this.food = food; }

    public List<String> getRisks() { return risks; }
    public void setRisks(List<String> risks) { this.risks = risks; }

    public String getGuide() { return guide; }
    public void setGuide(String guide) { this.guide = guide; }

    public String getBudget() { return budget; }
    public void setBudget(String budget) { this.budget = budget; }

    public List<String> getTips() { return tips; }
    public void setTips(List<String> tips) { this.tips = tips; }
}
