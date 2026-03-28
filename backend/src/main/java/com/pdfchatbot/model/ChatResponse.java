package com.pdfchatbot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO (Data Transfer Object) pour la réponse du chatbot.
 *
 * Retourné par le backend après analyse de la question.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {

    /** Réponse textuelle générée par l'IA */
    private String answer;

    /** Identifiant du document source utilisé */
    private String documentId;

    /** Nom du fichier PDF source */
    private String documentName;

    /** Horodatage de la réponse */
    private LocalDateTime timestamp;

    /** Indicateur de succès */
    private boolean success;

    /** Message d'erreur (si succès = false) */
    private String errorMessage;
}
