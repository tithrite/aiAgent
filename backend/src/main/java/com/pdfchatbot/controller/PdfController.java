package com.pdfchatbot.controller;

import com.pdfchatbot.model.PdfDocument;
import com.pdfchatbot.service.PdfService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour la gestion des documents PDF.
 *
 * Endpoints disponibles :
 * - POST   /api/pdf/upload       → Uploader un PDF
 * - GET    /api/pdf/documents    → Lister tous les PDFs
 * - GET    /api/pdf/{id}         → Récupérer un PDF par ID
 * - DELETE /api/pdf/{id}         → Supprimer un PDF
 */
@Slf4j
@RestController
@RequestMapping("/api/pdf")
@RequiredArgsConstructor
public class PdfController {

    private final PdfService pdfService;

    /**
     * Upload et traitement d'un fichier PDF.
     *
     * Accepte un fichier multipart/form-data, extrait le texte
     * et stocke le document pour utilisation par le chatbot.
     *
     * @param file Fichier PDF envoyé par le frontend
     * @return PdfDocument avec les métadonnées et confirmation de succès
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadPdf(@RequestParam("file") MultipartFile file) {
        log.info("Réception d'un fichier PDF: {}", file.getOriginalFilename());

        try {
            PdfDocument document = pdfService.processPdf(file);

            log.info("PDF traité avec succès. ID: {}", document.getId());

            // Retourner les informations du document (sans le texte complet pour économiser la bande passante)
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "PDF uploadé et traité avec succès",
                    "documentId", document.getId(),
                    "fileName", document.getFileName(),
                    "fileSize", document.getFileSize(),
                    "uploadedAt", document.getUploadedAt().toString(),
                    "textLength", document.getExtractedText().length()
            ));

        } catch (IllegalArgumentException e) {
            // Erreur de validation (mauvais format, fichier vide, etc.)
            log.warn("Fichier PDF invalide: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", e.getMessage()));

        } catch (Exception e) {
            // Erreur inattendue
            log.error("Erreur lors du traitement du PDF: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Erreur interne du serveur"));
        }
    }

    /**
     * Récupère la liste de tous les documents PDF uploadés.
     *
     * @return Liste des documents avec leurs métadonnées
     */
    @GetMapping("/documents")
    public ResponseEntity<List<PdfDocument>> getAllDocuments() {
        List<PdfDocument> documents = pdfService.getAllDocuments();
        log.debug("Récupération de {} documents", documents.size());
        return ResponseEntity.ok(documents);
    }

    /**
     * Récupère un document PDF par son identifiant.
     *
     * @param id Identifiant unique du document
     * @return PdfDocument ou 404 si non trouvé
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDocument(@PathVariable String id) {
        PdfDocument document = pdfService.getDocument(id);

        if (document == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Document non trouvé: " + id));
        }

        return ResponseEntity.ok(document);
    }

    /**
     * Supprime un document PDF par son identifiant.
     *
     * @param id Identifiant du document à supprimer
     * @return Confirmation de suppression ou 404
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable String id) {
        boolean deleted = pdfService.deleteDocument(id);

        if (!deleted) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Document non trouvé: " + id));
        }

        log.info("Document supprimé: {}", id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Document supprimé avec succès"));
    }
}
