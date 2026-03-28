package com.pdfchatbot.service;

import com.pdfchatbot.model.PdfDocument;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service responsable de la gestion des documents PDF.
 *
 * Fonctionnalités :
 * - Upload et stockage en mémoire des documents PDF
 * - Extraction du texte via Apache PDFBox
 * - Récupération des documents par identifiant
 *
 * Note : Pour un projet en production, utiliser une base de données
 * ou un vector store (ex: Pinecone, Chroma) au lieu du stockage en mémoire.
 */
@Slf4j
@Service
public class PdfService {

    /**
     * Stockage en mémoire des documents PDF.
     * Clé = identifiant unique (UUID), Valeur = document PDF
     *
     * Pour la production : remplacer par une base de données ou vector store
     */
    private final Map<String, PdfDocument> documentStore = new HashMap<>();

    /**
     * Traite un fichier PDF uploadé : extraction du texte et stockage.
     *
     * @param file Fichier PDF reçu du frontend
     * @return PdfDocument avec le texte extrait et les métadonnées
     * @throws IOException Si le fichier ne peut pas être lu
     * @throws IllegalArgumentException Si le fichier n'est pas un PDF valide
     */
    public PdfDocument processPdf(MultipartFile file) throws IOException {
        // Validation du type de fichier
        validatePdfFile(file);

        log.info("Traitement du fichier PDF: {}", file.getOriginalFilename());

        // Extraire le texte du PDF avec Apache PDFBox
        String extractedText = extractTextFromPdf(file);

        // Créer le document PDF avec ses métadonnées
        PdfDocument document = PdfDocument.builder()
                .id(UUID.randomUUID().toString())           // Identifiant unique
                .fileName(file.getOriginalFilename())       // Nom du fichier
                .extractedText(extractedText)               // Texte extrait
                .fileSize(file.getSize())                   // Taille en octets
                .uploadedAt(LocalDateTime.now())            // Date d'upload
                .build();

        // Stocker le document en mémoire
        documentStore.put(document.getId(), document);

        log.info("Document PDF stocké avec succès. ID: {}, Taille du texte: {} caractères",
                document.getId(), extractedText.length());

        return document;
    }

    /**
     * Extrait le texte d'un fichier PDF en utilisant Apache PDFBox.
     *
     * PDFBox parcourt toutes les pages du document et extrait
     * le texte brut de chaque page.
     *
     * @param file Fichier PDF à analyser
     * @return Texte extrait du PDF
     * @throws IOException Si l'extraction échoue
     */
    private String extractTextFromPdf(MultipartFile file) throws IOException {
        // PDFBox 3.x : Loader.loadPDF(byte[]) remplace PDDocument.load(InputStream)
        try (PDDocument pdDocument = Loader.loadPDF(file.getBytes())) {

            log.debug("Extraction du texte de {} pages", pdDocument.getNumberOfPages());

            // PDFTextStripper extrait le texte de toutes les pages
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true); // Trier par position pour une lecture cohérente

            String text = stripper.getText(pdDocument);

            // Nettoyer le texte extrait (supprimer les espaces excessifs)
            text = cleanExtractedText(text);

            log.debug("Texte extrait avec succès: {} caractères", text.length());
            return text;
        }
    }

    /**
     * Nettoie le texte extrait du PDF.
     * Supprime les espaces multiples et normalise les sauts de ligne.
     *
     * @param text Texte brut extrait
     * @return Texte nettoyé
     */
    private String cleanExtractedText(String text) {
        if (text == null) return "";

        return text
                .replaceAll("\\s+", " ")         // Remplacer les espaces multiples
                .replaceAll("\\n{3,}", "\n\n")    // Limiter les sauts de ligne consécutifs
                .trim();
    }

    /**
     * Valide que le fichier est bien un PDF non vide.
     *
     * @param file Fichier à valider
     * @throws IllegalArgumentException Si le fichier est invalide
     */
    private void validatePdfFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier PDF est vide");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Le fichier doit être un PDF (extension .pdf)");
        }
    }

    /**
     * Récupère un document PDF par son identifiant.
     *
     * @param documentId Identifiant unique du document
     * @return PdfDocument correspondant, ou null si non trouvé
     */
    public PdfDocument getDocument(String documentId) {
        return documentStore.get(documentId);
    }

    /**
     * Récupère la liste de tous les documents PDF stockés.
     *
     * @return Liste de tous les documents
     */
    public List<PdfDocument> getAllDocuments() {
        return List.copyOf(documentStore.values());
    }

    /**
     * Supprime un document du stockage.
     *
     * @param documentId Identifiant du document à supprimer
     * @return true si supprimé, false si non trouvé
     */
    public boolean deleteDocument(String documentId) {
        return documentStore.remove(documentId) != null;
    }
}
