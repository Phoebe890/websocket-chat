package com.example.chat.model;

// Model for a part of content in Gemini API
public class Part {
    private String text;

    // A no-argument constructor is required for JSON deserialization by Jackson
    public Part() {
    }

    public Part(String text) {
        this.text = text;
    }

    // Getters and setters are required by Jackson
    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
