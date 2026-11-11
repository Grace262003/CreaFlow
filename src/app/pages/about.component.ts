import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { POLES } from '../core/data';
import { RevealDirective } from '../core/reveal.directive';
import { seo } from '../core/seo';
@Component({
  selector: 'app-about', standalone: true, imports: [RouterLink, RevealDirective],
  template: `<section><div class="wrap"><h1>À propos de Creaflow</h1>
  <p style="max-width:62ch;font-size:1.15rem" reveal>Creaflow réunit création, impression et personnalisation sous un même toit à Calavi-Agualand. Notre promesse : que votre idée devienne création, et que cette création devienne impact.</p>
  <div class="grid" style="margin-top:2rem">@for (p of poles; track p.id; let i = $index) {<div class="card hv" reveal [style.--d]="i*.12+'s'"><h3>{{p.title}}</h3><p>{{p.text}}</p></div>}</div>
  <div class="card" style="margin-top:2rem" reveal><h3>Conception · Impression · Livraison</h3><p>Une seule équipe suit votre projet de la première idée à la remise du colis. <a routerLink="/contact" style="color:var(--red);font-weight:600">Parlons de votre projet</a>.</p></div></div></section>`
})
export class AboutComponent { poles = POLES; constructor() { seo('À propos', 'Creaflow : création, impression et personnalisation à Calavi-Agualand. Découvrez notre atelier.', { path: '/a-propos' }); } }
