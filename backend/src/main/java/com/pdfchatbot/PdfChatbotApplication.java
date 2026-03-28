package com.pdfchatbot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Point d'entrée principal de l'application PDF Chatbot.
 *
 * Cette application permet :
 * - L'upload et l'analyse de documents PDF
 * - Un chatbot intelligent basé sur Spring AI (OpenAI)
 * - Des réponses vocales et textuelles
 *
 * @author Étudiant
 * @version 1.0.0
 */
@SpringBootApplication
public class PdfChatbotApplication {

    public static void main(String[] args) {
        SpringApplication.run(PdfChatbotApplication.class, args);
        System.out.println("===========================================");
        System.out.println("  PDF Chatbot Backend démarré avec succès!");
        System.out.println("  URL: http://localhost:8080");
        System.out.println("===========================================");
    }
}
