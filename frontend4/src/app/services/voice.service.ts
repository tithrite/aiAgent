import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class VoiceService {

  /** Reconnaissance vocale (Speech-to-Text) */
  private recognition: any;

  /** Synthèse vocale (Text-to-Speech) */
  private synthesis: SpeechSynthesis;

  /** Indique si la reconnaissance vocale est en cours */
  private isListening = false;

  constructor(private ngZone: NgZone) {
    this.synthesis = window.speechSynthesis;
    this.initSpeechRecognition();
  }

 

 
  private initSpeechRecognition(): void {
    // Vérifier la compatibilité du navigateur
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition; // Préfixe Chrome

    if (!SpeechRecognition) {
      console.warn('Speech Recognition non supporté par ce navigateur');
      return;
    }

    this.recognition = new SpeechRecognition();

    // Configuration de la reconnaissance
    this.recognition.lang = 'fr-FR';          // Langue française
    this.recognition.continuous = false;       // Arrête après un énoncé
    this.recognition.interimResults = false;   // Résultats finaux uniquement
    this.recognition.maxAlternatives = 1;      // Une seule alternative
  }

  /**
   * Démarre la reconnaissance vocale et retourne le texte reconnu.
   *
   * Utilise les APIs Web Speech qui accèdent au microphone du navigateur.
   * L'utilisateur doit autoriser l'accès au microphone.
   *
   * @returns Observable émettant le texte reconnu
   */
  startListening(): Observable<string> {
    return new Observable(observer => {
      if (!this.recognition) {
        observer.error('Speech Recognition non disponible dans ce navigateur. Utilisez Chrome ou Edge.');
        return;
      }

      if (this.isListening) {
        this.recognition.stop();
      }

      this.isListening = true;

      // Callback appelé quand la reconnaissance produit un résultat
      this.recognition.onresult = (event: any) => {
        this.ngZone.run(() => {
          const transcript = event.results[0][0].transcript;
          console.log('Texte reconnu:', transcript);
          observer.next(transcript);
          observer.complete();
        });
      };

      
      this.recognition.onerror = (event: any) => {
        this.ngZone.run(() => {
          this.isListening = false;
          let errorMsg = 'Erreur de reconnaissance vocale';

          switch (event.error) {
            case 'no-speech':
              errorMsg = 'Aucune parole détectée. Réessayez.';
              break;
            case 'not-allowed':
              errorMsg = 'Accès au microphone refusé. Autorisez l\'accès dans les paramètres du navigateur.';
              break;
            case 'network':
              errorMsg = 'Erreur réseau lors de la reconnaissance vocale.';
              break;
          }

          observer.error(errorMsg);
        });
      };

      
      this.recognition.onend = () => {
        this.ngZone.run(() => {
          this.isListening = false;
        });
      };

      
      try {
        this.recognition.start();
        console.log('Écoute vocale démarrée...');
      } catch (err) {
        this.isListening = false;
        observer.error('Impossible de démarrer la reconnaissance vocale');
      }
    });
  }

  
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Vérifie si la reconnaissance vocale est disponible dans le navigateur.
   *
   * @returns true si disponible, false sinon
   */
  isSpeechRecognitionAvailable(): boolean {
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  /**
   * Retourne l'état actuel de l'écoute.
   *
   * @returns true si en cours d'écoute
   */
  getIsListening(): boolean {
    return this.isListening;
  }

 

  /**
   * Lit un texte à voix haute en français.
   *
   * Utilise l'API Web Speech Synthesis native du navigateur.
   * Aucune connexion externe n'est nécessaire.
   *
   * @param text Texte à lire à voix haute
   * @returns Observable complété quand la lecture est terminée
   */
  speak(text: string): Observable<void> {
    return new Observable(observer => {
      if (!this.synthesis) {
        observer.error('Speech Synthesis non disponible dans ce navigateur');
        return;
      }

      // Arrêter toute lecture en cours
      this.synthesis.cancel();

      // Créer un nouvel énoncé vocal
      const utterance = new SpeechSynthesisUtterance(text);

      // Configuration de la voix
      utterance.lang = 'fr-FR';    // Langue française
      utterance.rate = 1.0;        // Vitesse normale
      utterance.pitch = 1.0;       // Hauteur normale
      utterance.volume = 1.0;      // Volume maximum

      // Chercher une voix française si disponible
      const voices = this.synthesis.getVoices();
      const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
      if (frenchVoice) {
        utterance.voice = frenchVoice;
      }

      // Callbacks d'état
      utterance.onend = () => {
        this.ngZone.run(() => {
          observer.next();
          observer.complete();
        });
      };

      utterance.onerror = (event) => {
        this.ngZone.run(() => {
          observer.error('Erreur lors de la synthèse vocale: ' + event.error);
        });
      };

      // Démarrer la lecture
      this.synthesis.speak(utterance);
      console.log('Lecture vocale démarrée...');
    });
  }

  /**
   * Arrête la lecture vocale en cours.
   */
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Vérifie si la synthèse vocale est disponible.
   *
   * @returns true si disponible
   */
  isSpeechSynthesisAvailable(): boolean {
    return 'speechSynthesis' in window;
  }
}
