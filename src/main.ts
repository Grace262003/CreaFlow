import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
bootstrapApplication(AppComponent, appConfig).catch(console.error);

// Service worker : rend le site installable sur Android et PC, et affiche une page claire hors connexion (non activé avec « ng serve », port 4200).
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && location.port !== '4200') {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
