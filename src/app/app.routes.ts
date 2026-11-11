import { Routes } from '@angular/router';
const l = (f: () => Promise<any>) => ({ loadComponent: f });
export const routes: Routes = [
  { path: '', ...l(() => import('./pages/home.component').then(m => m.HomeComponent)) },
  { path: 'services', ...l(() => import('./pages/services.component').then(m => m.ServicesComponent)) },
  { path: 'realisations', ...l(() => import('./pages/gallery.component').then(m => m.GalleryComponent)) },
  { path: 'a-propos', ...l(() => import('./pages/about.component').then(m => m.AboutComponent)) },
  { path: 'faq', ...l(() => import('./pages/faq.component').then(m => m.FaqComponent)) },
  { path: 'commander', ...l(() => import('./pages/order.component').then(m => m.OrderComponent)) },
  { path: 'paiement/retour', ...l(() => import('./pages/track.component').then(m => m.TrackComponent)) },
  { path: 'suivi', ...l(() => import('./pages/track.component').then(m => m.TrackComponent)) },
  { path: 'contact', ...l(() => import('./pages/contact.component').then(m => m.ContactComponent)) },
  { path: 'mentions-legales', ...l(() => import('./pages/legal.component').then(m => m.LegalComponent)) },
  { path: 'confidentialite', ...l(() => import('./pages/legal.component').then(m => m.LegalComponent)) },
  { path: 'admin', ...l(() => import('./pages/admin.component').then(m => m.AdminComponent)) },
  { path: '**', redirectTo: '' }
];
