package com.pdfchatbot.config;

import org.springframework.context.annotation.Configuration;

/**
 * Configuration IA - Google Gemini est configuré via application.properties
 * L'appel API se fait directement dans ChatService via java.net.http.HttpClient
 */
@Configuration
public class AiConfig {
    // Gemini API configurée via gemini.api.key dans application.properties
}
