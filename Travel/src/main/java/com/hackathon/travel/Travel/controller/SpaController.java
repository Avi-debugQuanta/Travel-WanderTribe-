package com.hackathon.travel.Travel.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping(value = {"/login", "/dashboard", "/trip/**"})
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
