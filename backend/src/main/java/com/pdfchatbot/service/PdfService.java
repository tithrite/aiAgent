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


@Slf4j
@Service
public class PdfService {

   
    private final Map<String, PdfDocument> documentStore = new HashMap<>();

   
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

    
    private String cleanExtractedText(String text) {
        if (text == null) return "";

        return text
                .replaceAll("\\s+", " ")         // Remplacer les espaces multiples
                .replaceAll("\\n{3,}", "\n\n")    // Limiter les sauts de ligne consécutifs
                .trim();
    }

    
    private void validatePdfFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier PDF est vide");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Le fichier doit être un PDF (extension .pdf)");
        }
    }

    
    public PdfDocument getDocument(String documentId) {
        return documentStore.get(documentId);
    }

    
    public List<PdfDocument> getAllDocuments() {
        return List.copyOf(documentStore.values());
    }

    
    public boolean deleteDocument(String documentId) {
        return documentStore.remove(documentId) != null;
    }
}
