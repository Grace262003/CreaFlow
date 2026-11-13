import { Component, HostListener } from '@angular/core';
import { BgIconsComponent } from './core/bg-icons.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
@Component({
  selector: 'app-root', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive, BgIconsComponent],
  template: `
  <app-bg-icons/><div class="prog" [style.width.%]="p"></div>
  <header><div class="wrap bar">
    <a routerLink="/" class="logo" (click)="open=false"><img src="assets/logo-wordmark.png" height="34" alt="Creaflow : création, impression, personnalisation" style="width:auto;display:block"></a>
    <button class="burger" (click)="open=!open" [attr.aria-expanded]="open" aria-label="Menu">Menu</button>
    <nav [class.open]="open" (click)="open=false">
      <a routerLink="/services" routerLinkActive="on">Services</a>
      <a routerLink="/realisations" routerLinkActive="on">Réalisations</a>
      <a routerLink="/a-propos" routerLinkActive="on">À propos</a>
      <a routerLink="/faq" routerLinkActive="on">FAQ</a>
      <a routerLink="/contact" routerLinkActive="on">Contact</a>
      <a routerLink="/mes-commandes" routerLinkActive="on">Mes commandes</a>
      <a routerLink="/commander" class="btn">Commander</a>
    </nav></div></header>
  <main><router-outlet/></main>
  <footer><div class="wrap fg">
    <div><img src="assets/logo-wordmark.png" height="30" alt="Creaflow" style="width:auto;display:block;filter:brightness(0) invert(1);margin-bottom:.8rem"><p>L’idée devient création, la création devient impact.</p><p>Calavi-Agualand, Bénin<br>{{mail}}</p></div>
    <div><strong>Services</strong><a routerLink="/services">Impression</a><a routerLink="/services">Démarches et informatique</a><a routerLink="/services">Graphisme et sérigraphie</a></div>
    <div><strong>Entreprise</strong><a routerLink="/a-propos">À propos</a><a routerLink="/realisations">Réalisations</a><a routerLink="/mes-commandes">Mes commandes</a><a routerLink="/faq">FAQ</a></div>
    <div><strong>Légal</strong><a routerLink="/mentions-legales">Mentions légales</a><a routerLink="/confidentialite">Confidentialité</a></div>
  </div><div class="wrap copy">© {{y}} Creaflow. Tous droits réservés.</div></footer>
  <a class="wa" [href]="'https://wa.me/'+wa" target="_blank" rel="noopener" aria-label="Écrire sur WhatsApp"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M21 12a9 9 0 0 1-13.4 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg><span>WhatsApp</span></a>`,
  styles: [`
  .prog{position:fixed;top:0;left:0;height:3px;background:var(--g);z-index:50}main{position:relative;z-index:1}
  header{position:sticky;top:0;z-index:30;background:#f5f7fbcc;backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
  .bar{display:flex;justify-content:space-between;align-items:center;padding-top:.7rem;padding-bottom:.7rem}
  .logo{display:flex;align-items:center;gap:.65rem;font-weight:800;font-size:1.5rem;color:var(--red);text-decoration:none;line-height:1}.logo small{display:block;font-size:.62rem;color:var(--mut);font-weight:600;letter-spacing:.02em;margin-top:.2rem}
  nav{display:flex;gap:1.4rem;align-items:center}nav a:not(.btn){text-decoration:none;font-weight:600;color:var(--navy);transition:color .2s}nav a.on,nav a:not(.btn):hover{color:var(--red)}nav .btn{padding:.6rem 1.3rem}
  .burger{display:none;border:1.5px solid var(--line);background:#fff;border-radius:99px;padding:.5rem 1rem;font:600 .9rem inherit}
  @media(max-width:860px){.burger{display:block}nav{display:none;position:absolute;left:0;right:0;top:100%;flex-direction:column;background:#fff;padding:1.2rem;border-bottom:1px solid var(--line)}nav.open{display:flex}}
  @media(max-width:700px){.wa span{display:none}.wa{width:54px;height:54px;padding:0;justify-content:center}}
  footer{background:var(--navy);color:#cfd6e8;padding:4rem 0 1.5rem}.fg{display:grid;gap:2rem;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
  footer p{color:#aab4cf}footer a{display:block;color:#cfd6e8;text-decoration:none;margin:.4rem 0}footer a:hover{color:#fff}footer strong{color:#fff;display:block;margin-bottom:.6rem}.fl{font-size:1.4rem}
  .copy{margin-top:2.5rem;padding-top:1.2rem;border-top:1px solid #ffffff22;font-size:.85rem}
  .wa{display:flex;align-items:center;gap:.5rem;position:fixed;right:1rem;bottom:1rem;background:#1fa855;color:#fff;padding:.85rem 1.2rem;border-radius:99px;font-weight:600;text-decoration:none;box-shadow:0 6px 20px #0005;z-index:40;animation:float 3.5s ease-in-out infinite}`]
})
export class AppComponent {
  p = 0;
  @HostListener('window:scroll') onScroll() { if (typeof document === 'undefined') return; const d = document.documentElement; this.p = d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight) * 100; }
  open = false; wa = environment.whatsapp; mail = environment.email; y = new Date().getFullYear(); }