package com.example.chat.model;

import java.util.List;

public class Content {
    private List<Part> parts;
    private String role; // The Gemini response includes a 'role' field (e.g., "model")

    // No-argument constructor for Jackson
    public Content() {}

    public Content(List<Part> parts) {
        this.parts = parts;
    }
    
    // Getters and setters for Jackson
    public List<Part> getParts() {
        return parts;
    }

    public void setParts(List<Part> parts) {
        this.parts = parts;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}