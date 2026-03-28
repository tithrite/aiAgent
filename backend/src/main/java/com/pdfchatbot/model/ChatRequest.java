package com.pdfchatbot.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) pour la requête de chat.
 *
 * Envoyé par le frontend lors d'une question au chatbot.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {

   
    @NotBlank(message = "La question ne peut pas être vide")
    private String question;

    
    @NotNull(message = "L'identifiant du document est obligatoire")
    private String documentId;
}
