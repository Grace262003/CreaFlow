import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ToastService } from '../core/toast.service';
import { seo } from '../core/seo';
import { AccountingComponent } from '../admin/accounting.component';
import { ContentComponent } from '../admin/content.component';
import { DashboardComponent } from '../admin/dashboard.component';
import { JournalComponent } from '../admin/journal.component';
import { OrdersComponent } from '../admin/orders.component';
import { ReportsComponent } from '../admin/reports.component';
type Tab = 'dash' | 'orders' | 'compta' | 'rapports' | 'journal' | 'contenu';
@Component({
  selector: 'app-admin', standalone: true, imports: [FormsModule, DashboardComponent, OrdersComponent, AccountingComponent, ReportsComponent, JournalComponent, ContentComponent],
  template: `<section><div class="wrap">
  @if (!ok) { <form (ngSubmit)="login()" class="card" style="max-width:400px" novalidate><h1 style="font-size:2rem">Espace admin</h1>
    <label for="e">E-mail</label><input id="e" name="e" [(ngModel)]="email" type="email" autocomplete="username"><label for="p">Mot de passe</label><input id="p" name="p" [(ngModel)]="pw" type="password" autocomplete="current-password"><br><br>
    <button class="btn" [disabled]="busy">{{busy ? 'Connexion…' : 'Connexion'}}</button><p style="color:var(--red)">{{err}}</p></form> }
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
    } }
  @if (toast.msg) {<div class="toast" role="status">{{toast.msg}}</div>}
  </div></section>`,
  styles: [`.toast{position:fixed;right:1rem;top:80px;z-index:120;background:var(--navy);color:#fff;padding:.8rem 1.2rem;border-radius:12px;max-width:min(420px,90vw);animation:up .4s both}`]
})
export class AdminComponent implements OnInit {
  api = inject(ApiService); toast = inject(ToastService); tab: Tab = 'dash'; focus = '';
  tabs: [Tab, string][] = [['dash', 'Tableau de bord'], ['orders', 'Commandes'], ['compta', 'Comptabilité'], ['rapports', 'Rapports'], ['journal', 'Journal'], ['contenu', 'Contenu du site']];
  ok = false; busy = false; email = ''; pw = ''; err = '';
  constructor() { seo('Administration', 'Espace réservé à l’administration de Creaflow.', { path: '/admin', noindex: true }); }
  ngOnInit() { this.ok = this.api.hasToken(); this.api.onExpire = () => { this.ok = false; this.err = 'Session expirée, reconnectez-vous.'; }; }
  go(t: Tab) { this.focus = ''; this.tab = t; }
  openOrder(id: string) { this.focus = id; this.tab = 'orders'; }
  async login() {
    this.busy = true; const r = await this.api.login(this.email, this.pw); this.busy = false;
    if (r.ok) { this.ok = true; this.err = ''; this.tab = 'dash'; } else this.err = r.status === 503 ? 'Accès admin non configuré sur le serveur.' : r.status === 0 ? 'Serveur injoignable.' : 'Identifiants incorrects.';
  }
  logout() { this.api.logout(); this.ok = false; this.pw = ''; }
}
