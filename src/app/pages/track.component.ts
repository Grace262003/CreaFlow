import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { ApiService } from '../core/api.service';
import { fcfa } from '../core/data';
import { OrdersStore, SavedOrder } from '../core/orders-store';
import { seo } from '../core/seo';
const FLOW = ['reçue', 'en cours', 'en production', 'prête', 'livrée'];
const MSG: Record<string, string> = { 'reçue': 'Nous avons bien reçu votre commande.', 'en cours': 'Votre commande est en cours de traitement.', 'en production': 'Votre commande est en production.', 'prête': 'Votre commande est prête : vous pouvez la récupérer ou attendre la livraison.', 'livrée': 'Commande livrée. Merci de votre confiance !', 'annulée': 'Cette commande a été annulée.' };
@Component({
  selector: 'app-track', standalone: true, imports: [FormsModule, RouterLink],
  template: `<section class="top"><div class="wrap">
    <h1>Mes commandes</h1><p class="lead">Retrouvez ici l’avancement de vos commandes. Elles sont gardées sur cet appareil : rouvrez simplement cette page.</p>
    @if (back) { <div class="card back"><b>Merci !</b> Votre paiement est en cours de confirmation @if (polling) {<span>(actualisation automatique…)</span>}</div> }
    @if (items.length) { <div class="bar-s"><button class="btn ghost" (click)="refresh()" [disabled]="loading">{{loading ? 'Actualisation…' : 'Actualiser'}}</button></div> }
    @for (it of items; track it.code) { <article class="card ord" [class.hl]="it.code===focus">
      @if (info(it.code); as d) {
        @if (d.notFound) { <div class="head"><div><h3>{{it.code}}</h3><small>Commande introuvable avec ce numéro de téléphone.</small></div><button class="chip" (click)="forget(it)">Retirer</button></div> }
        @else {
          <div class="head"><div><h3>{{it.code}}</h3><span>{{d.service}}</span></div><span class="st" [attr.data-s]="d.status">{{d.status}}</span></div>
          <p class="msg">{{msg[d.status]}}</p>
          @if (d.status !== 'annulée') { <ol class="flow">@for (s of flow; track s; let i = $index) {<li [class.on]="i <= idx(d.status)" [class.cur]="i === idx(d.status)"><i></i><span>{{s}}</span></li>}</ol> }
          @if (d.total != null) { <div class="amts"><div><small>Total</small><b>{{f(d.total)}}</b></div><div><small>Payé</small><b class="g">{{f(d.paid)}}</b></div><div><small>Reste à payer</small><b [class.r]="d.total > d.paid">{{f(max0(d.total - d.paid))}}</b></div></div> }
          @else { <p><small>Prix sur devis : nous vous contactons avec le montant.</small></p> }
          <div class="row">
            @if (d.total != null && d.total > d.paid && d.status !== 'annulée') {<button class="btn" (click)="pay(it, d)" [disabled]="paying===it.code">{{paying===it.code ? 'Redirection…' : 'Payer le reste en ligne'}}</button>}
            @if (d.receipt) {<a class="btn dark" [href]="d.receipt" target="_blank" rel="noopener">Télécharger mon reçu</a>}
            <a class="btn ghost" [href]="wa(it)" target="_blank" rel="noopener">Écrire à Creaflow</a>
            <button class="chip" (click)="forget(it)">Retirer de la liste</button></div>
          <small>Commande du {{date(d.created_at)}}</small>
        }
      } @else { <div class="head"><div><h3>{{it.code}}</h3><small>Chargement…</small></div></div> }
    </article> }
    @if (!items.length) { <div class="card empty"><h3>Aucune commande sur cet appareil</h3><p>Vos prochaines commandes apparaîtront ici automatiquement. Si vous avez déjà un numéro de commande, retrouvez-la ci-dessous.</p><a class="btn" routerLink="/commander">Passer une commande</a></div> }
    <form class="card find" (ngSubmit)="find()" novalidate><h3>Retrouver une commande</h3><p>Saisissez le numéro reçu à la commande et le téléphone utilisé.</p>
      <div class="two"><div><label for="c">Numéro de commande</label><input id="c" name="c" [(ngModel)]="code" placeholder="CF-2026-0001" autocomplete="off"></div>
        <div><label for="p">Téléphone</label><input id="p" name="p" type="tel" [(ngModel)]="phone" autocomplete="tel"></div></div>
      @if (err) {<p class="err">{{err}}</p>}<br><button class="btn dark" [disabled]="busy">{{busy ? 'Recherche…' : 'Ajouter à mes commandes'}}</button></form>
    <p class="note"><small>Les numéros de commande sont enregistrés uniquement sur cet appareil. Sur un téléphone partagé, utilisez « Retirer de la liste ».</small></p>
  </div></section>`,
  styles: [`
  .top{padding-top:3.5rem}.lead{font-size:1.1rem;max-width:60ch}.back{margin:1rem 0;background:#e5f7ee;border-color:#1fa85544}.ord,.find,.empty{margin-top:1rem;max-width:820px}
  .ord.hl{box-shadow:0 0 0 3px #f26a2144}.head{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem}.head h3{margin:0;font-size:1.3rem}.head span:not(.st){color:var(--mut)}
  .msg{margin:.8rem 0;color:var(--navy);font-weight:600}
  .flow{display:flex;list-style:none;padding:0;margin:1rem 0 1.2rem;gap:0}.flow li{flex:1;text-align:center;position:relative;font-size:.78rem;color:var(--mut)}
  .flow li::before{content:'';position:absolute;top:9px;left:-50%;width:100%;height:4px;background:#e3e8f2;z-index:0}.flow li:first-child::before{display:none}.flow li.on::before{background:var(--g)}
  .flow i{position:relative;z-index:1;display:block;width:22px;height:22px;margin:0 auto .4rem;border-radius:50%;background:#e3e8f2;border:3px solid #fff;box-shadow:0 0 0 1px #e3e8f2}.flow li.on i{background:var(--g);box-shadow:0 0 0 1px #d81e3e55}.flow li.cur{color:var(--navy);font-weight:700}.flow li.cur i{animation:pulse 1.6s infinite}
  @keyframes pulse{50%{box-shadow:0 0 0 7px #d81e3e22}}
  .amts{display:grid;gap:.6rem;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));margin:.4rem 0 1rem}.amts div{background:#f7f9fd;border-radius:12px;padding:.7rem 1rem}.amts small{display:block}.amts b{font-size:1.15rem;color:var(--navy)}.amts b.g{color:#1fa855}.amts b.r{color:var(--red)}
  .row{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center;margin-bottom:.6rem}.row .btn{padding:.7rem 1.2rem;font-size:.95rem}
  .two{display:grid;gap:.8rem;grid-template-columns:1fr 1fr}@media(max-width:600px){.two{grid-template-columns:1fr}.flow li{font-size:.68rem}}
  .err{color:var(--red);font-weight:600}.note{max-width:820px;margin-top:1rem}`]
})
export class TrackComponent implements OnInit, OnDestroy {
  api = inject(ApiService); store = inject(OrdersStore); f = fcfa; flow = FLOW; msg = MSG;
  items: SavedOrder[] = []; data: Record<string, any> = {}; loading = false; code = ''; phone = ''; err = ''; busy = false; paying = ''; focus = ''; back = false; polling = false; timer: any = null; tries = 0;
  constructor(r: ActivatedRoute) {
    seo('Mes commandes', 'Suivez l’avancement de vos commandes Creaflow.', { path: '/mes-commandes', noindex: true });
    const c = r.snapshot.queryParamMap.get('code'); if (c) { this.focus = c.toUpperCase(); this.code = this.focus; this.back = !!r.snapshot.routeConfig?.path?.includes('paiement'); }
  }
  async ngOnInit() {
    this.items = this.store.list(); await this.refresh();
    if (this.back && this.focus) { this.polling = true; this.timer = setInterval(async () => { this.tries++; await this.refresh(); const d = this.data[this.focus]; if (this.tries >= 8 || (d && d.total != null && d.paid >= d.total)) this.stopPoll(); }, 5000); }
  }
  ngOnDestroy() { this.stopPoll(); }
  stopPoll() { if (this.timer) clearInterval(this.timer); this.timer = null; this.polling = false; }
  info = (code: string) => this.data[code];
  idx = (s: string) => FLOW.indexOf(s);
  max0 = (n: number) => Math.max(0, n);
  date = (s: string) => new Date(s).toLocaleDateString('fr-FR');
  wa = (it: SavedOrder) => `https://wa.me/${environment.whatsapp}?text=${encodeURIComponent('Bonjour Creaflow, au sujet de ma commande ' + it.code)}`;
  async refresh() {
    if (!this.items.length) return; this.loading = true;
    const r = await this.api.req('POST', '/api/track-many', { items: this.items.map(i => ({ code: i.code, phone: i.phone })) });
    this.loading = false; if (r.ok && Array.isArray(r.data)) for (const x of r.data) this.data[x.code] = x;
  }
  async find() {
    this.err = ''; if (!this.code.trim() || this.phone.replace(/\D/g, '').length < 8) { this.err = 'Saisissez le numéro de commande et le téléphone utilisé.'; return; }
    this.busy = true; const r = await this.api.trackOrder(this.code.trim(), this.phone.trim()); this.busy = false;
    if (!r.ok) { this.err = r.status === 404 ? 'Aucune commande ne correspond. Vérifiez le numéro et le téléphone.' : 'Recherche impossible pour le moment.'; return; }
    this.store.save({ code: this.code.trim(), phone: this.phone.trim(), service: r.data.service, at: Date.now() }); this.items = this.store.list(); this.focus = this.code.trim().toUpperCase(); this.code = this.phone = ''; await this.refresh();
  }
  forget(it: SavedOrder) { this.store.remove(it.code); this.items = this.store.list(); }
  async pay(it: SavedOrder, d: any) {
    this.paying = it.code; const r = await this.api.pay(it.code, it.phone); this.paying = '';
    if (r.ok && r.data?.url) window.location.href = r.data.url; else this.err = r.data?.error ?? 'Le paiement en ligne est indisponible. Réglez à la remise ou écrivez-nous.';
  }
}