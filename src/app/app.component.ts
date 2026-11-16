import { Component, HostListener, inject } from '@angular/core';
import { BgIconsComponent } from './core/bg-icons.component';
import { InstallService } from './core/install.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
@Component({
  selector: 'app-root', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive, BgIconsComponent],
  template: `
  <app-bg-icons/><div class="prog" [style.width.%]="p"></div>
  <header><div class="wrap bar">
    <a routerLink="/" class="logo" (click)="open=false"><img src="assets/logo-wordmark.png" height="34" alt="Creaflow : création, impression, personnalisation" style="width:auto;display:block"></a>
    <button class="burger" (click)="toggle()" [attr.aria-expanded]="open" [attr.aria-label]="open ? 'Fermer le menu' : 'Ouvrir le menu'">{{open ? '✕ Fermer' : '☰ Menu'}}</button>
    <nav [class.open]="open" (click)="close()">
      <button class="nclose" type="button" (click)="close()" aria-label="Fermer le menu">✕ Fermer le menu</button>
      <a routerLink="/services" routerLinkActive="on">Services</a>
      <a routerLink="/realisations" routerLinkActive="on">Réalisations</a>
      <a routerLink="/a-propos" routerLinkActive="on">À propos</a>
      <a routerLink="/faq" routerLinkActive="on">FAQ</a>
      <a routerLink="/contact" routerLinkActive="on">Contact</a>
      <a routerLink="/mes-commandes" routerLinkActive="on">Mes commandes</a>
      <a routerLink="/commander" class="btn">Commander</a>
      @if (inst.visible()) {<button class="inst" type="button" (click)="inst.install()">Installer l’application</button>}
    </nav></div></header>
  @if (open) {<div class="bd" (click)="close()"></div>}
  <main><router-outlet/></main>
  <footer><div class="wrap fg">
    <div><img src="assets/logo-wordmark.png" height="30" alt="Creaflow" style="width:auto;display:block;filter:brightness(0) invert(1);margin-bottom:.8rem"><p>L’idée devient création, la création devient impact.</p><p>Calavi-Agualand, Bénin<br>{{mail}}</p></div>
    <div><strong>Services</strong><a routerLink="/services">Impression</a><a routerLink="/services">Démarches et informatique</a><a routerLink="/services">Graphisme et sérigraphie</a></div>
    <div><strong>Entreprise</strong><a routerLink="/a-propos">À propos</a><a routerLink="/realisations">Réalisations</a><a routerLink="/mes-commandes">Mes commandes</a><a routerLink="/faq">FAQ</a>@if (inst.visible()) {<a href="#" (click)="inst.install(); $event.preventDefault()">Installer l’application</a>}</div>
    <div><strong>Légal</strong><a routerLink="/mentions-legales">Mentions légales</a><a routerLink="/confidentialite">Confidentialité</a></div>
  </div><div class="wrap copy">© {{y}} Creaflow. Tous droits réservés.</div></footer>
  @if (inst.help) {<div class="hov" (click)="inst.help=false"></div><div class="hm" role="dialog" aria-modal="true" aria-label="Installer l’application"><button class="hx" type="button" (click)="inst.help=false" aria-label="Fermer">✕</button>
    <h3>Installer Creaflow sur votre téléphone</h3><ol>@for (t of inst.steps(); track t) {<li>{{t}}</li>}</ol><button class="btn" type="button" (click)="inst.help=false">Compris</button></div>}
  <a class="wa" [href]="'https://wa.me/'+wa" target="_blank" rel="noopener" aria-label="Écrire sur WhatsApp"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M21 12a9 9 0 0 1-13.4 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg><span>WhatsApp</span></a>`,
  styles: [`
  .prog{position:fixed;top:0;left:0;height:3px;background:var(--g);z-index:50}main{position:relative;z-index:1}
  header{position:sticky;top:0;z-index:30;background:#f5f7fbcc;backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
  .bar{display:flex;justify-content:space-between;align-items:center;padding-top:.7rem;padding-bottom:.7rem}
  .logo{display:flex;align-items:center;gap:.65rem;font-weight:800;font-size:1.5rem;color:var(--red);text-decoration:none;line-height:1}.logo small{display:block;font-size:.62rem;color:var(--mut);font-weight:600;letter-spacing:.02em;margin-top:.2rem}
  nav{display:flex;gap:1.4rem;align-items:center}nav a:not(.btn){text-decoration:none;font-weight:600;color:var(--navy);transition:color .2s}nav a.on,nav a:not(.btn):hover{color:var(--red)}nav .btn{padding:.6rem 1.3rem}
  .burger{display:none;border:1.5px solid var(--line);background:#fff;border-radius:99px;padding:.5rem 1rem;font:600 .9rem inherit}
  .nclose,.bd{display:none}.inst{border:1.5px solid var(--line);background:#fff;color:var(--navy);border-radius:99px;padding:.55rem 1.1rem;font:600 .95rem 'Plus Jakarta Sans',system-ui,sans-serif;cursor:pointer}
  @media(max-width:860px){.burger{display:block}nav{display:none;position:absolute;left:0;right:0;top:100%;flex-direction:column;align-items:stretch;gap:.9rem;background:#fff;padding:1.2rem;border-bottom:1px solid var(--line);box-shadow:0 20px 40px #0b1b3a22;max-height:calc(100vh - 70px);overflow:auto}nav.open{display:flex}nav a:not(.btn){padding:.4rem 0;font-size:1.1rem}nav .btn{text-align:center}
    nav.open .nclose{display:block;align-self:flex-end;border:0;background:#eef2fa;color:var(--navy);border-radius:99px;padding:.5rem 1rem;font:700 .95rem 'Plus Jakarta Sans',system-ui,sans-serif;cursor:pointer}.bd{display:block;position:fixed;inset:0;background:#0b1b3a66;z-index:25}}
  .hov{position:fixed;inset:0;background:#0b1b3a99;z-index:90}.hm{position:fixed;z-index:91;left:50%;top:50%;transform:translate(-50%,-50%);width:min(440px,92vw);max-height:90vh;overflow:auto;background:#fff;border-radius:20px;padding:1.6rem}.hm h3{margin:0 2rem .8rem 0}.hm ol{padding-left:1.2rem;color:var(--ink)}.hm li{margin:.5rem 0}.hx{position:absolute;top:.8rem;right:.8rem;border:0;background:#eef2fa;border-radius:50%;width:40px;height:40px;font-size:1.2rem;cursor:pointer}
  @media(max-width:700px){.wa span{display:none}.wa{width:54px;height:54px;padding:0;justify-content:center}}
  footer{background:var(--navy);color:#cfd6e8;padding:4rem 0 1.5rem}.fg{display:grid;gap:2rem;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
  footer p{color:#aab4cf}footer a{display:block;color:#cfd6e8;text-decoration:none;margin:.4rem 0}footer a:hover{color:#fff}footer strong{color:#fff;display:block;margin-bottom:.6rem}.fl{font-size:1.4rem}
  .copy{margin-top:2.5rem;padding-top:1.2rem;border-top:1px solid #ffffff22;font-size:.85rem}
  .wa{display:flex;align-items:center;gap:.5rem;position:fixed;right:1rem;bottom:1rem;background:#1fa855;color:#fff;padding:.85rem 1.2rem;border-radius:99px;font-weight:600;text-decoration:none;box-shadow:0 6px 20px #0005;z-index:40;animation:float 3.5s ease-in-out infinite}`]
})
export class AppComponent {
  inst = inject(InstallService);
  toggle() { this.open = !this.open; this.lock(); }
  close() { this.open = false; this.lock(); }
  private lock() { if (typeof document !== 'undefined') document.body.classList.toggle('menu-open', this.open); }
  @HostListener('document:keydown.escape') esc() { this.close(); this.inst.help = false; }
  @HostListener('window:beforeinstallprompt', ['$event']) onBip(e: Event) { e.preventDefault(); this.inst.evt = e; }
  @HostListener('window:appinstalled') onInstalled() { this.inst.installed = true; this.inst.evt = null; }
  p = 0;
  @HostListener('window:scroll') onScroll() { if (typeof document === 'undefined') return; const d = document.documentElement; this.p = d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight) * 100; }
  open = false; wa = environment.whatsapp; mail = environment.email; y = new Date().getFullYear(); }