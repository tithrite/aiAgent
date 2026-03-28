import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { UploadComponent } from './components/upload/upload.component';
import { ChatComponent } from './components/chat/chat.component';
import { ApiService } from './services/api.service';
import { PdfDocument } from './models/chat.models';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatChipsModule,
    UploadComponent,
    ChatComponent
  ],
  template: `
    <mat-toolbar class="app-toolbar" color="primary">
      <mat-icon class="toolbar-icon">auto_stories</mat-icon>
      <span class="app-title">PDF Chatbot</span>
      <span class="app-subtitle">Assistant IA pour vos documents</span>
      <span class="spacer"></span>

      <!-- Statut backend -->
      <span class="backend-status" [class.ok]="backendOk" [class.err]="backendOk === false">
        <mat-icon class="status-icon">
          {{ backendOk === null ? 'pending' : backendOk ? 'cloud_done' : 'cloud_off' }}
        </mat-icon>
        <span class="status-text">
          {{ backendOk === null ? 'Connexion...' : backendOk ? 'Backend connecté' : 'Backend hors ligne' }}
        </span>
      </span>

      <span class="doc-badge" *ngIf="selectedDocument">
        <mat-icon>picture_as_pdf</mat-icon>
        {{ selectedDocument.fileName.length > 20
           ? selectedDocument.fileName.substring(0, 20) + '...'
           : selectedDocument.fileName }}
      </span>
    </mat-toolbar>

    <div class="main-content">
      <div class="panel-left">
        <app-upload (documentSelected)="onDocumentSelected($event)"></app-upload>
      </div>
      <div class="panel-right">
        <app-chat [selectedDocument]="selectedDocument"></app-chat>
      </div>
    </div>

    <footer class="app-footer">
      <span>PDF Chatbot — Spring AI + OpenAI + Angular 17</span>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .app-toolbar {
      background: linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%) !important;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10;
      flex-shrink: 0;
    }

    .toolbar-icon { font-size: 26px; width: 26px; height: 26px; }
    .app-title { font-size: 20px; font-weight: 700; }
    .app-subtitle { font-size: 13px; opacity: 0.75; }
    .spacer { flex: 1; }

    .backend-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      opacity: 0.8;
      margin-right: 12px;
      background: rgba(255,255,255,0.15);
      padding: 4px 10px;
      border-radius: 12px;
    }

    .backend-status.ok { background: rgba(76,175,80,0.3); opacity: 1; }
    .backend-status.err { background: rgba(244,67,54,0.3); opacity: 1; }
    .status-icon { font-size: 16px; width: 16px; height: 16px; }
    .status-text { font-size: 11px; }

    .doc-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
    }

    .doc-badge mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .main-content {
      flex: 1;
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 16px;
      padding: 16px;
      overflow: hidden;
      min-height: 0;
    }

    .panel-left, .panel-right {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
    }

    .app-footer {
      text-align: center;
      padding: 8px;
      font-size: 12px;
      color: #9e9e9e;
      background: white;
      border-top: 1px solid #e0e0e0;
      flex-shrink: 0;
    }
  `]
})
export class AppComponent implements OnInit {
  selectedDocument: PdfDocument | null = null;
  backendOk: boolean | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Vérifier la connexion backend au démarrage
    this.apiService.healthCheck().subscribe({
      next: () => { this.backendOk = true; },
      error: () => { this.backendOk = false; }
    });
  }

  onDocumentSelected(doc: PdfDocument): void {
    this.selectedDocument = doc;
  }
}
