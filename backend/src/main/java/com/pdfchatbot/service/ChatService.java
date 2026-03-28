package com.pdfchatbot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdfchatbot.model.ChatRequest;
import com.pdfchatbot.model.ChatResponse;
import com.pdfchatbot.model.PdfDocument;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ChatService {

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    private final PdfService pdfService;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    private static final String GROQ_URL =
            "https://api.groq.com/openai/v1/chat/completions";

    private static final String SYSTEM_PROMPT = """
            Tu es un assistant intelligent et polyvalent.
            
            RÈGLES :
            1. Si une question concerne le document PDF fourni, réponds en te basant sur son contenu.
            2. Si la question est générale (hors PDF), réponds normalement avec tes connaissances.
            3. Réponds toujours en français.
            4. Sois précis, clair et concis.
            """;

    public ChatService(PdfService pdfService) {
        this.pdfService = pdfService;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    public ChatResponse processQuestion(ChatRequest request) {
        log.info("Traitement question pour document: {}", request.getDocumentId());

        try {
            String userMessage;

            PdfDocument document = pdfService.getDocument(request.getDocumentId());

            if (document != null && document.getExtractedText() != null
                    && !document.getExtractedText().isBlank()) {

                // Question avec contexte PDF
                String pdfContent = document.getExtractedText();
                if (pdfContent.length() > 15000) {
                    pdfContent = pdfContent.substring(0, 15000) + "\n\n[Document tronqué...]";
                }

                userMessage = """
                        Contenu du document PDF (%s):
                        ==============================
                        %s
                        ==============================
                        
                        Question : %s
                        """.formatted(document.getFileName(), pdfContent, request.getQuestion());

            } else {
                // Question générale sans PDF
                userMessage = request.getQuestion();
            }

            // Construction du body pour Groq API
            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "model", "llama-3.1-8b-instant",
                    "max_tokens", 2048,
                    "messages", List.of(
                            Map.of("role", "system", "content", SYSTEM_PROMPT),
                            Map.of("role", "user", "content", userMessage)
                    )
            ));

            // Construire la requête HTTP
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(GROQ_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            // Envoyer la requête
            HttpResponse<String> httpResponse = httpClient.send(
                    httpRequest, HttpResponse.BodyHandlers.ofString());

            log.debug("Groq response status: {}", httpResponse.statusCode());

            // Gérer les erreurs HTTP
            if (httpResponse.statusCode() != 200) {
                log.error("Erreur Groq API: {}", httpResponse.body());
                return buildErrorResponse("Erreur API Groq ("
                        + httpResponse.statusCode() + "): " + httpResponse.body());
            }

            // Parser la réponse Groq
            JsonNode root = objectMapper.readTree(httpResponse.body());
            String aiResponse = root
                    .path("choices").get(0)
                    .path("message")
                    .path("content").asText();

            log.info("Réponse Groq générée avec succès");

            return ChatResponse.builder()
                    .answer(aiResponse)
                    .documentId(document != null ? document.getId() : null)
                    .documentName(document != null ? document.getFileName() : null)
                    .timestamp(LocalDateTime.now())
                    .success(true)
                    .build();

        } catch (Exception e) {
            log.error("Erreur inattendue: {}", e.getMessage(), e);
            return buildErrorResponse("Erreur inattendue: " + e.getMessage());
        }
    }

    private ChatResponse buildErrorResponse(String errorMessage) {
        return ChatResponse.builder()
                .answer(errorMessage)
                .timestamp(LocalDateTime.now())
                .success(false)
                .errorMessage(errorMessage)
                .build();
    }
}