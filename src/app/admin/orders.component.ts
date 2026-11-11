import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Service, STATUTS, fcfa } from '../core/data';
import { ToastService } from '../core/toast.service';
import { METHODS, SOURCES, dd, downloadPdf, dt } from './util';
@Component({
  selector: 'app-orders', standalone: true, imports: [FormsModule],
  template: `
  <div class="bar-s">
    <input type="search" [(ngModel)]="q" placeholder="Rechercher : n°, client, téléphone, service…" style="min-width:260px">
    <select [(ngModel)]="fs"><option value="">Tous les statuts</option>@for (s of st; track s) {<option>{{s}}</option>}</select>
    <select [(ngModel)]="fsrc"><option value="">Toutes origines</option>@for (s of sources; track s) {<option>{{s}}</option>}</select>
    <label style="display:flex;gap:.4rem;align-items:center;margin:0"><input type="checkbox" [(ngModel)]="unpaid" style="width:auto"> Avec solde</label>
    <button class="btn" (click)="openNew()">+ Nouvelle commande</button>
  </div>
  <div class="card scroll"><table><tr><th>N°</th><th>Client</th><th>Commande</th><th>Statut</th><th>Total</th><th>Payé</th><th>Reste</th></tr>
    @for (o of filtered(); track o.id) {<tr class="row" (click)="open(o)">
      <td><b>{{o.code}}</b><br><small>{{dd(o.created_at)}}</small></td><td>{{o.customer_name}}<br><small>{{o.customer_phone}}</small></td>
      <td>{{o.service}} ×{{o.quantity}}<br><small>{{o.source}}{{o.due_date ? ' · pour le ' + dd(o.due_date) : ''}}</small></td>
      <td><span class="st" [attr.data-s]="o.status">{{o.status}}</span></td><td>{{o.total != null ? f(o.total) : 'devis'}}</td><td>{{f(o.paid)}}</td>
      <td [class.late]="dueOf(o) > 0">{{o.total != null ? f(dueOf(o)) : '-'}}</td></tr>}</table>
    @if (!filtered().length) {<p>Aucune commande ne correspond.</p>}</div>

  @if (sel) { <div class="ov" (click)="sel=null"></div>
  <aside class="dr" role="dialog" aria-label="Détail de la commande">
    <div style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0;font-size:1.6rem">{{sel.order.code}}</h2><button class="chip" (click)="sel=null">Fermer ✕</button></div>
    <p><span class="st" [attr.data-s]="sel.order.status">{{sel.order.status}}</span> · créée le {{dt(sel.order.created_at)}} · origine : {{sel.order.source}}</p>
    <h3>Avancement</h3>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap">@for (s of flow; track s; let i = $index) {<button class="chip" [class.p]="i <= idx()" (click)="setStatus(s)">{{s}}</button>}
      <button class="chip" (click)="setStatus('annulée')">Annuler la commande</button></div>
    @if (sel.order.options?.length) {<h3 style="margin-top:1.4rem">Caractéristiques demandées</h3><table>@for (o of sel.order.options; track $index) {<tr><td><b>{{o.label}}</b></td><td>{{o.value}}</td></tr>}</table>}
    <h3 style="margin-top:1.4rem">Informations</h3>
    <div class="two"><div><label>Client</label><input [(ngModel)]="ed.customer_name"></div><div><label>Téléphone</label><input [(ngModel)]="ed.customer_phone"></div>
      <div><label>E-mail</label><input [(ngModel)]="ed.customer_email"></div><div><label>Service</label><input [(ngModel)]="ed.service"></div>
      <div><label>Quantité</label><input type="number" min="1" [(ngModel)]="ed.quantity"></div><div><label>Total (FCFA)</label><input type="number" min="0" [(ngModel)]="ed.total" placeholder="devis"></div>
      <div><label>Réception</label><select [(ngModel)]="ed.delivery"><option value="retrait">Retrait</option><option value="livraison">Livraison</option></select></div><div><label>Pour le</label><input type="date" [(ngModel)]="ed.due_date"></div></div>
    <label>Détails</label><textarea rows="3" [(ngModel)]="ed.details"></textarea><label>Notes internes</label><textarea rows="2" [(ngModel)]="ed.notes"></textarea>
    @if (sel.order.files?.length) {<p>@for (k of sel.order.files; track k; let i = $index) {<a class="chip" [href]="api.orderFileUrl(k)" target="_blank" rel="noopener">Fichier {{i+1}}</a>}</p>}
    <p><button class="btn dark" (click)="saveEdit()">Enregistrer les modifications</button></p>
    <h3 style="margin-top:1.4rem">Paiements : {{f(sel.order.paid)}} / {{sel.order.total != null ? f(sel.order.total) : 'total à fixer'}}</h3>
    <table>@for (p of sel.payments; track p.ref) {<tr [style.opacity]="p.voided ? .5 : 1"><td>{{dd(p.paid_at)}}</td><td>{{p.method}}<br><small>{{p.receipt_no}}</small></td>
      <td [style.text-decoration]="p.voided ? 'line-through' : 'none'">{{f(p.amount)}}</td>
      <td>@if (!p.voided) {<button class="chip" (click)="rcpt(p.ref, false)">Reçu PDF</button><button class="chip" (click)="rcpt(p.ref, true)">Envoyer</button><button class="chip" (click)="voidPay(p)">Annuler</button>} @else {<small>annulé : {{p.void_reason}}</small>}</td></tr>}</table>
    @if (!sel.payments.length) {<p><small>Aucun paiement enregistré.</small></p>}
    @if (sel.order.total != null && dueOf(sel.order) > 0) { <div class="card" style="margin-top:.8rem"><b>Enregistrer un paiement</b>
      <div class="two"><div><label>Montant (FCFA)</label><input type="number" min="1" [(ngModel)]="pay.amount"></div><div><label>Mode</label><select [(ngModel)]="pay.method">@for (m of methods; track m) {<option>{{m}}</option>}</select></div>
        <div><label>Date</label><input type="date" [(ngModel)]="pay.paid_at"></div><div><label>Note</label><input [(ngModel)]="pay.note" placeholder="acompte, solde…"></div></div>
      <p><button class="btn" (click)="addPay()">Enregistrer le paiement</button></p></div> }
    @else if (sel.order.total == null) {<p><small>Fixez le total ci-dessus pour pouvoir enregistrer des paiements.</small></p>}
    <p style="margin-top:1rem"><button class="btn ghost" (click)="rcpt(null, false)">Récapitulatif PDF</button> <button class="btn ghost" (click)="rcpt(null, true)">Envoyer le récapitulatif</button></p>
    <h3 style="margin-top:1.4rem">Historique</h3>
    @for (e of sel.events; track $index) {<p style="margin:.3rem 0"><small>{{dt(e.at)}} · {{e.actor}}</small><br><b>{{e.action}}</b> : {{e.detail}}</p>}
  </aside> }

  @if (nw) { <div class="ov" (click)="nw=null"></div>
  <div class="modal" role="dialog" aria-label="Nouvelle commande"><h2 style="margin-top:0">Enregistrer une commande</h2>
    <div class="two"><div><label>Origine</label><select [(ngModel)]="nw.source">@for (s of sources; track s) {@if (s !== 'site') {<option>{{s}}</option>}}</select></div>
      <div><label>Service du catalogue</label><select [(ngModel)]="nw.service_id" (ngModelChange)="onSvc()"><option value="">Autre (saisie libre)</option>@for (s of cat; track s.id) {<option [value]="s.id">{{s.name}}</option>}</select></div>
      <div><label>Intitulé de la commande</label><input [(ngModel)]="nw.service_name" placeholder="ex. Logo boulangerie Soleil"></div><div><label>Quantité</label><input type="number" min="1" [(ngModel)]="nw.quantity" (ngModelChange)="onSvc(true)"></div>
      <div><label>Client</label><input [(ngModel)]="nw.name"></div><div><label>Téléphone</label><input [(ngModel)]="nw.phone"></div>
      <div><label>E-mail</label><input [(ngModel)]="nw.email"></div><div><label>Pour le</label><input type="date" [(ngModel)]="nw.due_date"></div>
      <div><label>Total (FCFA)</label><input type="number" min="0" [(ngModel)]="nw.total"></div><div><label>Réception</label><select [(ngModel)]="nw.delivery"><option value="retrait">Retrait</option><option value="livraison">Livraison</option></select></div>
      <div><label>Acompte reçu (FCFA)</label><input type="number" min="0" [(ngModel)]="nw.deposit"></div><div><label>Mode de l’acompte</label><select [(ngModel)]="nw.deposit_method">@for (m of methods; track m) {<option>{{m}}</option>}</select></div></div>
    <label>Détails</label><textarea rows="3" [(ngModel)]="nw.details"></textarea>
    @if (nwErr) {<p class="late">{{nwErr}}</p>}
    <p style="display:flex;gap:.6rem;justify-content:flex-end"><button class="btn ghost" (click)="nw=null">Annuler</button><button class="btn" [disabled]="busy" (click)="createNew()">{{busy ? 'Enregistrement…' : 'Enregistrer la commande'}}</button></p></div> }`
})
export class OrdersComponent implements OnInit {
  api = inject(ApiService); toast = inject(ToastService); f = fcfa; dd = dd; dt = dt; st = STATUTS; sources = SOURCES; methods = METHODS;
  flow = ['reçue', 'en cours', 'en production', 'prête', 'livrée'];
  @Input() openId = '';
  rows: any[] = []; cat: Service[] = []; q = ''; fs = ''; fsrc = ''; unpaid = false; sel: any = null; ed: any = {};
  pay: any = { amount: null, method: 'espèces', note: '', paid_at: '' }; nw: any = null; nwErr = ''; busy = false;
  async ngOnInit() { await this.load(); this.cat = await this.api.catalog(); if (this.openId) this.open({ id: this.openId }); }
  async load() { const r = await this.api.a('GET', 'orders'); if (r.ok) this.rows = r.data; }
  dueOf = (o: any) => (o.total == null ? 0 : Math.max(0, o.total - o.paid));
  idx = () => this.flow.indexOf(this.sel?.order.status);
  filtered() {
    const t = this.q.trim().toLowerCase();
    return this.rows.filter(o => (!this.fs || o.status === this.fs) && (!this.fsrc || o.source === this.fsrc) && (!this.unpaid || (o.status !== 'annulée' && this.dueOf(o) > 0))
      && (!t || [o.code, o.customer_name, o.customer_phone, o.service].join(' ').toLowerCase().includes(t)));
  }
  async open(o: any) { const r = await this.api.a('GET', 'orders/' + o.id); if (!r.ok) { this.toast.show('Commande introuvable.'); return; } this.setSel(r.data); }
  setSel(d: any) {
    this.sel = d; const o = d.order;
    this.ed = { customer_name: o.customer_name, customer_phone: o.customer_phone, customer_email: o.customer_email ?? '', service: o.service, details: o.details ?? '', notes: o.notes ?? '', quantity: o.quantity, total: o.total, delivery: o.delivery, due_date: o.due_date ? String(o.due_date).slice(0, 10) : '' };
    this.pay = { amount: this.dueOf(o) || null, method: 'espèces', note: '', paid_at: '' };
    const i = this.rows.findIndex(x => x.id === o.id); if (i >= 0) this.rows[i] = o; else this.rows.unshift(o);
  }
  async saveEdit() {
    const b = { ...this.ed, total: this.ed.total === '' || this.ed.total == null ? null : Number(this.ed.total), quantity: Number(this.ed.quantity) || 1 };
    const r = await this.api.a('PATCH', 'orders/' + this.sel.order.id, b);
    if (!r.ok) { this.toast.show(r.data?.error ?? 'Enregistrement impossible.'); return; }
    this.toast.show('Modifications enregistrées.'); await this.open(this.sel.order);
  }
  async setStatus(s: string) {
    if (s === 'annulée' && !confirm('Annuler cette commande ?')) return;
    const r = await this.api.a('PATCH', 'orders/' + this.sel.order.id, { status: s });
    if (!r.ok) { this.toast.show(r.data?.error ?? 'Changement impossible.'); return; }
    this.toast.show(r.data.warning ?? `Statut : ${s}`); await this.open(this.sel.order);
  }
  async addPay() {
    const r = await this.api.a('POST', `orders/${this.sel.order.id}/payments`, { ...this.pay, amount: Number(this.pay.amount) });
    if (!r.ok) { this.toast.show(r.data?.error ?? 'Paiement impossible.'); return; }
    this.toast.show(`Paiement enregistré, reçu ${r.data.payment.receipt_no}.`); await this.open(this.sel.order);
  }
  async voidPay(p: any) {
    const reason = window.prompt('Motif de l’annulation de ce paiement ?'); if (!reason) return;
    const r = await this.api.a('POST', `payments/${p.ref}/void`, { reason });
    if (!r.ok) { this.toast.show(r.data?.error ?? 'Annulation impossible.'); return; }
    this.toast.show('Paiement annulé.'); await this.open(this.sel.order);
  }
  async rcpt(ref: string | null, send: boolean) {
    const r = await this.api.a('POST', 'receipt', { id: this.sel.order.id, ref, send });
    if (!r.ok || !r.data?.pdf) { this.toast.show(r.data?.error ?? 'Reçu impossible.'); return; }
    if (send && r.data.sent) this.toast.show('Reçu envoyé par e-mail.');
    else { if (send) this.toast.show(this.sel.order.customer_email ? 'E-mail non envoyé : PDF téléchargé.' : 'Pas d’e-mail client : PDF téléchargé.'); downloadPdf(r.data.pdf, `recu-${ref ?? this.sel.order.code}.pdf`); }
    await this.open(this.sel.order);
  }
  openNew() { this.nwErr = ''; this.nw = { source: 'boutique', service_id: '', service_name: '', details: '', quantity: 1, total: null, name: '', phone: '', email: '', delivery: 'retrait', due_date: '', deposit: null, deposit_method: 'espèces' }; }
  onSvc(qtyOnly = false) {
    const s = this.cat.find(x => x.id === this.nw.service_id); if (!s) return;
    if (!qtyOnly) this.nw.service_name = s.name;
    if (s.price) this.nw.total = Number(s.price) * (Number(this.nw.quantity) || 1);
  }
  async createNew() {
    this.nwErr = ''; const n = this.nw;
    if (!n.name.trim() || !n.service_name.trim()) { this.nwErr = 'Indiquez le client et l’intitulé de la commande.'; return; }
    if (n.total === null || n.total === '' || Number(n.total) < 0) { this.nwErr = 'Indiquez le total (0 si gratuit).'; return; }
    this.busy = true;
    const r = await this.api.a('POST', 'orders', { ...n, total: Number(n.total), deposit: Number(n.deposit) || 0, quantity: Number(n.quantity) || 1 });
    this.busy = false;
    if (!r.ok) { this.nwErr = r.data?.error ?? 'Enregistrement impossible.'; return; }
    this.nw = null; this.toast.show(r.data.warning ?? `Commande ${r.data.code} enregistrée.`); await this.load(); await this.open(r.data);
  }
}
