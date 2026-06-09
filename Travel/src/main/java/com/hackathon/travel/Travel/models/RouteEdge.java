package com.hackathon.travel.Travel.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RouteEdge {
    private String from;
    private String to;
    private String mode;
    private double km;
    private double duration_hours;
    private String road_type;
    private String difficulty;
    private int altitude_gain_m;
    private int scenic;
    private List<Integer> seasonal;
    private String risk;
    private boolean bidirectional;

    public RouteEdge() {}

    public String getFrom() { return from; }
    public String getTo() { return to; }
    public String getMode() { return mode; }
    public double getKm() { return km; }
    public double getDuration_hours() { return duration_hours; }
    public String getRoad_type() { return road_type; }
    public String getDifficulty() { return difficulty; }
    public int getAltitude_gain_m() { return altitude_gain_m; }
    public int getScenic() { return scenic; }
    public List<Integer> getSeasonal() { return seasonal; }
    public String getRisk() { return risk; }
    public boolean isBidirectional() { return bidirectional; }

    public void setFrom(String from) { this.from = from; }
    public void setTo(String to) { this.to = to; }
    public void setMode(String mode) { this.mode = mode; }
    public void setKm(double km) { this.km = km; }
    public void setDuration_hours(double duration_hours) { this.duration_hours = duration_hours; }
    public void setRoad_type(String road_type) { this.road_type = road_type; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public void setAltitude_gain_m(int altitude_gain_m) { this.altitude_gain_m = altitude_gain_m; }
    public void setScenic(int scenic) { this.scenic = scenic; }
    public void setSeasonal(List<Integer> seasonal) { this.seasonal = seasonal; }
    public void setRisk(String risk) { this.risk = risk; }
    public void setBidirectional(boolean bidirectional) { this.bidirectional = bidirectional; }

    public RouteEdge reversed() {
        RouteEdge r = new RouteEdge();
        r.from = this.to;
        r.to = this.from;
        r.mode = this.mode;
        r.km = this.km;
        r.duration_hours = this.duration_hours;
        r.road_type = this.road_type;
        r.difficulty = this.difficulty;
        r.altitude_gain_m = this.altitude_gain_m;
        r.scenic = this.scenic;
        r.seasonal = this.seasonal;
        r.risk = this.risk;
        r.bidirectional = this.bidirectional;
        return r;
    }
}
