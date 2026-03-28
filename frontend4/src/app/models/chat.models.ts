
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean; // Indicateur de chargement (réponse en cours)
}


export interface ChatRequest {
  question: string;
  documentId: string;
}


export interface ChatResponse {
  answer: string;
  documentId: string;
  documentName: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}


export interface PdfDocument {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  textLength?: number;
}


export interface UploadResponse {
  success: boolean;
  message: string;
  documentId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  textLength: number;
  error?: string;
}
