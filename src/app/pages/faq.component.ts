import { Component } from '@angular/core';
import { RevealDirective } from '../core/reveal.directive';
import { seo } from '../core/seo';
@Component({
  selector: 'app-faq', standalone: true, imports: [RevealDirective],
  template: `<section><div class="wrap" style="max-width:820px"><h1>Questions fréquentes</h1>
  @for (q of qs; track q.q) { <details class="card" reveal><summary>{{q.q}}</summary><p>{{q.a}}</p></details> }
  </div></section>`,
  styles: [`details{margin-bottom:.8rem;padding:1.1rem 1.4rem}summary{cursor:pointer;font-weight:700;color:var(--navy);list-style:none}summary::after{content:'+';float:right;font-size:1.4rem;line-height:1;transition:transform .3s}details[open] summary::after{transform:rotate(45deg)}details p{margin:.8rem 0 0}`]
})
export class FaqComponent {
  qs = [
    { q: 'Comment passer une commande ?', a: 'Rendez-vous sur « Commander », choisissez votre service, décrivez votre besoin et envoyez vos fichiers. Vous recevez un numéro de commande.' },
    { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Le paiement en ligne par Mobile Money pour les services au prix affiché, ou le paiement au retrait/à la livraison. Pour un service sur devis, le prix vous est communiqué avant paiement.' },
    { q: 'Comment suivre ma commande ?', a: 'Sur la page « Suivi », saisissez votre numéro de commande et le téléphone utilisé lors de la commande.' },
    { q: 'Quels fichiers puis-je envoyer ?', a: 'PDF, images (JPG, PNG), logos et documents de travail. Si vous n’avez rien, notre équipe peut créer votre visuel.' },
    { q: 'Puis-je me faire livrer ?', a: 'Oui, choisissez « Livraison » lors de la commande, ou retirez votre commande à Calavi-Agualand. Les frais de livraison sont confirmés avant paiement.' },
    { q: 'Recevrai-je un reçu ?', a: 'Oui, un reçu PDF vous est envoyé par e-mail une fois la commande enregistrée et payée.' }
  ];
  constructor() { seo('FAQ', 'Réponses sur les commandes, paiements Mobile Money, suivi, livraison et reçus chez Creaflow.', { path: '/faq', graph: [{ '@type': 'FAQPage', mainEntity: this.qs.map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) }] }); }
}
