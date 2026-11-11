import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { fcfa } from '../core/data';
import { ToastService } from '../core/toast.service';
import { CATS, METHODS, csv, dd, download, range, ymd } from './util';
import { PeriodComponent } from './period.component';
@Component({
  selector: 'app-accounting', standalone: true, imports: [FormsModule, PeriodComponent],
  template: `
  <app-period [(from)]="from" [(to)]="to" (go)="load()"/>
  <div class="kpis"><div class="kpi g"><small>Encaissé</small><b>{{f(income())}}</b></div><div class="kpi r"><small>Dépenses</small><b>{{f(outcome())}}</b></div>
    <div class="kpi"><small>Résultat net</small><b>{{f(income() - outcome())}}</b></div><div class="kpi r"><small>Reste à encaisser (toutes commandes)</small><b>{{f(receivable)}}</b></div></div>
  <div class="noprint"><button class="chip" [class.p]="tab==='l'" (click)="tab='l'">Journal comptable</button><button class="chip" [class.p]="tab==='i'" (click)="tab='i'">Entrées</button><button class="chip" [class.p]="tab==='o'" (click)="tab='o'">Dépenses</button>
    <button class="chip" (click)="exportCsv()">Exporter en CSV</button><button class="chip" (click)="print()">Imprimer</button></div>
  @if (tab==='o') { <div class="card noprint" style="margin:1rem 0"><b>Enregistrer une dépense</b>
    <div class="two"><div><label>Date</label><input type="date" [(ngModel)]="ex.spent_at"></div><div><label>Catégorie</label><select [(ngModel)]="ex.category">@for (c of cats; track c) {<option>{{c}}</option>}</select></div>
      <div><label>Libellé</label><input [(ngModel)]="ex.label" placeholder="ex. 5 ramettes A4"></div><div><label>Montant (FCFA)</label><input type="number" min="1" [(ngModel)]="ex.amount"></div>
      <div><label>Mode</label><select [(ngModel)]="ex.method">@for (m of methods; track m) {<option>{{m}}</option>}</select></div><div><label>Note</label><input [(ngModel)]="ex.note"></div></div>
    <p><button class="btn" (click)="addEx()">Enregistrer la dépense</button></p></div> }
  <div class="card scroll" style="margin-top:1rem">
    @if (tab==='l') {<table><tr><th>Date</th><th>Type</th><th>Libellé</th><th>Mode</th><th>Entrée</th><th>Sortie</th></tr>
      @for (e of ledger(); track e.key) {<tr [style.opacity]="e.voided ? .45 : 1"><td>{{dd(e.date)}}</td><td>{{e.kind}}</td><td>{{e.label}}<br><small>{{e.ref}}</small></td><td>{{e.method}}</td>
        <td [style.text-decoration]="e.voided ? 'line-through' : 'none'">{{e.kind==='Entrée' ? f(e.amount) : ''}}</td><td [style.text-decoration]="e.voided ? 'line-through' : 'none'">{{e.kind==='Sortie' ? f(e.amount) : ''}}</td></tr>}</table> }
    @if (tab==='i') {<table><tr><th>Date</th><th>Reçu</th><th>Commande</th><th>Client</th><th>Mode</th><th>Montant</th></tr>
      @for (p of pays; track p.ref) {<tr [style.opacity]="p.voided ? .45 : 1"><td>{{dd(p.paid_at)}}</td><td>{{p.receipt_no}}</td><td>{{p.code}}</td><td>{{p.customer_name}}</td><td>{{p.method}}</td><td>{{f(p.amount)}} @if (p.voided) {<small>(annulé)</small>}</td></tr>}</table> }
    @if (tab==='o') {<table><tr><th>Date</th><th>Catégorie</th><th>Libellé</th><th>Mode</th><th>Montant</th><th class="noprint"></th></tr>
      @for (e of exps; track e.id) {<tr [style.opacity]="e.voided ? .45 : 1"><td>{{dd(e.spent_at)}}</td><td>{{e.category}}</td><td>{{e.label}}<br><small>{{e.note}}</small></td><td>{{e.method}}</td><td>{{f(e.amount)}} @if (e.voided) {<small>(annulée)</small>}</td>
        <td class="noprint">@if (!e.voided) {<button class="chip" (click)="voidEx(e)">Annuler</button>}</td></tr>}</table> }
  </div>`
})
export class AccountingComponent implements OnInit {
  api = inject(ApiService); toast = inject(ToastService); f = fcfa; dd = dd; cats = CATS; methods = METHODS;
  from = range('month')[0]; to = range('month')[1]; tab: 'l' | 'i' | 'o' = 'l'; pays: any[] = []; exps: any[] = []; receivable = 0;
  ex: any = { spent_at: ymd(), category: CATS[0], label: '', amount: null, method: 'espèces', note: '' };
  ngOnInit() { this.load(); }
  async load() {
    const [p, e, s] = await Promise.all([this.api.a('GET', `payments?from=${this.from}&to=${this.to}`), this.api.a('GET', `expenses?from=${this.from}&to=${this.to}`), this.api.a('GET', 'summary')]);
    this.pays = p.data ?? []; this.exps = e.data ?? []; this.receivable = s.data?.receivable ?? 0;
  }
  income = () => this.pays.filter(p => !p.voided).reduce((a, p) => a + p.amount, 0);
  outcome = () => this.exps.filter(e => !e.voided).reduce((a, e) => a + e.amount, 0);
  ledger() {
    const a = this.pays.map(p => ({ key: 'p' + p.ref, date: p.paid_at, kind: 'Entrée', label: `${p.code} · ${p.customer_name}`, ref: p.receipt_no, method: p.method, amount: p.amount, voided: p.voided }));
    const b = this.exps.map(e => ({ key: 'e' + e.id, date: e.spent_at, kind: 'Sortie', label: `${e.category} : ${e.label}`, ref: '', method: e.method, amount: e.amount, voided: e.voided }));
    return [...a, ...b].sort((x, y) => String(y.date).localeCompare(String(x.date)));
  }
  async addEx() {
    const r = await this.api.a('POST', 'expenses', { ...this.ex, amount: Number(this.ex.amount) });
    if (!r.ok) { this.toast.show(r.data?.error ?? 'Enregistrement impossible.'); return; }
    this.toast.show('Dépense enregistrée.'); this.ex = { ...this.ex, label: '', amount: null, note: '' }; this.load();
  }
  async voidEx(e: any) {
    const reason = window.prompt('Motif de l’annulation de cette dépense ?'); if (!reason) return;
    const r = await this.api.a('POST', `expenses/${e.id}/void`, { reason });
    if (r.ok) { this.toast.show('Dépense annulée.'); this.load(); } else this.toast.show(r.data?.error ?? 'Annulation impossible.');
  }
  exportCsv() {
    const rows: any[][] = [['Date', 'Type', 'Libellé', 'Référence', 'Mode', 'Entrée', 'Sortie', 'Annulé']];
    for (const e of this.ledger()) rows.push([dd(e.date), e.kind, e.label, e.ref, e.method, e.kind === 'Entrée' ? e.amount : '', e.kind === 'Sortie' ? e.amount : '', e.voided ? 'oui' : '']);
    rows.push([], ['', '', 'Total encaissé', '', '', this.income()], ['', '', 'Total dépenses', '', '', '', this.outcome()], ['', '', 'Résultat net', '', '', this.income() - this.outcome()]);
    download(`comptabilite-${this.from}_${this.to}.csv`, csv(rows));
  }
  print() { window.print(); }
}
