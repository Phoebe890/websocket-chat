package com.example.chat.model;

import java.util.List;

public class GeminiResponse {
    private List<Candidate> candidates;

    // No-argument constructor for Jackson
    public GeminiResponse() {}

    // Getter and setter for Jackson
    public List<Candidate> getCandidates() {
        return candidates;
    }

    public void setCandidates(List<Candidate> candidates) {
        this.candidates = candidates;
    }
}