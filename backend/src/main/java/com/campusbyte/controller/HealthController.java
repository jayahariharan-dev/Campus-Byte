package com.campusbyte.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    // Quick way to check the backend is up: GET http://localhost:8080/api/health
    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of("status", "Campus Byte backend is running");
    }
}
