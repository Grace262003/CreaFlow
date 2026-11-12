import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { P } from '../core/bg-icons.component';
import { POLES, SERVICES, Service, fcfa } from '../core/data';
import { ApiService } from '../core/api.service';
import { RevealDirective } from '../core/reveal.directive';
import { seo, serviceLd } from '../core/seo';
@Component({
  selector: 'app-services', standalone: true, imports: [RouterLink, FormsModule, RevealDirective],
  template: `
  <section class="head"><div class="wrap">
    <h1>Tout ce qu’il faut pour que votre idée prenne forme</h1>
    <p class="lead">Impression, démarches, graphisme et sérigraphie. Choisissez un service, commandez en ligne et suivez chaque étape.</p>
    <div class="tools">
      <div class="tabs" role="tablist">
        <button role="tab" class="tab" [class.on]="sel==='all'" (click)="sel='all'">Tous <b>{{cat.length}}</b></button>
        @for (p of poles; track p.id) {<button role="tab" class="tab" [class.on]="sel===p.id" (click)="sel=p.id">{{p.short}} <b>{{count(p.id)}}</b></button>}
      </div>
      <input class="search" type="search" [(ngModel)]="q" name="q" placeholder="Rechercher : flyers, passeport, tee-shirt…" aria-label="Rechercher un service">
    </div>
  </div></section>

  <section class="list"><div class="wrap">
    @for (p of poles; track p.id) { @if ((sel==='all' || sel===p.id) && shown(p.id).length) {
      <div class="pole" reveal>
        <span class="pic"><svg viewBox="0 0 24 24"><path [attr.d]="icons[p.icon]" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <div><h2>{{p.title}}</h2><p>{{p.text}}</p></div></div>
      <div class="grid">
        @for (s of shown(p.id); track s.id; let i = $index) {
        <article class="card sv" reveal [style.--d]="(i%3)*.1+'s'">
          <span class="ic"><svg viewBox="0 0 24 24"><path [attr.d]="icons[ic(s)]" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          <h3>{{s.name}}</h3><p>{{s.hint}}</p>
          <div class="foot"><span class="chip p">{{s.price ? 'dès ' + f(s.price) + (s.unit ? ' / ' + s.unit : '') : 'Sur devis'}}</span>
            <a class="go" routerLink="/commander" [queryParams]="{service:s.id}" [attr.aria-label]="'Commander : ' + s.name">Commander <i>→</i></a></div>
        </article>}
      </div> } }
    @if (empty()) { <div class="card" reveal><h3>Aucun service ne correspond</h3><p>Dites-nous ce qu’il vous faut, nous vous répondons sur WhatsApp.</p>
      <a class="btn" [href]="'https://wa.me/'+wa" target="_blank" rel="noopener">Écrire à Creaflow</a></div> }
  </div></section>

  <section style="padding-top:0"><div class="wrap band" reveal>
    <div><h2>Un besoin particulier ?</h2><p>Un service qui n’est pas dans la liste ? Décrivez-le, nous vous proposons un devis.</p></div>
    <a class="btn" style="background:#fff;color:var(--red);box-shadow:none" [href]="'https://wa.me/'+wa" target="_blank" rel="noopener">Demander un devis</a></div></section>`,
  styles: [`
  .head{padding:4rem 0 1.5rem}.head h1{max-width:18ch}.lead{font-size:1.15rem;max-width:56ch;margin:1rem 0 2rem}
  .tools{display:flex;gap:1rem;flex-wrap:wrap;align-items:center;justify-content:space-between}
  .tabs{display:flex;gap:.5rem;flex-wrap:wrap}.tab{border:1.5px solid var(--line);background:#fff;border-radius:99px;padding:.55rem 1.1rem;font:600 .95rem 'Plus Jakarta Sans',system-ui,sans-serif;color:var(--navy);cursor:pointer;transition:all .25s}
  .tab b{margin-left:.4rem;font-size:.8rem;opacity:.6}.tab:hover{transform:translateY(-2px)}.tab.on{background:var(--navy);border-color:var(--navy);color:#fff}
  .search{max-width:340px;border-radius:99px;padding:.7rem 1.2rem}
  .list{padding-top:2rem}.pole{display:flex;gap:1.1rem;align-items:center;margin:3rem 0 1.2rem;padding:1.3rem 1.5rem;border-radius:var(--r);background:#fff;border:1px solid var(--line);border-left:6px solid var(--red)}
  .pole h2{font-size:1.6rem;margin:0 0 .2rem}.pole p{margin:0;max-width:70ch}
  .pic,.ic{display:grid;place-items:center;flex:none;color:#fff;background:var(--g)}.pic{width:56px;height:56px;border-radius:16px}.pic svg{width:30px}
  .sv{position:relative;overflow:hidden;display:flex;flex-direction:column}
  .sv::before{content:'';position:absolute;inset:-40% -30% auto auto;width:200px;height:200px;border-radius:50%;background:radial-gradient(#f26a2126,transparent 70%);transition:transform .6s}
  .sv:hover{transform:translateY(-8px);box-shadow:0 22px 44px #0b1b3a24}.sv:hover::before{transform:scale(2.2)}
  .ic{width:52px;height:52px;border-radius:14px;margin-bottom:1rem;transition:transform .5s cubic-bezier(.3,1.6,.5,1)}.ic svg{width:26px}.sv:hover .ic{transform:rotate(-10deg) scale(1.12)}
  .sv p{flex:1}.foot{display:flex;justify-content:space-between;align-items:center;gap:.6rem;flex-wrap:wrap}
  .go{font-weight:700;color:var(--navy);text-decoration:none}.go i{display:inline-block;font-style:normal;transition:transform .25s}.sv:hover .go{color:var(--red)}.sv:hover .go i{transform:translateX(6px)}
  .band{display:flex;gap:2rem;align-items:center;justify-content:space-between;flex-wrap:wrap;background:var(--navy);border-radius:28px;padding:2.5rem}.band h2{color:#fff;margin:0 0 .3rem}.band p{color:#aab4cf;margin:0}`]
})
export class ServicesComponent implements OnInit {
  sb = inject(ApiService); f = fcfa; wa = environment.whatsapp; icons = P; cat: Service[] = []; sel = 'all'; q = '';
  poles = POLES.map(p => ({ ...p, short: ({ impression: 'Impression', informatique: 'Démarches et informatique', graphisme: 'Graphisme et sérigraphie' } as Record<string, string>)[p.id], icon: ({ impression: 'printer', informatique: 'file', graphisme: 'palette' } as Record<string, string>)[p.id] }));
  constructor() { seo('Services d’impression, démarches et sérigraphie', 'Photocopie, impression, reliure, CV, démarches administratives, logos, flyers, tee-shirts et plus à Calavi-Agualand.', { path: '/services', graph: serviceLd(SERVICES.map(x => x.name)) }); }
  async ngOnInit() { this.cat = await this.sb.catalog(); }
  count = (id: string) => this.cat.filter(s => s.pole === id).length;
  shown = (id: string) => this.cat.filter(s => s.pole === id && (this.q.trim() === '' || (s.name + ' ' + s.hint).toLowerCase().includes(this.q.trim().toLowerCase())));
  empty = () => this.cat.length > 0 && this.poles.every(p => (this.sel !== 'all' && this.sel !== p.id) || !this.shown(p.id).length);
  ic(s: Service) {
    const n = s.name.toLowerCase();
    const m: [RegExp, string][] = [[/photocopie|impression/, 'printer'], [/reliure/, 'book'], [/saisie|cv|lettre/, 'file'], [/démarche|passeport|registre/, 'stamp'], [/photo/, 'image'], [/logo/, 'palette'], [/flyer|carte|affiche/, 'layers'], [/bâche|roll|banderole/, 'image'], [/tee|casquette|polo|sac/, 'shirt'], [/badge|porte|cachet|autocollant/, 'tag']];
    return m.find(([r]) => r.test(n))?.[1] ?? 'file';
  }
}