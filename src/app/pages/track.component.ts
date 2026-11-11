import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/api.service';
import { STATUTS, fcfa } from '../core/data';
import { seo } from '../core/seo';
@Component({
  selector: 'app-track', standalone: true, imports: [FormsModule],
  template: `<section><div class="wrap" style="max-width:580px"><h1>Suivre ma commande</h1>
  @if (back) { <p class="card">Merci ! Votre paiement est en cours de confirmation. Saisissez votre téléphone pour voir l’état de la commande.</p> }
  <form (ngSubmit)="go()" class="card"><label for="c">Numéro de commande</label><input id="c" name="c" [(ngModel)]="code" placeholder="CF-2026-0001" required>
  <label for="p">Téléphone utilisé à la commande</label><input id="p" name="p" [(ngModel)]="phone" required><br><br><button class="btn" [disabled]="busy">{{busy ? 'Recherche…' : 'Voir l’état'}}</button></form>
  @if (res) { <div class="card" style="margin-top:1.5rem"><h3>{{res.service}}</h3><p>État : <span class="chip p">{{res.status}}</span></p>
    @if (res.total) { <p>Total {{f(res.total)}} · payé {{f(res.paid)}}</p> }
    <ol>@for (s of steps; track s) {<li [style.font-weight]="s===res.status?800:400">{{s}}</li>}</ol></div> }
  @if (nf) { <p style="color:var(--red)">Aucune commande ne correspond. Vérifiez le numéro et le téléphone.</p> }</div></section>`
})
export class TrackComponent {
  sb = inject(ApiService); f = fcfa; code = ''; phone = ''; res: any = null; nf = false; steps = STATUTS.slice(0, 5); back = false; busy = false;
  constructor(r: ActivatedRoute) { seo('Suivi de commande', 'Suivez l’état de votre commande Creaflow avec votre numéro et votre téléphone.', { path: '/suivi', noindex: true }); const c = r.snapshot.queryParamMap.get('code'); if (c) { this.code = c; this.back = !!r.snapshot.routeConfig?.path?.includes('paiement'); } }
  async go() { this.busy = true; const r = await this.sb.trackOrder(this.code.trim(), this.phone.trim()); this.busy = false; this.res = r.ok ? r.data : null; this.nf = !this.res; }
}
