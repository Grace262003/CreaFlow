import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ToastService } from '../core/toast.service';
import { seo } from '../core/seo';
import { AccountingComponent } from '../admin/accounting.component';
import { AccountComponent } from '../admin/account.component';
import { ContentComponent } from '../admin/content.component';
import { DashboardComponent } from '../admin/dashboard.component';
import { JournalComponent } from '../admin/journal.component';
import { OrdersComponent } from '../admin/orders.component';
import { ReportsComponent } from '../admin/reports.component';
type Tab = 'dash' | 'orders' | 'compta' | 'rapports' | 'journal' | 'contenu' | 'compte';
@Component({
  selector: 'app-admin', standalone: true, imports: [FormsModule, DashboardComponent, OrdersComponent, AccountingComponent, ReportsComponent, JournalComponent, ContentComponent, AccountComponent],
  template: `<section><div class="wrap">
  @if (!ok) {
    @if (apiDown) { <div class="card" style="max-width:560px"><h1 style="font-size:1.8rem">Serveur injoignable</h1><p>L’espace admin a besoin du serveur du site (API et base de données), qui n’existe pas avec « ng serve ». En local, lancez <b>npx netlify-cli dev</b> puis ouvrez <b>http://localhost:8888/admin</b> (voir le README). Sinon, ouvrez le site déployé sur Netlify.</p></div> }
    @else if (st?.canSetup) { <form (ngSubmit)="doSetup()" class="card" style="max-width:460px" novalidate><h1 style="font-size:2rem">Créer le compte administrateur</h1>
      <p>Première visite : choisissez votre e-mail et votre mot de passe. Le code d’installation se lit dans Neon (voir le README).</p>
      <label for="c">Code d’installation</label><input id="c" name="c" [(ngModel)]="code" autocomplete="off">
      <label for="e">Votre e-mail</label><input id="e" name="e" [(ngModel)]="email" type="email" autocomplete="username">
      <label for="p">Mot de passe (10 caractères minimum)</label><input id="p" name="p" [(ngModel)]="pw" type="password" autocomplete="new-password">
      <label for="p2">Confirmer le mot de passe</label><input id="p2" name="p2" [(ngModel)]="pw2" type="password" autocomplete="new-password"><br><br>
      <button class="btn" [disabled]="busy">{{busy ? 'Création…' : 'Créer mon compte'}}</button><p style="color:var(--red)">{{err}}</p></form> }
    @else if (st && !st.configured) { <div class="card" style="max-width:520px"><h1 style="font-size:1.8rem">Installation à terminer</h1>
      <p>Aucun compte administrateur n’existe et aucun code d’installation n’a été trouvé. Dans Neon, ouvrez le SQL Editor et exécutez le fichier <b>database/schema.sql</b>, puis rechargez cette page.</p></div> }
    @else { <form (ngSubmit)="login()" class="card" style="max-width:400px" novalidate><h1 style="font-size:2rem">Espace admin</h1>
      <label for="e">E-mail</label><input id="e" name="e" [(ngModel)]="email" type="email" autocomplete="username"><label for="p">Mot de passe</label><input id="p" name="p" [(ngModel)]="pw" type="password" autocomplete="current-password"><br><br>
      <button class="btn" [disabled]="busy">{{busy ? 'Connexion…' : 'Connexion'}}</button><p style="color:var(--red)">{{err}}</p></form> } }
  @else {
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.6rem" class="noprint"><h1 style="font-size:2.2rem;margin:0">Administration</h1><button class="chip" (click)="logout()">Déconnexion</button></div>
    <div class="noprint" style="margin:1rem 0">@for (t of tabs; track t[0]) {<button class="chip" [class.p]="tab===t[0]" (click)="go(t[0])">{{t[1]}}</button>}</div>
    @switch (tab) {
      @case ('dash') {<app-dashboard (open)="openOrder($event)"/>}
      @case ('orders') {<app-orders [openId]="focus"/>}
      @case ('compta') {<app-accounting/>}
      @case ('rapports') {<app-reports/>}
      @case ('journal') {<app-journal/>}
      @case ('contenu') {<app-content/>}
      @case ('compte') {<app-account/>}
    } }
  @if (toast.msg) {<div class="toast" role="status">{{toast.msg}}</div>}
  </div></section>`,
  styles: [`.toast{position:fixed;right:1rem;top:80px;z-index:120;background:var(--navy);color:#fff;padding:.8rem 1.2rem;border-radius:12px;max-width:min(420px,90vw);animation:up .4s both}`]
})
export class AdminComponent implements OnInit {
  api = inject(ApiService); toast = inject(ToastService); tab: Tab = 'dash'; focus = '';
  tabs: [Tab, string][] = [['dash', 'Tableau de bord'], ['orders', 'Commandes'], ['compta', 'Comptabilité'], ['rapports', 'Rapports'], ['journal', 'Journal'], ['contenu', 'Contenu du site'], ['compte', 'Mon compte et équipe']];
  ok = false; busy = false; email = ''; pw = ''; pw2 = ''; cur = ''; code = ''; err = ''; st: { configured: boolean; canSetup: boolean } | null = null; apiDown = false;
  constructor() { seo('Administration', 'Espace réservé à l’administration de Creaflow.', { path: '/admin', noindex: true }); }
  async ngOnInit() { this.ok = this.api.hasToken(); if (!this.ok) { const r = await this.api.adminStatus(); if (r.ok) this.st = r.data; else { this.apiDown = r.status === 0; this.st = { configured: true, canSetup: false }; } } this.api.onExpire = () => { this.ok = false; this.err = 'Session expirée, reconnectez-vous.'; }; }
  go(t: Tab) { this.focus = ''; this.tab = t; }
  openOrder(id: string) { this.focus = id; this.tab = 'orders'; }
  async login() {
    this.busy = true; const r = await this.api.login(this.email, this.pw); this.busy = false;
    if (r.ok) { this.ok = true; this.st = { configured: true, canSetup: false }; this.err = ''; this.tab = 'dash'; } else this.err = r.status === 503 ? 'Accès admin non configuré sur le serveur.' : r.status === 0 ? 'Serveur injoignable.' : 'Identifiants incorrects.';
  }
  logout() { this.api.logout(); this.ok = false; this.pw = ''; this.st = { configured: true, canSetup: false }; }
  async doSetup() {
    this.err = '';
    if (this.pw !== this.pw2) { this.err = 'Les deux mots de passe ne correspondent pas.'; return; }
    this.busy = true; const r = await this.api.setup(this.code.trim(), this.email, this.pw); this.busy = false;
    if (r.ok) { this.ok = true; this.st = { configured: true, canSetup: false }; this.pw = this.pw2 = ''; this.tab = 'dash'; this.toast.show('Compte administrateur créé. Bienvenue !'); } else this.err = r.data?.error ?? 'Création impossible.';
  }
}