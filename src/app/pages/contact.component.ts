import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { ApiService } from '../core/api.service';
import { RevealDirective } from '../core/reveal.directive';
import { seo } from '../core/seo';
@Component({
  selector: 'app-contact', standalone: true, imports: [FormsModule, RouterLink, RevealDirective],
  template: `
  <section class="top"><div class="wrap"><h1>Parlons de votre projet</h1>
    <p class="lead">Une question, un devis, une idée à concrétiser ? Écrivez-nous, nous répondons rapidement.</p>
    <div class="lay">
      <div class="cards">
        <article class="card hv" reveal><span class="ic wa"><svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 1-13.4 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></span>
          <div><h3>WhatsApp</h3><p>Le plus rapide pour un devis ou envoyer une image.</p><a class="btn" [href]="'https://wa.me/'+e.whatsapp" target="_blank" rel="noopener">Écrire sur WhatsApp</a></div></article>
        <article class="card hv" reveal style="--d:.1s"><span class="ic"><svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></span>
          <div><h3>Téléphone</h3><p>+229 01 97 16 80 15</p><a class="btn dark" [href]="'tel:'+e.phone">Appeler</a></div></article>
        <article class="card hv" reveal style="--d:.2s"><span class="ic"><svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zM3 7l9 7 9-7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></span>
          <div><h3>E-mail</h3><p>{{e.email}}</p><a class="btn ghost" [href]="'mailto:'+e.email">Envoyer un e-mail</a></div></article>
        <article class="card hv" reveal style="--d:.3s"><span class="ic"><svg viewBox="0 0 24 24"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12zM12 12.5h.01" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
          <div><h3>Atelier</h3><p>Calavi-Agualand, Bénin</p><a class="btn ghost" [href]="dir" target="_blank" rel="noopener">Itinéraire</a></div></article>
      </div>
      <form class="card form" (ngSubmit)="send()" novalidate reveal>
        <h2 style="font-size:1.6rem">Envoyez-nous un message</h2>
        @if (ok) { <div class="done"><b>Message envoyé ✓</b><p>Merci {{name}}, nous revenons vers vous très vite.</p><button type="button" class="btn dark" (click)="again()">Écrire un autre message</button></div> }
        @else {
          <label for="n">Nom</label><input id="n" name="n" [(ngModel)]="name" autocomplete="name">
          <label for="p">Téléphone</label><input id="p" name="p" type="tel" [(ngModel)]="phone" autocomplete="tel">
          <label for="e">E-mail</label><input id="e" name="e" type="email" [(ngModel)]="email" autocomplete="email">
          <input name="website" [(ngModel)]="trap" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px">
          <label for="m">Votre message</label><textarea id="m" name="m" rows="5" [(ngModel)]="message"></textarea>
          @if (err) {<p class="err">{{err}}</p>}
          <p><small>Indiquez au moins un téléphone ou un e-mail pour que nous puissions vous répondre.</small></p>
          <button class="btn" [disabled]="busy">{{busy ? 'Envoi…' : 'Envoyer le message'}}</button> }
      </form>
    </div>
    <div class="map" reveal><iframe title="Carte : Calavi-Agualand" loading="lazy" src="https://www.google.com/maps?q=Calavi+Agualand+Benin&output=embed"></iframe></div>
    <p style="margin-top:1.5rem">Une question fréquente ? <a routerLink="/faq" style="color:var(--red);font-weight:600">Consultez la FAQ</a> ou <a routerLink="/commander" style="color:var(--red);font-weight:600">commandez directement</a>.</p>
  </div></section>`,
  styles: [`
  .top{padding-top:3.5rem}.lead{font-size:1.15rem;max-width:56ch}.lay{display:grid;gap:1.5rem;grid-template-columns:1fr 1fr;margin-top:2rem;align-items:start}@media(max-width:900px){.lay{grid-template-columns:1fr}}
  .cards{display:grid;gap:1rem}.cards .card{display:flex;gap:1.1rem;align-items:center}.cards p{margin:0 0 .7rem}
  .ic{display:grid;place-items:center;flex:none;width:56px;height:56px;border-radius:16px;background:var(--g);color:#fff;transition:transform .5s cubic-bezier(.3,1.6,.5,1)}.ic.wa{background:#1fa855}.ic svg{width:28px}.card:hover .ic{transform:rotate(-10deg) scale(1.1)}
  .btn{padding:.6rem 1.2rem;font-size:.95rem}.err{color:var(--red);font-weight:600}.done{padding:1rem 0;animation:up .5s both}
  .map{margin-top:1.5rem;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);box-shadow:0 2px 12px #0b1b3a0d}.map iframe{border:0;width:100%;height:360px;display:block}`]
})
export class ContactComponent {
  api = inject(ApiService); e = environment;
  dir = 'https://www.google.com/maps/dir/?api=1&destination=Calavi+Agualand+Benin';
  name = ''; phone = ''; email = ''; message = ''; trap = ''; busy = false; ok = false; err = '';
  constructor() { seo('Contact et emplacement', 'Contactez Creaflow par WhatsApp, téléphone ou e-mail. Atelier à Calavi-Agualand, Bénin.', { path: '/contact', graph: [{ '@type': 'ContactPage', name: 'Contact Creaflow', url: environment.siteUrl + '/contact' }] }); }
  async send() {
    this.err = '';
    if (!this.name.trim()) { this.err = 'Indiquez votre nom.'; return; }
    if (!this.phone.trim() && !this.email.trim()) { this.err = 'Indiquez un téléphone ou un e-mail.'; return; }
    if (this.email.trim() && !/^\S+@\S+\.\S+$/.test(this.email.trim())) { this.err = 'Adresse e-mail invalide.'; return; }
    if (this.message.trim().length < 5) { this.err = 'Écrivez votre message.'; return; }
    this.busy = true;
    const r = await this.api.contact({ name: this.name, phone: this.phone, email: this.email, message: this.message, website: this.trap });
    this.busy = false;
    if (r.ok) this.ok = true; else this.err = r.data?.error ?? 'Envoi impossible. Écrivez-nous sur WhatsApp.';
  }
  again() { this.ok = false; this.message = ''; }
}
