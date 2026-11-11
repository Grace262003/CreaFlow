import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { fcfa } from '../core/data';
import { ToastService } from '../core/toast.service';
import { csv, dd, download, range } from './util';
import { PeriodComponent } from './period.component';
@Component({
  selector: 'app-reports', standalone: true, imports: [PeriodComponent],
  template: `
  <app-period [(from)]="from" [(to)]="to" (go)="load()"/>
  @if (r) {
  <h2 style="margin:.5rem 0">Rapport du {{dd(r.from)}} au {{dd(r.to)}}</h2>
  <div class="noprint"><button class="chip p" (click)="exportCsv()">Exporter en CSV</button><button class="chip" (click)="print()">Imprimer / PDF</button></div>
  <div class="kpis"><div class="kpi"><small>Commandes</small><b>{{r.totals.orders}}</b></div><div class="kpi"><small>Chiffre d’affaires facturé</small><b>{{f(r.totals.billed)}}</b></div>
    <div class="kpi g"><small>Encaissé</small><b>{{f(r.totals.income)}}</b></div><div class="kpi r"><small>Dépenses</small><b>{{f(r.totals.expense)}}</b></div><div class="kpi"><small>Résultat net</small><b>{{f(r.totals.net)}}</b></div></div>
  <div class="card"><h3>Encaissements et dépenses par jour</h3>
    <svg [attr.viewBox]="'0 0 700 170'" style="width:100%;height:auto" role="img" aria-label="Graphique journalier">
      @for (b of bars(); track b.day) {<rect [attr.x]="b.x" [attr.y]="150 - b.hi" [attr.width]="b.w" [attr.height]="b.hi" fill="#0B1B3A" rx="2"><title>{{b.day}} : encaissé {{f(b.income)}}</title></rect>
        <rect [attr.x]="b.x + b.w" [attr.y]="150 - b.he" [attr.width]="b.w" [attr.height]="b.he" fill="#D81E3E" rx="2"><title>{{b.day}} : dépenses {{f(b.expense)}}</title></rect>}
      <line x1="0" y1="150" x2="700" y2="150" stroke="#e3e8f2"/>
      <text x="0" y="166" font-size="11" fill="#5b6785">{{dd(r.from)}}</text><text x="700" y="166" font-size="11" fill="#5b6785" text-anchor="end">{{dd(r.to)}}</text></svg>
    <small><span style="color:#0B1B3A">■</span> encaissé · <span style="color:#D81E3E">■</span> dépenses</small></div>
  <div class="grid" style="margin-top:1rem">
    <div class="card"><h3>Commandes par statut</h3><table>@for (x of r.byStatus; track x.status) {<tr><td><span class="st" [attr.data-s]="x.status">{{x.status}}</span></td><td>{{x.n}}</td><td>{{f(x.amount)}}</td></tr>}</table></div>
    <div class="card"><h3>Par pôle</h3><table>@for (x of r.byPole; track x.pole) {<tr><td>{{x.pole}}</td><td>{{x.n}}</td><td>{{f(x.amount)}}</td></tr>}</table></div>
    <div class="card"><h3>Par origine</h3><table>@for (x of r.bySource; track x.source) {<tr><td>{{x.source}}</td><td>{{x.n}}</td><td>{{f(x.amount)}}</td></tr>}</table></div>
    <div class="card"><h3>Encaissé par mode</h3><table>@for (x of r.byMethod; track x.method) {<tr><td>{{x.method}}</td><td>{{x.n}}</td><td>{{f(x.amount)}}</td></tr>}</table></div>
    <div class="card"><h3>Dépenses par catégorie</h3><table>@for (x of r.byCat; track x.category) {<tr><td>{{x.category}}</td><td>{{x.n}}</td><td>{{f(x.amount)}}</td></tr>}</table></div></div>
  <div class="grid" style="margin-top:1rem">
    <div class="card scroll"><h3>Services les plus vendus</h3><table>@for (x of r.byService; track x.service) {<tr><td>{{x.service}}</td><td>{{x.n}}</td><td>{{f(x.amount)}}</td></tr>}</table></div>
    <div class="card scroll"><h3>Meilleurs clients</h3><table>@for (x of r.clients; track $index) {<tr><td>{{x.name}}<br><small>{{x.phone}}</small></td><td>{{x.n}}</td><td>{{f(x.amount)}}</td></tr>}</table></div></div>
  <div class="card scroll" style="margin-top:1rem"><h3>Créances : {{f(r.receivableTotal)}} à encaisser</h3>
    <table><tr><th>N°</th><th>Client</th><th>Service</th><th>Total</th><th>Payé</th><th>Reste</th></tr>
    @for (x of r.receivables; track x.code) {<tr><td>{{x.code}}</td><td>{{x.customer_name}}<br><small>{{x.customer_phone}}</small></td><td>{{x.service}}</td><td>{{f(x.total)}}</td><td>{{f(x.paid)}}</td><td class="late">{{f(x.due)}}</td></tr>}</table>
    @if (!r.receivables.length) {<p>Aucune créance : toutes les commandes sont soldées.</p>}</div>
  } @else { <p>Chargement…</p> }`
})
export class ReportsComponent implements OnInit {
  api = inject(ApiService); toast = inject(ToastService); f = fcfa; dd = dd; from = range('month')[0]; to = range('month')[1]; r: any = null;
  ngOnInit() { this.load(); }
  async load() { const x = await this.api.a('GET', `report?from=${this.from}&to=${this.to}`); if (x.ok) this.r = x.data; else this.toast.show(x.data?.error ?? 'Rapport indisponible.'); }
  bars() {
    const d: any[] = this.r?.daily ?? []; const max = Math.max(1, ...d.map(x => Math.max(x.income, x.expense))); const slot = 700 / Math.max(1, d.length), w = Math.max(1, Math.min(18, slot / 2 - 1));
    return d.map((x, i) => ({ ...x, x: i * slot + (slot - 2 * w) / 2, w, hi: (x.income / max) * 140, he: (x.expense / max) * 140 }));
  }
  exportCsv() {
    const r = this.r; const rows: any[][] = [['Rapport Creaflow', r.from, r.to], [], ['Commandes', r.totals.orders], ['CA facturé', r.totals.billed], ['Encaissé', r.totals.income], ['Dépenses', r.totals.expense], ['Résultat net', r.totals.net]];
    const sec = (t: string, a: any[], k: string) => { rows.push([], [t, 'Nombre', 'Montant']); a.forEach(x => rows.push([x[k], x.n, x.amount])); };
    sec('Par statut', r.byStatus, 'status'); sec('Par pôle', r.byPole, 'pole'); sec('Par origine', r.bySource, 'source'); sec('Encaissé par mode', r.byMethod, 'method'); sec('Dépenses par catégorie', r.byCat, 'category'); sec('Services', r.byService, 'service');
    rows.push([], ['Créances', 'Client', 'Service', 'Total', 'Payé', 'Reste']); r.receivables.forEach((x: any) => rows.push([x.code, x.customer_name, x.service, x.total, x.paid, x.due]));
    rows.push([], ['Jour', 'Encaissé', 'Dépenses']); r.daily.forEach((x: any) => rows.push([x.day, x.income, x.expense]));
    download(`rapport-${r.from}_${r.to}.csv`, csv(rows));
  }
  print() { window.print(); }
}
