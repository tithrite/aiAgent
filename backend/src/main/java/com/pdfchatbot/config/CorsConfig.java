package com.pdfchatbot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * Configuration CORS (Cross-Origin Resource Sharing).
 *
 * Permet au frontend Angular (port 4200) de communiquer
 * avec le backend Spring Boot (port 8080) sans blocage CORS.
 */
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:http://localhost:4200}")
    private String allowedOrigins;

    /**
     * Configure le filtre CORS pour autoriser les requêtes cross-origin.
     *
     * @return CorsFilter configuré pour l'application
     */
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Autoriser l'origine Angular
        config.addAllowedOrigin(allowedOrigins);

        // Autoriser tous les headers HTTP
        config.addAllowedHeader("*");

        // Autoriser toutes les méthodes HTTP (GET, POST, PUT, DELETE, etc.)
        config.addAllowedMethod("*");

        // Autoriser les cookies et credentials
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Appliquer la configuration CORS à tous les endpoints
        source.registerCorsConfiguration("/api/**", config);

        return new CorsFilter(source);
    }
}
