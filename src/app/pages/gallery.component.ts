import { Component, HostListener, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { RevealDirective } from '../core/reveal.directive';
import { seo } from '../core/seo';
@Component({
  selector: 'app-gallery', standalone: true, imports: [RevealDirective, RouterLink],
  template: `<section><div class="wrap"><h1>Nos réalisations</h1><p class="lead">Des projets réels, imprimés et livrés par Creaflow. Filtrez par catégorie.</p>
  @if (cats.length) { <div class="chips" role="group" aria-label="Catégories">
    <button class="chip" [class.p]="sel==='Tout'" [attr.aria-pressed]="sel==='Tout'" (click)="pick('Tout')">Tout <b>{{rows.length}}</b></button>
    @for (c of cats; track c.name) {<button class="chip" [class.p]="sel===c.name" [attr.aria-pressed]="sel===c.name" (click)="pick(c.name)">{{c.name}} <b>{{c.n}}</b></button>}</div> }
  @if (!rows.length) { <div class="card" style="margin-top:1.5rem"><p>Les réalisations arrivent bientôt. En attendant, <a routerLink="/commander" style="color:var(--red);font-weight:600">lancez la vôtre</a>.</p></div> }
  <div class="gal">@for (g of shown(); track g.id; let i = $index) {
    <figure reveal [style.--d]="(i%4)*.06+'s'" (click)="open(i)" tabindex="0" role="button" (keydown.enter)="open(i)" [attr.aria-label]="'Agrandir : ' + (g.title || 'réalisation')">
      <img [src]="api.imgUrl(g.path)" [alt]="g.title || 'Réalisation Creaflow'" loading="lazy" decoding="async">
      @if (g.category) {<span class="cat">{{g.category}}</span>}
      @if (g.title) {<figcaption>{{g.title}}</figcaption>}</figure>}</div>
  </div></section>
  @if (big !== null && cur(); as g) { <div class="lb" (click)="close()" role="dialog" aria-modal="true" aria-label="Aperçu de la réalisation">
    <button class="x" (click)="close()" aria-label="Fermer">×</button>
    <button class="nv l" (click)="step(-1); $event.stopPropagation()" aria-label="Précédente">‹</button>
    <figure class="big" (click)="$event.stopPropagation()"><img [src]="api.imgUrl(g.path)" [alt]="g.title || 'Réalisation Creaflow'"><figcaption>{{g.title}}@if (g.category) { · <b>{{g.category}}</b>} <small>({{big! + 1}}/{{shown().length}})</small></figcaption></figure>
    <button class="nv r" (click)="step(1); $event.stopPropagation()" aria-label="Suivante">›</button></div> }`,
  styles: [`.lead{max-width:60ch}.chips{margin-top:1rem}button.chip{border:0;cursor:pointer;font:inherit;font-weight:600;margin:.2rem .3rem .2rem 0}button.chip b{margin-left:.3rem;opacity:.6;font-size:.8rem}
  .gal{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));margin-top:1.5rem}@media(max-width:600px){.gal{grid-template-columns:repeat(2,1fr);gap:.6rem}}
  figure{margin:0;position:relative;aspect-ratio:4/3;border-radius:18px;overflow:hidden;background:#e3e8f2;cursor:zoom-in}
  figure img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s}figure:hover img{transform:scale(1.06)}
  .cat{position:absolute;top:.7rem;left:.7rem;background:#ffffffee;color:var(--navy);padding:.2rem .7rem;border-radius:99px;font-size:.78rem;font-weight:700}
  figcaption{position:absolute;inset:auto 0 0;padding:1.6rem 1rem .8rem;color:#fff;font-weight:600;background:linear-gradient(transparent,#0b1b3acc)}
  .lb{position:fixed;inset:0;z-index:60;background:#0b1b3af0;display:flex;align-items:center;justify-content:center;gap:.5rem;padding:1rem;cursor:zoom-out}
  .lb .big{aspect-ratio:auto;background:none;cursor:default;max-width:min(1000px,80vw);overflow:visible;border-radius:0}.lb .big img{width:auto;height:auto;max-width:100%;max-height:80vh;border-radius:12px;object-fit:contain;transform:none!important}
  .lb figcaption{position:static;background:none;text-align:center;padding:.8rem 0 0}.lb small{opacity:.7;font-weight:400}
  .x{position:absolute;top:1rem;right:1.2rem;border:0;background:#fff;border-radius:50%;width:44px;height:44px;font-size:1.6rem;cursor:pointer}
  .nv{flex:none;border:0;background:#ffffffdd;border-radius:50%;width:48px;height:48px;font-size:2rem;line-height:1;cursor:pointer}@media(max-width:600px){.nv{width:38px;height:38px;font-size:1.5rem}.lb{gap:.2rem;padding:.5rem}}`]
})
export class GalleryComponent implements OnInit {
  api = inject(ApiService); route = inject(ActivatedRoute); rows: any[] = []; cats: { name: string; n: number }[] = []; sel = 'Tout'; big: number | null = null;
  constructor() { seo('Réalisations', 'Découvrez les flyers, tee-shirts, bâches, logos et impressions réalisés par Creaflow à Calavi.', { path: '/realisations' }); }
  async ngOnInit() {
    [this.rows, this.cats] = await Promise.all([this.api.gallery(), this.api.galleryCategories()]);
    const q = this.route.snapshot.queryParamMap.get('categorie'); if (q && this.cats.some(c => c.name === q)) this.sel = q;
  }
  shown = () => (this.sel === 'Tout' ? this.rows : this.rows.filter(r => r.category === this.sel));
  cur = () => (this.big === null ? null : this.shown()[this.big]);
  pick(c: string) { this.sel = c; this.big = null; }
  open(i: number) { this.big = i; }
  close() { this.big = null; }
  step(d: number) { const n = this.shown().length; if (n && this.big !== null) this.big = (this.big + d + n) % n; }
  @HostListener('document:keydown', ['$event']) key(e: KeyboardEvent) { if (this.big === null) return; if (e.key === 'Escape') this.close(); else if (e.key === 'ArrowLeft') this.step(-1); else if (e.key === 'ArrowRight') this.step(1); }
}