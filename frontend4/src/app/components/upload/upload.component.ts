import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../services/api.service';
import { PdfDocument, UploadResponse } from '../../models/chat.models';


@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatListModule,
    MatChipsModule
  ],
  template: `
    <mat-card class="upload-card">
      <mat-card-header>
        <mat-icon mat-card-avatar color="primary">picture_as_pdf</mat-icon>
        <mat-card-title>Documents PDF</mat-card-title>
        <mat-card-subtitle>Uploadez un PDF pour commencer</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <!-- Zone de depot -->
        <div
          class="drop-zone"
          [class.drag-over]="isDragOver"
          [class.uploading]="isUploading"
          (click)="fileInput.click()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)">

          <mat-icon class="upload-icon" [class.spinning]="isUploading">
            {{ isUploading ? 'sync' : 'cloud_upload' }}
          </mat-icon>

          <p class="upload-text">
            {{ isUploading ? 'Traitement en cours...' : 'Glissez un PDF ici ou cliquez' }}
          </p>
          <p class="upload-hint">PDF uniquement - Taille max : 50 MB</p>
        </div>

        <!-- Input fichier cache -->
        <input
          #fileInput
          type="file"
          accept=".pdf"
          style="display: none"
          (change)="onFileSelected($event)">

        <!-- Barre de progression -->
        <mat-progress-bar
          *ngIf="isUploading"
          mode="indeterminate"
          color="primary"
          class="progress-bar">
        </mat-progress-bar>

        <!-- Liste des documents -->
        <div class="documents-section" *ngIf="uploadedDocuments.length > 0">
          <h3 class="documents-title">
            <mat-icon>folder_open</mat-icon>
            Documents disponibles
          </h3>

          <div class="doc-list">
            <div
              *ngFor="let doc of uploadedDocuments"
              class="doc-item"
              [class.active]="doc.id === selectedDocumentId"
              (click)="selectDocument(doc)">

              <mat-icon class="doc-icon">picture_as_pdf</mat-icon>

              <div class="doc-info">
                <div class="doc-name">{{ doc.fileName }}</div>
                <div class="doc-meta">{{ formatFileSize(doc.fileSize) }}</div>
              </div>

              <span *ngIf="doc.id === selectedDocumentId" class="active-badge">Actif</span>
            </div>
          </div>
        </div>

        <!-- Message si aucun document -->
        <div class="no-document-hint" *ngIf="uploadedDocuments.length === 0 && !isUploading">
          <mat-icon>info_outline</mat-icon>
          <span>Aucun document uploade. Selectionnez un PDF.</span>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .upload-card { height: 100%; border-radius: 16px; }

    .drop-zone {
      border: 2px dashed #9c27b0;
      border-radius: 12px;
      padding: 32px 16px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: rgba(156,39,176,0.04);
      margin-bottom: 16px;
    }

    .drop-zone:hover, .drop-zone.drag-over {
      background: rgba(156,39,176,0.12);
      border-color: #6a1b9a;
    }

    .drop-zone.uploading { pointer-events: none; opacity: 0.7; }

    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #9c27b0;
      display: block;
      margin: 0 auto 8px;
    }

    .upload-icon.spinning { animation: spin 1s linear infinite; }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    .upload-text { margin: 8px 0 4px; font-weight: 500; color: #424242; }
    .upload-hint { margin: 0; font-size: 12px; color: #9e9e9e; }
    .progress-bar { margin: 8px 0; border-radius: 4px; }

    .documents-section { margin-top: 16px; }

    .documents-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #616161;
      margin: 0 0 8px;
    }

    .documents-title mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .doc-list {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    .doc-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      cursor: pointer;
      border-bottom: 1px solid #f5f5f5;
      transition: background 0.2s;
    }

    .doc-item:hover { background: rgba(156,39,176,0.06); }

    .doc-item.active {
      background: rgba(156,39,176,0.12);
      border-left: 3px solid #9c27b0;
    }

    .doc-icon { color: #e53935; font-size: 24px; width: 24px; height: 24px; flex-shrink: 0; }

    .doc-info { flex: 1; min-width: 0; }

    .doc-name {
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .doc-meta { font-size: 11px; color: #9e9e9e; }

    .active-badge {
      font-size: 10px;
      background: #9c27b0;
      color: white;
      padding: 2px 8px;
      border-radius: 10px;
      flex-shrink: 0;
    }

    .no-document-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
      font-size: 13px;
      color: #9e9e9e;
      margin-top: 8px;
    }

    .no-document-hint mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `]
})
export class UploadComponent {

  @Output() documentSelected = new EventEmitter<PdfDocument>();

  uploadedDocuments: PdfDocument[] = [];
  selectedDocumentId: string | null = null;
  isUploading = false;
  isDragOver = false;

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.uploadFile(input.files[0]);
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      if (files[0].name.toLowerCase().endsWith('.pdf')) {
        this.uploadFile(files[0]);
      } else {
        this.showError('Seuls les fichiers PDF sont acceptes.');
      }
    }
  }

  private uploadFile(file: File): void {
    this.isUploading = true;
    this.apiService.uploadPdf(file).subscribe({
      next: (response: UploadResponse) => {
        this.isUploading = false;
        if (response.success) {
          const doc: PdfDocument = {
            id: response.documentId,
            fileName: response.fileName,
            fileSize: response.fileSize,
            uploadedAt: response.uploadedAt
          };
          this.uploadedDocuments.push(doc);
          this.selectDocument(doc);
          this.showSuccess(file.name + ' uploade avec succes !');
        } else {
          this.showError(response.error || 'Erreur lors de l\'upload');
        }
      },
      error: (err: any) => {
        this.isUploading = false;
        if (err.status === 0) {
          this.showError('Impossible de contacter le serveur. Verifiez que le backend est demarre.');
        } else {
          this.showError(err.error?.error || 'Erreur lors de l\'upload du PDF');
        }
      }
    });
  }

  selectDocument(doc: PdfDocument): void {
    this.selectedDocumentId = doc.id;
    this.documentSelected.emit(doc);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  private showSuccess(msg: string): void {
    this.snackBar.open(msg, 'Fermer', { duration: 4000, panelClass: ['snack-success'] });
  }

  private showError(msg: string): void {
    this.snackBar.open(msg, 'Fermer', { duration: 6000, panelClass: ['snack-error'] });
  }
}
