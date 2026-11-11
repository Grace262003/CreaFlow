import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { seo } from '../core/seo';
@Component({
  selector: 'app-legal', standalone: true,
  template: `<section><div class="wrap" style="max-width:760px">
  @if (priv) { <h1>Politique de confidentialité</h1>
    <p>Creaflow collecte votre nom, téléphone, e-mail, les détails de votre commande et les fichiers que vous envoyez, uniquement pour traiter votre commande, la suivre et vous envoyer votre reçu.</p>
    <p>Les paiements Mobile Money sont traités par le prestataire de paiement : Creaflow ne conserve aucun numéro de compte ni code secret.</p>
    <p>Vos données ne sont pas vendues. Pour les consulter, les corriger ou les supprimer, écrivez à creaflow229&#64;gmail.com.</p> }
  @else { <h1>Mentions légales</h1>
    <p><strong>Éditeur :</strong> [RAISON SOCIALE / CreaFlow]<br>Adresse : Calavi-Agualand, Bénin<br>IFU : [À COMPLÉTER] · RCCM : [À COMPLÉTER]<br>Contact : creaflow229&#64;gmail.com · +229 01 97 16 80 15</p>
    <p><strong>Directeur de la publication :</strong> [NOM À COMPLÉTER]</p>
    <p><strong>Hébergeur :</strong> [NOM ET ADRESSE DE L’HÉBERGEUR À COMPLÉTER]</p>
    <p><strong>Propriété intellectuelle :</strong> les contenus du site (textes, visuels, logo) appartiennent à Creaflow. Les fichiers envoyés par les clients restent leur propriété.</p> }
  </div></section>`
})
export class LegalComponent {
  priv = inject(Router).url.includes('confidentialite');
  constructor() { seo(this.priv ? 'Confidentialité' : 'Mentions légales', 'Informations légales et protection des données de Creaflow.', { path: this.priv ? '/confidentialite' : '/mentions-legales' }); }
}
