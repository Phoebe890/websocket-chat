package com.example.chat.controller;
// Controller for handling chat messages and AI responses

import com.example.chat.model.ChatMessage;
import com.example.chat.service.GeminiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final GeminiService geminiService;

    public ChatController(GeminiService geminiService, SimpMessagingTemplate messagingTemplate) {
        this.geminiService = geminiService;
        this.messagingTemplate = messagingTemplate;
    }

    // The method signature is changed to inject the message headers
    @MessageMapping("/chat.ai")
    public void processAiMessage(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Get the unique session ID from the header. This is the key to replying.
        String sessionId = headerAccessor.getSessionId();

        log.info("--- [ChatController] Received message from session ID: {}", sessionId);
        log.info("--- [ChatController] Message content: {}", chatMessage.getContent());

        geminiService.getAIResponse(chatMessage.getContent()).thenAccept(aiResponseText -> {
            log.info("--- [ChatController] GeminiService replied. Sending message back to session: {}", sessionId);

            if (sessionId == null) {
                log.error("--- [ChatController] Session ID is null. Cannot send reply.");
                return;
            }

            ChatMessage aiReply = new ChatMessage();
            aiReply.setSender("Gemini AI");
            aiReply.setContent(aiResponseText);
            aiReply.setType(ChatMessage.MessageType.CHAT);

            // Use the overload of convertAndSendToUser that takes the SESSION ID.
            // Spring will correctly route this to /user/{sessionId}/queue/reply
            messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "/queue/reply",
                    aiReply,
                    headerAccessor.getMessageHeaders() // It's good practice to pass the original headers
            );

            log.info("--- [ChatController] Reply sent successfully to session {}", sessionId);
        });
    }
}