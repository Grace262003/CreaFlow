import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { RevealDirective } from '../core/reveal.directive';
import { seo } from '../core/seo';
@Component({
  selector: 'app-gallery', standalone: true, imports: [RevealDirective, RouterLink],
  template: `<section><div class="wrap"><h1>Nos réalisations</h1><p>Des projets réels, imprimés et livrés par Creaflow.</p>
  <div>@for (c of cats(); track c) {<button class="chip" [class.p]="c===sel" (click)="sel=c">{{c}}</button>}</div>
  @if (!shown().length) { <div class="card" style="margin-top:1.5rem"><p>Les réalisations arrivent bientôt. En attendant, <a routerLink="/commander" style="color:var(--red);font-weight:600">lancez la vôtre</a>.</p></div> }
  <div class="mas">@for (g of shown(); track g.id; let i = $index) {
    <figure reveal [style.--d]="(i%4)*.08+'s'" (click)="big=g" tabindex="0" (keydown.enter)="big=g"><img [src]="sb.imgUrl(g.path)" [alt]="g.title" loading="lazy"><figcaption>{{g.title}}</figcaption></figure>}</div></div></section>
  @if (big) { <div class="lb" (click)="big=null" role="dialog" aria-label="Aperçu"><button class="x" (click)="big=null" aria-label="Fermer">×</button><img [src]="sb.imgUrl(big.path)" [alt]="big.title"></div> }`,
  styles: [`button.chip{border:0;cursor:pointer;font:inherit;font-weight:600}.mas{columns:3 260px;gap:1rem;margin-top:1.5rem}
  figure{margin:0 0 1rem;break-inside:avoid;position:relative;border-radius:var(--r);overflow:hidden;cursor:zoom-in}figure img{width:100%;display:block;transition:transform .5s}figure:hover img{transform:scale(1.06)}
  figcaption{position:absolute;inset:auto 0 0;padding:1.5rem 1rem .8rem;color:#fff;font-weight:600;background:linear-gradient(transparent,#0b1b3acc)}
  .x{position:absolute;top:1rem;right:1.2rem;border:0;background:#fff;border-radius:50%;width:44px;height:44px;font-size:1.6rem;cursor:pointer}.lb{position:fixed;inset:0;z-index:60;background:#0b1b3aee;display:grid;place-items:center;padding:1rem;cursor:zoom-out}.lb img{max-width:100%;max-height:92vh;border-radius:12px}`]
})
export class GalleryComponent implements OnInit {
  @HostListener('document:keydown.escape') esc() { this.big = null; }
  sb = inject(ApiService); rows: any[] = []; sel = 'Tout'; big: any = null;
  constructor() { seo('Réalisations', 'Découvrez les flyers, tee-shirts, bâches, logos et impressions réalisés par Creaflow à Calavi.', { path: '/realisations' }); }
  async ngOnInit() { this.rows = await this.sb.gallery(); }
  cats = () => ['Tout', ...new Set(this.rows.map(r => r.category).filter(Boolean))] as string[];
  shown = () => this.sel === 'Tout' ? this.rows : this.rows.filter(r => r.category === this.sel);
}
