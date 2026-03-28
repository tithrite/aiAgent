package com.pdfchatbot.controller;

import com.pdfchatbot.model.ChatRequest;
import com.pdfchatbot.model.ChatResponse;
import com.pdfchatbot.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Contrôleur REST pour le chatbot IA.
 *
 * Endpoints disponibles :
 * - POST /api/chat/ask       → Poser une question au chatbot
 * - GET  /api/chat/health    → Vérifier l'état du service
 */
@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * Endpoint principal du chatbot.
     *
     * Reçoit une question de l'utilisateur, analyse le document PDF
     * correspondant et retourne une réponse générée par l'IA.
     *
     * Exemple de requête :
     * POST /api/chat/ask
     * {
     *   "question": "Quelle est la conclusion du document?",
     *   "documentId": "uuid-du-document"
     * }
     *
     * @param request Requête contenant la question et l'ID du document
     * @return ChatResponse avec la réponse de l'IA
     */
    @PostMapping("/ask")
    public ResponseEntity<ChatResponse> askQuestion(@Valid @RequestBody ChatRequest request) {
        log.info("Question reçue pour le document {}: {}",
                request.getDocumentId(),
                request.getQuestion().substring(0, Math.min(50, request.getQuestion().length())) + "...");

        ChatResponse response = chatService.processQuestion(request);

        // Retourner 200 OK même en cas d'erreur métier (l'erreur est dans le corps)
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint de vérification de santé du service.
     * Utilisé pour vérifier que le backend est opérationnel.
     *
     * @return Statut du service
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "PDF Chatbot Backend",
                "version", "1.0.0"
        ));
    }
}
