package com.example.chat.model;

import java.util.Collections;
import java.util.List;

public class GeminiRequest {
    private final List<Content> contents;

    public GeminiRequest(String prompt) {
        // Now uses the new public classes
        Part part = new Part(prompt);
        Content content = new Content(Collections.singletonList(part));
        this.contents = Collections.singletonList(content);
    }

    public List<Content> getContents() {
        return contents;
    }
}