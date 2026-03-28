import {
  Component, Input, OnChanges, SimpleChanges,
  ViewChild, ElementRef, AfterViewChecked, Renderer2
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { ApiService } from '../../services/api.service';
import { VoiceService } from '../../services/voice.service';
import { ChatMessage, ChatRequest, ChatResponse, PdfDocument } from '../../models/chat.models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <mat-card class="chat-card">
      <mat-card-header class="chat-header">
        <mat-icon mat-card-avatar class="bot-avatar">smart_toy</mat-icon>
        <mat-card-title>Assistant PDF</mat-card-title>
        <mat-card-subtitle>
          <span *ngIf="selectedDocument" class="doc-indicator">
            <mat-icon class="indicator-icon">picture_as_pdf</mat-icon>
            {{ selectedDocument.fileName }}
          </span>
          <span *ngIf="!selectedDocument" class="no-doc">
            Aucun document selectionne
          </span>
        </mat-card-subtitle>
      </mat-card-header>

      <mat-divider></mat-divider>

      <div class="chat-window" #chatWindow>

        <div class="welcome-message" *ngIf="messages.length === 0">
          <mat-icon class="welcome-icon">chat_bubble_outline</mat-icon>
          <h3>Bonjour ! Je suis votre assistant PDF</h3>
          <p>Uploadez un PDF puis posez vos questions sur son contenu.</p>
          <p class="hint">Je reponds sur le contenu du PDF et les questions generales.</p>
        </div>

        <div *ngFor="let message of messages"
             class="message-wrapper"
             [class.message-user]="message.role === 'user'"
             [class.message-assistant]="message.role === 'assistant'">

          <div class="avatar">
            <mat-icon *ngIf="message.role === 'user'">person</mat-icon>
            <mat-icon *ngIf="message.role === 'assistant'">smart_toy</mat-icon>
          </div>

          <div class="message-bubble">
            <mat-spinner *ngIf="message.isLoading" diameter="20"></mat-spinner>
            <p *ngIf="!message.isLoading" class="message-content">{{ message.content }}</p>

            <div class="message-footer" *ngIf="!message.isLoading">
              <span class="timestamp">{{ message.timestamp | date:'HH:mm' }}</span>
              <button
                mat-icon-button
                *ngIf="message.role === 'assistant'"
                class="speak-btn"
                matTooltip="{{ isSpeaking ? 'Arreter la lecture' : 'Lire a voix haute' }}"
                (click)="toggleSpeak(message.content)">
                <mat-icon>{{ isSpeaking ? 'stop' : 'volume_up' }}</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <mat-card-actions class="input-area">

        <div class="no-doc-warning" *ngIf="!selectedDocument">
          <mat-icon>warning</mat-icon>
          <span>Uploadez et selectionnez un PDF pour commencer</span>
        </div>

        <div class="input-row">

          <button
            mat-icon-button
            class="mic-btn"
            [class.listening]="isListening"
            [matTooltip]="isListening ? 'Arreter ecoute' : 'Parler (Speech-to-Text)'"
            [disabled]="!voiceAvailable || isLoading"
            (click)="toggleVoiceInput()">
            <mat-icon>{{ isListening ? 'mic_off' : 'mic' }}</mat-icon>
          </button>

          <!-- Textarea à la place de input pour contourner le problème -->
          <textarea
            #messageInput
            class="message-input-field"
            rows="1"
            [placeholder]="getPlaceholder()"
            [disabled]="isLoading || isListening"
            [(ngModel)]="currentQuestion"
            (keyup.enter)="sendQuestion()">
          </textarea>

          <button
            mat-fab
            color="primary"
            class="send-btn"
            matTooltip="Envoyer"
            [disabled]="!currentQuestion.trim() || isLoading"
            (click)="sendQuestion()">
            <mat-icon>send</mat-icon>
          </button>
        </div>

        <div class="loading-indicator" *ngIf="isLoading">
          <mat-spinner diameter="16"></mat-spinner>
          <span>L'IA analyse votre question...</span>
        </div>

        <div class="listening-indicator" *ngIf="isListening">
          <mat-icon class="mic-anim">mic</mat-icon>
          <span>Ecoute en cours... Parlez maintenant</span>
        </div>

      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .chat-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      border-radius: 16px;
      overflow: hidden;
    }

    .chat-header {
      background: linear-gradient(135deg, #9c27b0 0%, #6a1b9a 100%);
      padding: 12px 16px;
    }

    .chat-header mat-card-title,
    .chat-header mat-card-subtitle { color: white !important; }

    .bot-avatar {
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      padding: 4px;
      color: white !important;
    }

    .doc-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      opacity: 0.9;
    }

    .indicator-icon { font-size: 14px; width: 14px; height: 14px; }
    .no-doc { font-size: 12px; opacity: 0.7; }

    .chat-window {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #fafafa;
      min-height: 0;
    }

    .welcome-message {
      text-align: center;
      padding: 32px 16px;
      color: #9e9e9e;
    }

    .welcome-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ce93d8;
      display: block;
      margin: 0 auto 16px;
    }

    .welcome-message h3 { color: #616161; font-weight: 500; }

    .hint {
      background: #f3e5f5;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      color: #7b1fa2;
      display: inline-block;
      margin-top: 8px;
    }

    .message-wrapper {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
      animation: fadeInUp 0.3s ease;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .message-user { flex-direction: row-reverse; }
    .message-user .avatar { background: #9c27b0; }
    .message-assistant .avatar { background: #6a1b9a; }

    .message-user .message-bubble {
      background: #9c27b0;
      color: white;
      border-radius: 18px 4px 18px 18px;
    }

    .message-user .message-bubble .timestamp { color: rgba(255,255,255,0.7); }

    .message-assistant .message-bubble {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 4px 18px 18px 18px;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 4px;
    }

    .avatar mat-icon { color: white; font-size: 20px; width: 20px; height: 20px; }

    .message-bubble {
      max-width: 75%;
      padding: 10px 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .message-content {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .message-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 6px;
    }

    .timestamp { font-size: 11px; color: #9e9e9e; }

    .speak-btn {
      width: 28px !important;
      height: 28px !important;
      line-height: 28px !important;
    }

    .speak-btn mat-icon { font-size: 16px; width: 16px; height: 16px; color: #9c27b0; }

    .input-area {
      padding: 10px 16px 12px;
      background: white;
      border-top: 1px solid #e0e0e0;
      flex-shrink: 0;
    }

    .no-doc-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #fff3e0;
      border-radius: 8px;
      font-size: 13px;
      color: #f57c00;
      margin-bottom: 10px;
    }

    .no-doc-warning mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .input-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mic-btn {
      color: #9c27b0 !important;
      flex-shrink: 0;
    }

    .mic-btn.listening {
      color: #f44336 !important;
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(244,67,54,0.4); }
      50% { transform: scale(1.15); box-shadow: 0 0 0 8px rgba(244,67,54,0); }
    }

    /* TEXTAREA au lieu de input - contourne le bug Angular Material */
    .message-input-field {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #9c27b0;
      border-radius: 24px;
      font-size: 14px;
      font-family: 'Roboto', 'Segoe UI', sans-serif;
      color: #4a148c !important;
      background-color: #f3e5f5 !important;
      outline: none;
      min-width: 0;
      resize: none;
      overflow: hidden;
      line-height: 1.5;
    }

    .message-input-field::placeholder {
      color: #ab47bc !important;
    }

    .message-input-field:focus {
      border-color: #6a1b9a;
      box-shadow: 0 0 0 3px rgba(156, 39, 176, 0.15);
      background-color: #ede7f6 !important;
    }

    .message-input-field:disabled {
      background-color: #f5f5f5 !important;
      color: #9e9e9e !important;
      cursor: not-allowed;
    }

    .send-btn {
      flex-shrink: 0;
      width: 48px !important;
      height: 48px !important;
    }

    .loading-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      font-size: 12px;
      color: #9e9e9e;
    }

    .listening-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      font-size: 12px;
      color: #f44336;
    }

    .mic-anim {
      font-size: 16px;
      width: 16px;
      height: 16px;
      animation: pulse 1s infinite;
    }
  `]
})
export class ChatComponent implements OnChanges, AfterViewChecked {

  @Input() selectedDocument: PdfDocument | null = null;
  @ViewChild('chatWindow') chatWindow!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  messages: ChatMessage[] = [];
  currentQuestion = '';
  isLoading = false;
  isListening = false;
  isSpeaking = false;
  voiceAvailable = false;

  private shouldScrollToBottom = false;

  constructor(
    private apiService: ApiService,
    private voiceService: VoiceService,
    private renderer: Renderer2
  ) {
    this.voiceAvailable = this.voiceService.isSpeechRecognitionAvailable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDocument'] && this.selectedDocument) {
      this.addAssistantMessage(
        ' Document chargé : ' + this.selectedDocument.fileName +
        '\nJe suis prêt à répondre à vos questions sur ce document.'
      );
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
    // Force via Renderer2 - méthode la plus robuste Angular
    if (this.messageInput?.nativeElement) {
      this.renderer.setStyle(this.messageInput.nativeElement, 'color', '#4a148c');
      this.renderer.setStyle(this.messageInput.nativeElement, 'background-color', '#f3e5f5');
      this.renderer.setStyle(this.messageInput.nativeElement, '-webkit-text-fill-color', '#4a148c');
    }
  }

  getPlaceholder(): string {
    if (this.isListening) return '🎤 Écoute en cours...';
    if (!this.selectedDocument) return ' Posez une question ';
    return ' Posez votre question ';
  }

  sendQuestion(): void {
    const question = this.currentQuestion.trim();
    if (!question || this.isLoading) return;

    this.addUserMessage(question);
    this.currentQuestion = '';

    const loadingMsg = this.addLoadingMessage();
    this.isLoading = true;

    const request: ChatRequest = {
      question: question,
      documentId: this.selectedDocument?.id ?? ''
    };

    this.apiService.askQuestion(request).subscribe({
      next: (response: ChatResponse) => {
        this.isLoading = false;
        loadingMsg.content = response.answer;
        loadingMsg.isLoading = false;
        this.shouldScrollToBottom = true;
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err.status === 0
          ? ' Erreur de connexion. Vérifiez que le backend tourne sur le port 8080.'
          : ' Erreur : ' + (err.error?.message || 'Communication avec l\'assistant impossible.');
        loadingMsg.content = msg;
        loadingMsg.isLoading = false;
        this.shouldScrollToBottom = true;
      }
    });
  }

  toggleVoiceInput(): void {
    if (this.isListening) {
      this.voiceService.stopListening();
      this.isListening = false;
    } else {
      this.isListening = true;
      this.voiceService.startListening().subscribe({
        next: (transcript: string) => {
          this.isListening = false;
          this.currentQuestion = transcript;
          this.sendQuestion();
        },
        error: (err: string) => {
          this.isListening = false;
          this.addAssistantMessage(' Erreur vocale : ' + err);
        }
      });
    }
  }

  toggleSpeak(text: string): void {
    if (this.isSpeaking) {
      this.voiceService.stopSpeaking();
      this.isSpeaking = false;
    } else {
      this.isSpeaking = true;
      this.voiceService.speak(text).subscribe({
        next: () => { this.isSpeaking = false; },
        error: () => { this.isSpeaking = false; }
      });
    }
  }

  private addUserMessage(content: string): void {
    this.messages.push({ role: 'user', content, timestamp: new Date() });
    this.shouldScrollToBottom = true;
  }

  private addAssistantMessage(content: string): void {
    this.messages.push({ role: 'assistant', content, timestamp: new Date() });
    this.shouldScrollToBottom = true;
  }

  private addLoadingMessage(): ChatMessage {
    const msg: ChatMessage = { role: 'assistant', content: '', timestamp: new Date(), isLoading: true };
    this.messages.push(msg);
    this.shouldScrollToBottom = true;
    return msg;
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatWindow.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch (e) {}
  }
}