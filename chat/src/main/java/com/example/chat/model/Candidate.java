package com.example.chat.model;

public class Candidate {
    private Content content;

    // No-argument constructor for Jackson
    public Candidate() {}

    // Getters and setters for Jackson
    public Content getContent() {
        return content;
    }

    public void setContent(Content content) {
        this.content = content;
    }
}