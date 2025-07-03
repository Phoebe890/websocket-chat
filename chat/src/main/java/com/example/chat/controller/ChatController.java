package com.example.chat.controller;

import com.example.chat.model.ChatMessage;
import com.example.chat.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
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

        System.out.println("--- [ChatController] processAiMessage ENTERED for user principal: " + principal.getName());

        return geminiService.getAIResponse(chatMessage.getContent()).thenApply(aiResponseText -> {

            System.out.println("--- [ChatController] GeminiService has replied. Sending message back to user: "
                    + principal.getName());

            ChatMessage aiReply = new ChatMessage();
            aiReply.setSender("Gemini AI");
            aiReply.setContent(aiResponseText);
            aiReply.setType(ChatMessage.MessageType.CHAT);
            return aiReply;
        });
    }
}