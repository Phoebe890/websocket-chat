package com.example.chat.model;

public class ChatMessage {
    private String content;
    private String sender;
    private MessageType type;

    // An enum to represent the type of message (a regular chat, or a system event)
    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE
    }

    // --- Getters and Setters ---
    // These are crucial for Spring's Jackson library to serialize/deserialize the object to/from JSON.

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }
}