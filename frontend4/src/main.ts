import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

/**
 * Point d'entrée Angular - Lance l'application
 */
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error('Erreur au démarrage:', err));
