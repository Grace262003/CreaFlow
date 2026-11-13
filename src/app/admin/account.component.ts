import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ToastService } from '../core/toast.service';
import { dd } from './util';
@Component({
  selector: 'app-account', standalone: true, imports: [FormsModule],
  template: `
  <div class="grid">
    <form class="card" (ngSubmit)="changePw()" novalidate><h3>Mon mot de passe</h3>
      <label for="cp">Mot de passe actuel</label><input id="cp" name="cp" type="password" [(ngModel)]="cur" autocomplete="current-password">
      <label for="np">Nouveau mot de passe (10 caractères minimum)</label><input id="np" name="np" type="password" [(ngModel)]="pw" autocomplete="new-password">
      <label for="np2">Confirmer</label><input id="np2" name="np2" type="password" [(ngModel)]="pw2" autocomplete="new-password"><br><br><button class="btn">Enregistrer</button></form>
    <form class="card" (ngSubmit)="add()" novalidate><h3>Ajouter une personne à l’équipe</h3>
      <p>Elle se connecte avec son propre e-mail et son mot de passe. Le journal indique qui a fait quoi. Tous les comptes ont les mêmes droits.</p>
      <label for="ne">E-mail</label><input id="ne" name="ne" type="email" [(ngModel)]="email" autocomplete="off">
      <label for="nm">Mot de passe provisoire (10 caractères minimum)</label><input id="nm" name="nm" type="text" [(ngModel)]="tmp" autocomplete="off"><br><br><button class="btn dark">Créer le compte</button></form>
  </div>
  <div class="card scroll" style="margin-top:1rem"><h3>Équipe</h3>
    <table><tr><th>E-mail</th><th>Créé le</th><th></th></tr>
      @for (u of users; track u.id) {<tr><td>{{u.email}} @if (u.email === me) {<span class="chip p">vous</span>}</td><td>{{dd(u.created_at)}}</td>
        <td><button class="chip" (click)="reset(u)">Nouveau mot de passe</button> @if (u.email !== me) {<button class="chip" (click)="del(u)">Supprimer</button>}</td></tr>}</table>
    @if (envAdmin) {<p><small>Un compte supplémentaire est défini par les variables Netlify (ADMIN_EMAIL).</small></p>}
  </div>`
})
export class AccountComponent implements OnInit {
  api = inject(ApiService); toast = inject(ToastService); dd = dd;
  users: any[] = []; me = ''; envAdmin = false; cur = ''; pw = ''; pw2 = ''; email = ''; tmp = '';
  ngOnInit() { this.load(); }
  async load() { const r = await this.api.a('GET', 'team'); if (r.ok) { this.users = r.data.users; this.me = r.data.me; this.envAdmin = r.data.env; } }
  async changePw() {
    if (this.pw !== this.pw2) { this.toast.show('Les deux mots de passe ne correspondent pas.'); return; }
    const r = await this.api.changePassword(this.cur, this.pw);
    if (r.ok) { this.toast.show('Mot de passe modifié.'); this.cur = this.pw = this.pw2 = ''; } else this.toast.show(r.data?.error ?? 'Modification impossible.');
  }
  async add() {
    const r = await this.api.a('POST', 'team', { email: this.email, password: this.tmp });
    if (r.ok) { this.toast.show(`Compte créé. Transmettez à ${this.email} son e-mail et son mot de passe provisoire.`); this.email = this.tmp = ''; this.load(); } else this.toast.show(r.data?.error ?? 'Création impossible.');
  }
  async reset(u: any) {
    const pw = window.prompt(`Nouveau mot de passe pour ${u.email} (10 caractères minimum) :`); if (!pw) return;
    const r = await this.api.a('POST', `team/${u.id}/password`, { password: pw });
    this.toast.show(r.ok ? 'Mot de passe réinitialisé.' : r.data?.error ?? 'Réinitialisation impossible.');
  }
  async del(u: any) {
    if (!confirm(`Supprimer le compte de ${u.email} ? Cette personne perdra l’accès immédiatement.`)) return;
    const r = await this.api.a('DELETE', `team/${u.id}`);
    if (r.ok) { this.toast.show('Compte supprimé.'); this.load(); } else this.toast.show(r.data?.error ?? 'Suppression impossible.');
  }
}
