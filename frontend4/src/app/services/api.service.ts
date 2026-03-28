import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatRequest, ChatResponse, PdfDocument, UploadResponse } from '../models/chat.models';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  /** URL de base du backend Spring Boot */
  private readonly apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ============================================================
  // API PDF
  // ============================================================

  /**
   * Upload un fichier PDF vers le backend.
   * Le backend extrait le texte avec PDFBox et stocke le document.
   *
   * @param file Fichier PDF sélectionné par l'utilisateur
   * @returns Observable avec les informations du document uploadé
   */
  uploadPdf(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file); // 'file' correspond au @RequestParam du backend

    return this.http.post<UploadResponse>(`${this.apiUrl}/pdf/upload`, formData);
  }

  /**
   * Récupère la liste de tous les documents PDF disponibles.
   *
   * @returns Observable avec la liste des documents
   */
  getAllDocuments(): Observable<PdfDocument[]> {
    return this.http.get<PdfDocument[]>(`${this.apiUrl}/pdf/documents`);
  }

  /**
   * Supprime un document PDF par son identifiant.
   *
   * @param documentId ID du document à supprimer
   * @returns Observable avec la confirmation de suppression
   */
  deleteDocument(documentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pdf/${documentId}`);
  }

  // ============================================================
  // API Chat
  // ============================================================

  /**
   * Envoie une question au chatbot IA.
   * Le backend analyse le PDF et retourne une réponse basée sur son contenu.
   *
   * @param request Requête avec la question et l'ID du document
   * @returns Observable avec la réponse de l'IA
   */
  askQuestion(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat/ask`, request);
  }

  /**
   * Vérifie que le backend est opérationnel.
   *
   * @returns Observable avec le statut du service
   */
  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chat/health`);
  }
}
