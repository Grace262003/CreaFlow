import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { ApiService } from '../core/api.service';
import { fcfa } from '../core/data';
import { dd } from './util';
@Component({
  selector: 'app-dashboard', standalone: true,
  template: `@if (s) {
  <div class="kpis">
    <div class="kpi g"><small>Encaissé aujourd’hui</small><b>{{f(s.today)}}</b></div>
    <div class="kpi g"><small>Encaissé ce mois</small><b>{{f(s.monthIn)}}</b></div>
    <div class="kpi r"><small>Dépenses du mois</small><b>{{f(s.monthOut)}}</b></div>
    <div class="kpi"><small>Résultat du mois</small><b>{{f(s.monthIn - s.monthOut)}}</b></div>
    <div class="kpi r"><small>Reste à encaisser ({{s.receivableCount}} commandes)</small><b>{{f(s.receivable)}}</b></div>
  </div>
  <div class="kpis">@for (o of s.open; track o.status) {<div class="kpi"><small>{{o.status}}</small><b>{{o.n}}</b></div>}</div>
  <div class="card scroll"><h3>À traiter</h3>
    <table><tr><th>N°</th><th>Client</th><th>Service</th><th>Statut</th><th>Échéance</th><th>Reste</th><th></th></tr>
    @for (o of s.todo; track o.id) {<tr><td>{{o.code}}</td><td>{{o.customer_name}}</td><td>{{o.service}}</td><td><span class="st" [attr.data-s]="o.status">{{o.status}}</span></td>
      <td>{{o.due_date ? dd(o.due_date) : ''}}</td><td [class.late]="o.total != null && o.total > o.paid">{{o.total != null ? f(o.total - o.paid) : 'devis'}}</td>
      <td><button class="chip p" (click)="open.emit(o.id)">Ouvrir</button></td></tr>}</table>
    @if (!s.todo.length) {<p>Rien à traiter : tout est livré. 🎉</p>}</div>
  } @else { <p>Chargement…</p> }`
})
export class DashboardComponent implements OnInit {
  api = inject(ApiService); f = fcfa; dd = dd; s: any = null; @Output() open = new EventEmitter<string>();
  async ngOnInit() { const r = await this.api.a('GET', 'summary'); if (r.ok) this.s = r.data; }
}
