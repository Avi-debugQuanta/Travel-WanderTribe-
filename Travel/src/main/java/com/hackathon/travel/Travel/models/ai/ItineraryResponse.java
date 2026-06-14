package com.hackathon.travel.Travel.models.ai;

import java.util.List;

public class ItineraryResponse {
    private List<DayPlan> days;
    private List<String> tips;
    private List<String> packingList;

    public ItineraryResponse() {}

    public List<DayPlan> getDays() { return days; }
    public void setDays(List<DayPlan> days) { this.days = days; }

    public List<String> getTips() { return tips; }
    public void setTips(List<String> tips) { this.tips = tips; }

    public List<String> getPackingList() { return packingList; }
    public void setPackingList(List<String> packingList) { this.packingList = packingList; }
}
