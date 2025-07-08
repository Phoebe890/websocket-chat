package com.example.chat.service;
// Service for interacting with Gemini API asynchronously

import com.example.chat.model.GeminiRequest;
import com.example.chat.model.GeminiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

@Service
public class GeminiService {

    // Injects the API key from application.properties.
    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final WebClient webClient;

    public GeminiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl(
                        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent")
                .clientConnector(new ReactorClientHttpConnector(
                        HttpClient.create().responseTimeout(Duration.ofSeconds(60))))
                .build();
    }

    /**
     * Sends a prompt to the Gemini API and returns the response asynchronously.
     */
    public CompletableFuture<String> getAIResponse(String prompt) {
        // Create the structured request object using the user's prompt.
        GeminiRequest requestBody = new GeminiRequest(prompt);

        return webClient.post()
                .uri(uriBuilder -> uriBuilder.queryParam("key", geminiApiKey).build())
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(GeminiResponse.class)
                .doOnSubscribe(subscription -> System.out.println("--- [GeminiService] API call initiated."))
                .doOnSuccess(response -> System.out
                        .println("--- [GeminiService] Successfully received response from Gemini API."))
                .map(response -> {
                    // This logic
                    if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                        String text = response.getCandidates().get(0).getContent().getParts().get(0).getText();
                        System.out.println("--- [GeminiService] Extracted AI text.");
                        return text;
                    }
                    System.out.println("--- [GeminiService] Response was empty or malformed.");
                    return "Response was empty or malformed.";
                })
                .onErrorResume(error -> {
                    System.err.println("--- [GeminiService] ERROR during API call: " + error.getMessage());
                    return reactor.core.publisher.Mono.just("Sorry, an error occurred while contacting the AI.");
                })
                .toFuture();
    }
}