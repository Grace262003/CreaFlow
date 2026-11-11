import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { POLES } from '../core/data';
import { FORMS, FORM_IDS } from '../core/forms';
import { ToastService } from '../core/toast.service';
@Component({
  selector: 'app-content', standalone: true, imports: [FormsModule],
  template: `<div><button class="chip" [class.p]="tab==='c'" (click)="tab='c'">Catalogue et prix</button><button class="chip" [class.p]="tab==='g'" (click)="tab='g'">Galerie</button><button class="chip" [class.p]="tab==='m'" (click)="tab='m'">Messages @if (unread()) {({{unread()}})}</button></div>
  @if (tab==='c') { <div class="card scroll" style="margin-top:1rem"><table><tr><th>Pôle</th><th>Service</th><th>Description</th><th>Prix (FCFA)</th><th>Unité</th><th>Formulaire de commande</th><th>Actif</th><th></th></tr>
    @for (s of cat; track $index) {<tr><td><select [(ngModel)]="s.pole">@for (p of poles; track p.id) {<option [value]="p.id">{{p.id}}</option>}</select></td>
      <td><input [(ngModel)]="s.name"></td><td><input [(ngModel)]="s.hint"></td><td><input type="number" min="0" [(ngModel)]="s.price" placeholder="sur devis" style="width:110px"></td>
      <td><input [(ngModel)]="s.unit" style="width:90px"></td><td><select [(ngModel)]="s.form"><option [ngValue]="null">Automatique</option>@for (k of formIds; track k) {<option [value]="k">{{forms[k].title}}</option>}</select></td><td><input type="checkbox" [(ngModel)]="s.active" style="width:auto"></td>
      <td><button class="btn dark" (click)="saveS(s)">Enregistrer</button> <button class="chip" (click)="delS(s)">Supprimer</button></td></tr>}</table>
    <br><button class="btn" (click)="addS()">Ajouter un service</button></div> }
  @if (tab==='g') { <div class="card" style="margin-top:1rem"><label for="gt">Titre</label><input id="gt" [(ngModel)]="gt"><label for="gc">Catégorie (ex. Flyers, Textile, Bâches)</label><input id="gc" [(ngModel)]="gc">
    <label for="gf">Photo réelle (4 Mo max)</label><input id="gf" type="file" accept="image/*" (change)="gfile=$any($event.target).files[0]"><br><br><button class="btn" (click)="addG()">Publier la photo</button></div>
    <div class="grid" style="margin-top:1rem">@for (g of gal; track g.id) {<div class="card"><img [src]="api.imgUrl(g.path)" style="width:100%;border-radius:12px" [alt]="g.title"><p>{{g.title}} <small>({{g.category}})</small></p><button class="chip" (click)="delG(g)">Supprimer</button></div>}</div> }
  @if (tab==='m') { @for (m of msgs; track m.id) {<div class="card" style="margin-top:1rem" [style.opacity]="m.read ? .6 : 1"><p><b>{{m.name}}</b> · {{m.phone}} {{m.email}} <small>{{m.created_at.slice(0,10)}}</small></p><p style="color:var(--ink)">{{m.message}}</p>
      @if (digits(m.phone)) {<a class="chip p" [href]="'https://wa.me/'+digits(m.phone)" target="_blank" rel="noopener">Répondre sur WhatsApp</a>} @if (m.email) {<a class="chip" [href]="'mailto:'+m.email">Répondre par e-mail</a>}
      <button class="chip" (click)="mark(m)">{{m.read ? 'Marquer non lu' : 'Marquer lu'}}</button><button class="chip" (click)="delM(m)">Supprimer</button></div>}
    @if (!msgs.length) {<p>Aucun message.</p>} }`
})
export class ContentComponent implements OnInit {
  api = inject(ApiService); toast = inject(ToastService); poles = POLES; forms = FORMS; formIds = FORM_IDS; tab: 'c' | 'g' | 'm' = 'c';
  cat: any[] = []; gal: any[] = []; msgs: any[] = []; gt = ''; gc = ''; gfile: File | null = null;
  async ngOnInit() { const [c, g, m] = await Promise.all([this.api.allServices(), this.api.gallery(), this.api.messages()]); this.cat = c.data ?? []; this.gal = g; this.msgs = m.data ?? []; }
  unread() { return this.msgs.filter(m => !m.read).length; }
  digits(p: string) { return String(p ?? '').replace(/\D/g, ''); }
  async saveS(s: any) { const r = await this.api.saveService({ ...s, price: s.price === '' || s.price == null ? null : Number(s.price) }); if (r.ok) { Object.assign(s, r.data); this.toast.show('Service enregistré.'); } else this.toast.show(r.data?.error ?? 'Échec de l’enregistrement.'); }
  async delS(s: any) { if (s.id) { const r = await this.api.deleteService(s.id); if (!r.ok) { this.toast.show('Suppression impossible.'); return; } } this.cat = this.cat.filter(x => x !== s); }
  addS() { this.cat.push({ pole: 'impression', name: 'Nouveau service', hint: '', price: null, unit: '', form: null, active: true, sort: this.cat.length + 1 }); }
  async addG() {
    if (!this.gfile) { this.toast.show('Choisissez une photo.'); return; }
    const r = await this.api.addGallery(this.gfile, this.gt, this.gc);
    if (r.ok) { this.gt = ''; this.gfile = null; this.gal = await this.api.gallery(); this.toast.show('Photo publiée.'); } else this.toast.show(r.data?.error ?? 'Échec de la publication.');
  }
  async delG(g: any) { const r = await this.api.deleteGallery(g.id); if (r.ok) this.gal = this.gal.filter(x => x.id !== g.id); else this.toast.show('Suppression impossible.'); }
  async mark(m: any) { const r = await this.api.readMessage(m.id, !m.read); if (r.ok) m.read = !m.read; }
  async delM(m: any) { const r = await this.api.deleteMessage(m.id); if (r.ok) this.msgs = this.msgs.filter(x => x.id !== m.id); }
}
