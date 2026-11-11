import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { csv, dt, download } from './util';
@Component({
  selector: 'app-journal', standalone: true, imports: [FormsModule],
  template: `<p>Trace de toutes les opérations : commandes, statuts, paiements, annulations, reçus, dépenses, catalogue. Les entrées ne sont jamais supprimées.</p>
  <div class="bar-s"><select [(ngModel)]="ent" (ngModelChange)="load()"><option value="">Tout</option><option value="order">Commandes et paiements</option><option value="expense">Dépenses</option><option value="service">Catalogue</option></select>
    <input type="search" [(ngModel)]="q" (keyup.enter)="load()" placeholder="Rechercher (n° de commande, motif…)"><button class="chip p" (click)="load()">Rechercher</button><button class="chip" (click)="exportCsv()">Exporter en CSV</button></div>
  <div class="card scroll"><table><tr><th>Date</th><th>Acteur</th><th>Action</th><th>Commande</th><th>Détail</th></tr>
    @for (e of rows; track e.id) {<tr><td>{{dt(e.at)}}</td><td>{{e.actor}}</td><td><b>{{e.action}}</b></td><td>{{e.code}}</td><td>{{e.detail}}</td></tr>}</table>
    @if (!rows.length) {<p>Aucune entrée.</p>}</div>`
})
export class JournalComponent implements OnInit {
  api = inject(ApiService); dt = dt; rows: any[] = []; ent = ''; q = '';
  ngOnInit() { this.load(); }
  async load() { const r = await this.api.a('GET', `journal?entity=${encodeURIComponent(this.ent)}&q=${encodeURIComponent(this.q)}&limit=300`); if (r.ok) this.rows = r.data; }
  exportCsv() { download('journal.csv', csv([['Date', 'Acteur', 'Action', 'Commande', 'Détail'], ...this.rows.map(e => [dt(e.at), e.actor, e.action, e.code ?? '', e.detail])])); }
}
