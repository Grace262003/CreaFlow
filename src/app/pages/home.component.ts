import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { POLES, Service, fcfa } from '../core/data';
import { ApiService } from '../core/api.service';
import { CountDirective } from '../core/count.directive';
import { IconComponent } from '../core/icon.component';
import { RevealDirective } from '../core/reveal.directive';
import { seo } from '../core/seo';
@Component({
  selector: 'app-home', standalone: true, imports: [RouterLink, RevealDirective, CountDirective, IconComponent],
  template: `
  <section class="hero"><div class="wrap hg">
    <div>
      @for (x of [words[w]]; track x) {<span class="chip p sw">Calavi-Agualand · {{x}}</span>}
      <h1 style="margin-top:1rem">L’idée devient création. La création devient impact.</h1>
      <p class="lead">Impression, démarches, logos, flyers, tee-shirts : un seul atelier pour concevoir, imprimer et livrer. Commandez en ligne, payez par Mobile Money, suivez chaque étape.</p>
      <a routerLink="/commander" class="btn">Commander maintenant</a>
      <a routerLink="/services" class="btn ghost" style="margin-left:.6rem">Découvrir les services</a>
    </div>
    <div class="mock" aria-hidden="true">
      <div class="win"><div class="dots"><i></i><i></i><i></i><span>creaflow.bj/commander</span></div>
        <b>Flyers A5 × 500</b><div class="bar"><u style="--w:92%"></u></div><small>Fichiers reçus · mise en page validée</small>
        <div class="bar"><u style="--w:64%;animation-delay:.4s"></u></div><small>Impression en cours</small></div>
      <div class="fl f1"><span class="ok">✓</span> Paiement Mobile Money reçu</div>
      <div class="fl f2">CF-2026-0042 · <b>prête</b></div>
      <div class="fl f3">Reçu-CF-2026-0042.pdf</div>
    </div>
  </div></section>
  <div class="mq" aria-hidden="true"><div>@for (t of tags.concat(tags); track $index) {<span>{{t}}</span>}</div></div>

  <section class="trust"><div class="wrap grid4">
    @for (t of trust; track t[1]; let i = $index) {<div class="tr" reveal [style.--d]="i*.08+'s'"><span class="ti"><app-icon [name]="t[0]"/></span><div><b>{{t[1]}}</b><small>{{t[2]}}</small></div></div>}
  </div></section>

  <section><div class="wrap">
    <div reveal><h2>Trois pôles, un seul interlocuteur</h2><p class="sub2">Du document du quotidien à l’identité visuelle complète : choisissez un service, nous nous occupons du reste.</p></div>
    <div class="grid" style="margin-top:2rem">
    @for (p of poles; track p.id; let i = $index) {
      <article class="card hv pole" reveal [style.--d]="i*.12+'s'"><span class="pi"><app-icon [name]="p.icon" [size]="30"/></span><h3>{{p.title}}</h3><p>{{p.text}}</p>
        @for (s of byPole(p.id).slice(0,4); track s.id) {<span class="chip">{{s.name}}</span>}
        <p style="margin-top:1rem"><a routerLink="/services" style="color:var(--red);font-weight:600">Voir les services →</a></p></article>}
    </div></div></section>

  <section class="stats"><div class="wrap grid4">
    <div reveal><b><span [count]="3"></span></b><small>pôles de services</small></div>
    <div reveal style="--d:.1s"><b><span [count]="services()"></span>+</b><small>services à commander</small></div>
    <div reveal style="--d:.2s"><b><span [count]="3"></span></b><small>étapes pour commander</small></div>
    <div reveal style="--d:.3s"><b><span [count]="0"></span></b><small>compte à créer</small></div>
  </div></section>

  <section><div class="wrap">
    <div reveal><h2>Les services les plus demandés</h2><p class="sub2">Un clic sur « Commander » et le formulaire s’adapte à votre besoin.</p></div>
    <div class="grid" style="margin-top:2rem">
      @for (s of popular(); track s.id; let i = $index) {<article class="card hv sv" reveal [style.--d]="(i%3)*.1+'s'"><span class="si"><app-icon [name]="ic(s)"/></span><h3>{{s.name}}</h3><p>{{s.hint}}</p>
        <div class="foot"><span class="chip p">{{s.price ? 'dès ' + f(s.price) : 'Sur devis'}}</span><a class="go" routerLink="/commander" [queryParams]="{service:s.id}">Commander →</a></div></article>}
    </div></div></section>

  <section class="who"><div class="wrap">
    <div reveal><h2>Pour qui travaillons-nous ?</h2><p class="sub2">Quel que soit votre projet, Creaflow l’imprime et le personnalise.</p></div>
    <div class="grid" style="margin-top:2rem">
      @for (a of audiences; track a.t; let i = $index) {<article class="card hv" reveal [style.--d]="i*.12+'s'"><span class="pi"><app-icon [name]="a.i" [size]="30"/></span><h3>{{a.t}}</h3><p>{{a.d}}</p>
        @for (x of a.items; track x) {<span class="chip">{{x}}</span>}</article>}
    </div></div></section>

  <section class="proc"><div class="wrap"><h2 reveal style="color:#fff">De l’idée au colis, en quatre étapes</h2>
    <div class="steps">@for (s of steps; track s.t; let i = $index) {
      <div reveal [style.--d]="i*.15+'s'"><span class="n"><app-icon [name]="s.i" [size]="24"/></span><h3>{{i+1}}. {{s.t}}</h3><p>{{s.d}}</p></div>}</div></div></section>

  <section><div class="wrap">
    <div reveal><h2>Pourquoi choisir Creaflow ?</h2></div>
    <div class="grid" style="margin-top:2rem">
      @for (w of why; track w.t; let i = $index) {<article class="card hv" reveal [style.--d]="(i%3)*.1+'s'"><span class="si"><app-icon [name]="w.i"/></span><h3>{{w.t}}</h3><p>{{w.d}}</p></article>}
    </div></div></section>

  @if (gal.length) { <section style="padding-top:0"><div class="wrap">
    <div reveal style="display:flex;justify-content:space-between;align-items:end;flex-wrap:wrap;gap:1rem"><h2 style="margin:0">Nos dernières réalisations</h2><a routerLink="/realisations" class="btn ghost">Voir toute la galerie</a></div>
    <div class="shots">@for (g of gal; track g.id; let i = $index) {<figure reveal [style.--d]="i*.1+'s'"><img [src]="api.imgUrl(g.path)" [alt]="g.title || 'Réalisation Creaflow'" loading="lazy"><figcaption>{{g.title}}</figcaption></figure>}</div></div></section> }

  <section style="padding-top:0"><div class="wrap">
    <div reveal><h2>Vos questions, nos réponses</h2></div>
    <div class="qa">@for (q of faq; track q[0]; let i = $index) {<details class="card" reveal [style.--d]="i*.08+'s'"><summary>{{q[0]}}</summary><p>{{q[1]}}</p></details>}</div>
    <p style="margin-top:1rem"><a routerLink="/faq" style="color:var(--red);font-weight:600">Toutes les questions →</a></p></div></section>

  <section style="padding-top:0"><div class="wrap cta" reveal><div><h2 style="color:#fff">Un projet ? Lançons-le cette semaine.</h2><p>Décrivez votre besoin, nous revenons vers vous avec un prix.</p></div>
    <div><a routerLink="/commander" class="btn" style="background:#fff;color:var(--red);box-shadow:none">Commander</a> <a class="btn ghost" [href]="'https://wa.me/'+wa" target="_blank" rel="noopener">WhatsApp</a></div></div></section>`,
  styles: [`
  .sw{animation:up .5s both}
  .hero{position:relative;overflow:hidden;padding:5rem 0 4rem;background:radial-gradient(60% 50% at 85% 10%,#f26a2128,transparent),radial-gradient(50% 50% at 5% 0,#d81e3e1f,transparent),linear-gradient(#0b1b3a0a 1px,transparent 1px) 0 0/100% 48px}
  .hg{display:grid;gap:3rem;grid-template-columns:1.1fr .9fr;align-items:center}@media(max-width:900px){.hg{grid-template-columns:1fr}}
  .lead{font-size:1.15rem;max-width:50ch;margin:1.2rem 0 2rem}.sub2{max-width:58ch}
  .mock{position:relative;min-height:340px}.win{background:#fff;border:1px solid var(--line);border-radius:20px;padding:1.2rem;box-shadow:0 30px 60px #0b1b3a26;animation:float 6s ease-in-out infinite}
  .dots{display:flex;gap:.35rem;align-items:center;margin-bottom:1rem}.dots i{width:10px;height:10px;border-radius:50%;background:#e3e8f2}.dots span{margin-left:.6rem;font-size:.8rem;color:var(--mut)}
  .bar{height:10px;background:#eef2fa;border-radius:99px;margin:.7rem 0 .3rem;overflow:hidden}.bar u{display:block;height:100%;width:var(--w);background:var(--g);border-radius:99px;animation:grow 1.8s .6s both cubic-bezier(.2,.8,.2,1)}small{color:var(--mut)}
  .fl{position:absolute;background:#fff;border:1px solid var(--line);border-radius:14px;padding:.7rem 1rem;font-weight:600;font-size:.9rem;box-shadow:0 14px 30px #0b1b3a22;animation:float 5s ease-in-out infinite}
  .f1{right:-4%;top:-8%;animation-delay:.5s}.f2{left:-4%;bottom:6%;animation-delay:1.2s}.f3{right:4%;bottom:-8%;animation-delay:2s;background:var(--navy);color:#fff;border:0}.ok{color:#1fa855}
  .mq{overflow:hidden;background:var(--navy);padding:.9rem 0}.mq div{display:flex;gap:2.5rem;width:max-content;animation:marquee 32s linear infinite}.mq span{color:#cfd6e8;font-weight:600;white-space:nowrap}
  .trust{padding:2.5rem 0}.grid4{display:grid;gap:1.2rem;grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}
  .tr{display:flex;gap:.9rem;align-items:center}.tr small{display:block}.ti,.pi,.si{display:grid;place-items:center;flex:none;color:#fff;background:var(--g)}.ti{width:46px;height:46px;border-radius:14px}
  .pi{width:58px;height:58px;border-radius:18px;margin-bottom:1rem}.si{width:50px;height:50px;border-radius:14px;margin-bottom:1rem;transition:transform .5s cubic-bezier(.3,1.6,.5,1)}.card:hover .si,.card:hover .pi{transform:rotate(-10deg) scale(1.1)}
  .stats{background:linear-gradient(135deg,#0b1b3a,#16294f);padding:3.5rem 0}.stats .grid4 div{text-align:center}.stats b{display:block;font-size:clamp(2.4rem,6vw,3.8rem);color:#fff;letter-spacing:-.03em;line-height:1}.stats small{color:#aab4cf;font-weight:600}
  .sv{display:flex;flex-direction:column}.sv p{flex:1}.foot{display:flex;justify-content:space-between;align-items:center;gap:.6rem;flex-wrap:wrap}.go{font-weight:700;color:var(--navy);text-decoration:none}.sv:hover .go{color:var(--red)}
  .who{background:linear-gradient(#fff0,#eef2fa)}
  .proc{background:var(--navy)}.steps{display:grid;gap:1.5rem;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-top:2.5rem}.steps h3{color:#fff}.steps p{color:#aab4cf}
  .n{display:grid;place-items:center;width:54px;height:54px;border-radius:50%;background:var(--g);color:#fff;margin-bottom:1rem;box-shadow:0 0 0 8px #ffffff14}
  .shots{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-top:1.5rem}.shots figure{margin:0;position:relative;border-radius:var(--r);overflow:hidden;aspect-ratio:4/3;background:#e3e8f2}.shots img{width:100%;height:100%;object-fit:cover;transition:transform .5s}.shots figure:hover img{transform:scale(1.07)}
  .shots figcaption{position:absolute;inset:auto 0 0;padding:1.4rem 1rem .7rem;color:#fff;font-weight:600;background:linear-gradient(transparent,#0b1b3acc)}
  .qa{display:grid;gap:.8rem;margin-top:1.5rem;max-width:820px}details{padding:1.1rem 1.4rem}summary{cursor:pointer;font-weight:700;color:var(--navy);list-style:none}summary::after{content:'+';float:right;font-size:1.4rem;line-height:1;transition:transform .3s}details[open] summary::after{transform:rotate(45deg)}details p{margin:.8rem 0 0}
  .cta{display:flex;gap:2rem;justify-content:space-between;align-items:center;flex-wrap:wrap;background:var(--g);border-radius:28px;padding:3rem}.cta p{color:#ffe9e0}`]
})
export class HomeComponent implements OnInit, OnDestroy {
  api = inject(ApiService); poles = POLES.map(p => ({ ...p, icon: ({ impression: 'printer', informatique: 'file', graphisme: 'palette' } as Record<string, string>)[p.id] })); f = fcfa; wa = environment.whatsapp; cat: Service[] = []; gal: any[] = [];
  w = 0; words = ['Impression', 'Flyers', 'Tee-shirts', 'Logos', 'Démarches', 'Bâches'];
  t: any = isPlatformBrowser(inject(PLATFORM_ID)) ? setInterval(() => this.w = (this.w + 1) % this.words.length, 2200) : null;
  tags = ['Photocopie', 'Impression', 'Reliure', 'Logo', 'Flyers', 'Cartes de visite', 'Tee-shirts', 'Casquettes', 'Bâches', 'Roll-up', 'Badges', 'Passeport', 'CV', 'Registre de commerce'];
  trust = [['clock', 'Commande 24 h/24', 'Depuis votre téléphone, sans compte'], ['card', 'Paiement Mobile Money', 'MTN et Moov, en ligne ou à la remise'], ['search', 'Suivi en direct', 'L’état de votre commande à tout moment'], ['file', 'Reçu PDF', 'Envoyé par e-mail à chaque paiement']];
  audiences = [
    { i: 'users', t: 'Particuliers et étudiants', d: 'Documents, CV, démarches et photos : on s’occupe du papier pour que vous gardiez du temps.', items: ['CV', 'Impression', 'Reliure', 'Photo d’identité', 'Démarches'] },
    { i: 'building', t: 'Entreprises et commerces', d: 'Une image soignée : logo, cartes de visite, flyers, bâches et tenues de vos équipes.', items: ['Logo', 'Cartes de visite', 'Flyers', 'Bâches', 'Tee-shirts'] },
    { i: 'heart', t: 'Églises, associations et événements', d: 'Tee-shirts, banderoles, badges, faire-part et cartes d’invitation pour vos grands rendez-vous.', items: ['Banderoles', 'Badges', 'Faire-part', 'Invitations', 'Casquettes'] }];
  steps = [{ i: 'pointer', t: 'Commande', d: 'Choisissez le service : le formulaire s’adapte et vous envoyez vos fichiers.' }, { i: 'pencil', t: 'Conception', d: 'Mise en page et création si besoin, validées avec vous.' }, { i: 'printer', t: 'Impression', d: 'Production avec suivi de l’avancement en ligne.' }, { i: 'truck', t: 'Livraison', d: 'Retrait à Calavi-Agualand ou livraison, reçu PDF à l’appui.' }];
  why = [{ i: 'layers', t: 'Tout sous le même toit', d: 'Impression, démarches, graphisme et sérigraphie : un seul interlocuteur pour tout.' }, { i: 'pointer', t: 'Commande sur mesure', d: 'Chaque service a son propre formulaire : vous ne répondez qu’aux questions utiles.' },
    { i: 'card', t: 'Paiement simple', d: 'Réglez par Mobile Money en ligne, ou à la remise de votre commande.' }, { i: 'search', t: 'Suivi de A à Z', d: 'Avec votre numéro de commande, vous voyez l’avancement à tout moment.' },
    { i: 'file', t: 'Reçus clairs', d: 'Chaque paiement donne un reçu PDF numéroté, envoyé par e-mail.' }, { i: 'phone', t: 'Joignable facilement', d: 'WhatsApp, téléphone ou e-mail : nous répondons à vos questions.' }];
  faq = [['Dois-je créer un compte ?', 'Non. Vous commandez avec votre nom et votre téléphone, puis vous suivez la commande avec son numéro.'], ['Comment payer ?', 'Par Mobile Money en ligne pour les services au prix affiché, ou à la remise de la commande.'], ['Et si je n’ai pas de visuel ?', 'Choisissez « Je veux que Creaflow le crée » : nous concevons votre flyer, logo ou affiche.']];
  constructor() { seo('Creaflow | Impression, graphisme et sérigraphie à Calavi-Agualand', 'Photocopie, impression, démarches, logos, flyers, tee-shirts. Commandez en ligne à Calavi-Agualand, payez par Mobile Money et suivez votre commande.', { path: '/', graph: [{ '@type': 'WebSite', name: 'Creaflow', url: environment.siteUrl + '/' }, { '@type': 'Organization', name: 'Creaflow', url: environment.siteUrl + '/', logo: environment.siteUrl + '/assets/logo-512.png', email: environment.email, telephone: environment.phone }] }); }
  async ngOnInit() { this.cat = await this.api.catalog(); this.gal = (await this.api.gallery()).slice(0, 4); }
  ngOnDestroy() { if (this.t) clearInterval(this.t); }
  byPole = (id: string) => this.cat.filter(s => s.pole === id);
  services = () => this.cat.length || 12;
  popular = () => { const names = ['Flyers', 'Logo', 'Tee-shirts', 'Impression', 'CV', 'Démarches']; const out: Service[] = []; for (const n of names) { const s = this.cat.find(x => x.name.startsWith(n) && !out.includes(x)); if (s) out.push(s); } return out.length ? out : this.cat.slice(0, 6); };
  ic(s: Service) { const n = s.name.toLowerCase(); const m: [RegExp, string][] = [[/photocopie|impression/, 'printer'], [/reliure/, 'book'], [/saisie|cv|lettre/, 'file'], [/démarche|passeport|registre/, 'stamp'], [/photo/, 'image'], [/logo/, 'palette'], [/flyer|carte|affiche/, 'layers'], [/bâche|roll|banderole/, 'image'], [/tee|casquette|polo|sac/, 'shirt'], [/badge|porte|cachet|autocollant/, 'tag']]; return m.find(([r]) => r.test(n))?.[1] ?? 'file'; }
}
