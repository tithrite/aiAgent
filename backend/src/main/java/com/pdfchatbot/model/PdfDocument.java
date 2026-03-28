package com.pdfchatbot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Représente un document PDF uploadé dans le système.
 *
 * Contient les métadonnées du fichier ainsi que le texte extrait
 * qui sera utilisé comme contexte pour le chatbot.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PdfDocument {

    /** Identifiant unique du document */
    private String id;

    /** Nom original du fichier PDF */
    private String fileName;

    /** Texte extrait du PDF par Apache PDFBox */
    private String extractedText;

    /** Taille du fichier en octets */
    private long fileSize;

    /** Nombre de pages du document */
    private int pageCount;

    /** Date et heure d'upload */
    private LocalDateTime uploadedAt;
}
