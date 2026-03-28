package com.pdfchatbot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Représente un message dans la conversation du chatbot.
 *
 * Un message peut être de l'utilisateur (USER) ou du bot (ASSISTANT).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    /** Rôle de l'émetteur du message */
    public enum Role {
        USER,       // Message de l'utilisateur
        ASSISTANT   // Réponse du chatbot
    }

    /** Rôle de l'émetteur */
    private Role role;

    /** Contenu textuel du message */
    private String content;

    /** Horodatage du message */
    private LocalDateTime timestamp;

    /** Identifiant du document PDF associé (optionnel) */
    private String documentId;
}
