package com.example.chat.controller;

import com.example.chat.model.ChatMessage;
import com.example.chat.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import java.security.Principal;
import java.util.concurrent.CompletableFuture;
@Controller
public class ChatController {

    @Autowired
    private GeminiService geminiService;

    @MessageMapping("/chat.ai")
    @SendToUser("/queue/reply")
    public CompletableFuture<ChatMessage> processAiMessage(@Payload ChatMessage chatMessage, Principal principal) {
        // The core logic 
        return geminiService.getAIResponse(chatMessage.getContent()).thenApply(aiResponseText -> {
            ChatMessage aiReply = new ChatMessage();
            aiReply.setSender("Gemini AI"); // Update the sender name for the UI.
            aiReply.setContent(aiResponseText);
            aiReply.setType(ChatMessage.MessageType.CHAT);
            return aiReply;
        });
    }
}