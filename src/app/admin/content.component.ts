import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { POLES } from '../core/data';
import { FORMS, FORM_IDS } from '../core/forms';
import { ToastService } from '../core/toast.service';
import { shrinkImage } from './util';
@Component({
  selector: 'app-content', standalone: true, imports: [FormsModule],
  template: `<div><button class="chip" [class.p]="tab==='c'" (click)="tab='c'">Catalogue et prix</button><button class="chip" [class.p]="tab==='g'" (click)="tab='g'">Galerie</button><button class="chip" [class.p]="tab==='m'" (click)="tab='m'">Messages @if (unread()) {({{unread()}})}</button></div>
  @if (tab==='c') { <div class="card scroll" style="margin-top:1rem"><table><tr><th>Pôle</th><th>Service</th><th>Description</th><th>Prix (FCFA)</th><th>Unité</th><th>Formulaire de commande</th><th>Actif</th><th></th></tr>
    @for (s of cat; track $index) {<tr><td><select [(ngModel)]="s.pole">@for (p of poles; track p.id) {<option [value]="p.id">{{p.id}}</option>}</select></td>
      <td><input [(ngModel)]="s.name"></td><td><input [(ngModel)]="s.hint"></td><td><input type="number" min="0" [(ngModel)]="s.price" placeholder="sur devis" style="width:110px"></td>
      <td><input [(ngModel)]="s.unit" style="width:90px"></td><td><select [(ngModel)]="s.form"><option [ngValue]="null">Automatique</option>@for (k of formIds; track k) {<option [value]="k">{{forms[k].title}}</option>}</select></td><td><input type="checkbox" [(ngModel)]="s.active" style="width:auto"></td>
      <td><button class="btn dark" (click)="saveS(s)">Enregistrer</button> <button class="chip" (click)="delS(s)">Supprimer</button></td></tr>}</table>
    <br><button class="btn" (click)="addS()">Ajouter un service</button></div> }

  @if (tab==='g') {
  <div class="two2">
    <div class="card"><h3>Ajouter des réalisations</h3>
      <label for="gc">Catégorie</label>
      <select id="gc" [(ngModel)]="selCat"><option value="__new">＋ Nouvelle catégorie…</option>@for (c of cats; track c.id) {<option [value]="c.name">{{c.name}}</option>}</select>
      @if (selCat === '__new') { <input [(ngModel)]="nct" placeholder="Nom de la nouvelle catégorie (ex. Tee-shirts)" aria-label="Nom de la nouvelle catégorie" style="margin-top:.5rem"> }
      <label for="gf">Photos (vous pouvez en choisir plusieurs)</label><input id="gf" type="file" accept="image/*" multiple (change)="pickFiles($any($event.target).files)">
      @if (previews.length) { <div class="strip">@for (p of previews; track p) {<img [src]="p" alt="Aperçu">}</div> }
      <label for="gt">Titre @if (files.length > 1) {<small>(facultatif : le nom de chaque fichier sera utilisé)</small>}</label><input id="gt" [(ngModel)]="gt">
      <p><small>Les photos sont réduites automatiquement (1600 px) pour que le site reste rapide.</small></p>
      <button class="btn" (click)="publish()" [disabled]="busy">{{busy ? 'Publication ' + done + '/' + files.length + '…' : 'Publier'}}</button></div>
    <div class="card"><h3>Catégories</h3>
      <table>@for (c of cats; track c.id) {<tr><td><input [(ngModel)]="c.edit" [attr.aria-label]="'Nom de la catégorie ' + c.name" (keyup.enter)="rename(c)"></td><td style="white-space:nowrap"><small>{{c.n}} photo{{c.n > 1 ? 's' : ''}}</small></td>
        <td style="white-space:nowrap">@if (c.edit.trim() && c.edit.trim() !== c.name) {<button class="chip p" (click)="rename(c)">Renommer</button>}<button class="chip" [disabled]="c.n > 0" [attr.title]="c.n > 0 ? 'Déplacez d’abord les photos' : 'Supprimer'" (click)="delCat(c)">Supprimer</button></td></tr>}</table>
      @if (!cats.length) {<p><small>Aucune catégorie pour le moment.</small></p>}
      <div class="addc"><input [(ngModel)]="newCat" placeholder="Nouvelle catégorie" aria-label="Nouvelle catégorie" (keyup.enter)="addCat()"><button class="btn dark" (click)="addCat()">Ajouter</button></div></div>
  </div>
  <h3 style="margin-top:1.5rem">Photos publiées ({{gal.length}})</h3>
  <div class="thumbs">@for (g of gal; track g.id) {<div class="th"><img [src]="api.imgUrl(g.path)" [alt]="g.title || 'Réalisation'" loading="lazy">
      <input [(ngModel)]="g.title" (blur)="savePhoto(g)" placeholder="Titre" aria-label="Titre de la photo">
      <select [ngModel]="g.category || ''" (ngModelChange)="moveTo(g, $event)" aria-label="Catégorie de la photo"><option value="">Sans catégorie</option>@for (c of cats; track c.id) {<option [value]="c.name">{{c.name}}</option>}</select>
      <button class="chip" (click)="delG(g)">Supprimer</button></div>}</div>
  @if (!gal.length) {<p>Aucune photo publiée.</p>} }

  @if (tab==='m') { @for (m of msgs; track m.id) {<div class="card" style="margin-top:1rem" [style.opacity]="m.read ? .6 : 1"><p><b>{{m.name}}</b> · {{m.phone}} {{m.email}} <small>{{m.created_at.slice(0,10)}}</small></p><p style="color:var(--ink)">{{m.message}}</p>
      @if (digits(m.phone)) {<a class="chip p" [href]="'https://wa.me/'+digits(m.phone)" target="_blank" rel="noopener">Répondre sur WhatsApp</a>} @if (m.email) {<a class="chip" [href]="'mailto:'+m.email">Répondre par e-mail</a>}
      <button class="chip" (click)="mark(m)">{{m.read ? 'Marquer non lu' : 'Marquer lu'}}</button><button class="chip" (click)="delM(m)">Supprimer</button></div>}
    @if (!msgs.length) {<p>Aucun message.</p>} }`,
  styles: [`.two2{display:grid;gap:1rem;grid-template-columns:1fr 1fr;margin-top:1rem;align-items:start}@media(max-width:800px){.two2{grid-template-columns:1fr}}
  .strip{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.6rem}.strip img{width:64px;height:64px;object-fit:cover;border-radius:10px;border:1px solid var(--line)}
  .addc{display:flex;gap:.5rem;margin-top:.8rem}.addc input{flex:1}
  .thumbs{display:grid;gap:.8rem;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));margin-top:.8rem}
  .th{background:#fff;border:1px solid var(--line);border-radius:14px;padding:.5rem;display:flex;flex-direction:column;gap:.4rem}.th img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px;background:#e3e8f2}
  .th input,.th select{padding:.4rem .5rem;font-size:.85rem}.th .chip{align-self:flex-start}button.chip:disabled{opacity:.45;cursor:not-allowed}`]
})
export class ContentComponent implements OnInit {
  api = inject(ApiService); toast = inject(ToastService); poles = POLES; forms = FORMS; formIds = FORM_IDS; tab: 'c' | 'g' | 'm' = 'c';
  cat: any[] = []; gal: any[] = []; cats: any[] = []; msgs: any[] = [];
  selCat = '__new'; nct = ''; newCat = ''; gt = ''; files: File[] = []; previews: string[] = []; busy = false; done = 0;
  async ngOnInit() { const [c, g, m] = await Promise.all([this.api.allServices(), this.api.gallery(), this.api.messages()]); this.cat = c.data ?? []; this.gal = g; this.msgs = m.data ?? []; await this.loadCats(); }
  async loadCats() {
    const r = await this.api.a('GET', 'gallery-categories'); this.cats = (r.data ?? []).map((c: any) => ({ ...c, edit: c.name }));
    if (this.selCat !== '__new' && !this.cats.some(c => c.name === this.selCat)) this.selCat = '__new';
    if (this.selCat === '__new' && this.cats.length && !this.nct) this.selCat = this.cats[0].name;
  }
  unread() { return this.msgs.filter(m => !m.read).length; }
  digits(p: string) { return String(p ?? '').replace(/\D/g, ''); }
  async saveS(s: any) { const r = await this.api.saveService({ ...s, price: s.price === '' || s.price == null ? null : Number(s.price) }); if (r.ok) { Object.assign(s, r.data); this.toast.show('Service enregistré.'); } else this.toast.show(r.data?.error ?? 'Échec de l’enregistrement.'); }
  async delS(s: any) { if (s.id) { const r = await this.api.deleteService(s.id); if (!r.ok) { this.toast.show('Suppression impossible.'); return; } } this.cat = this.cat.filter(x => x !== s); }
  addS() { this.cat.push({ pole: 'impression', name: 'Nouveau service', hint: '', price: null, unit: '', form: null, active: true, sort: this.cat.length + 1 }); }
  // ---- galerie
  pickFiles(list: FileList | null) { this.previews.forEach(u => URL.revokeObjectURL(u)); this.files = Array.from(list ?? []); this.previews = this.files.slice(0, 12).map(f => URL.createObjectURL(f)); }
  async addCat() {
    const r = await this.api.a('POST', 'gallery-categories', { name: this.newCat });
    if (r.ok) { this.toast.show(`Catégorie « ${r.data.name} » créée.`); this.newCat = ''; await this.loadCats(); } else this.toast.show(r.data?.error ?? 'Création impossible.');
  }
  async rename(c: any) {
    const r = await this.api.a('PATCH', `gallery-categories/${c.id}`, { name: c.edit });
    if (r.ok) { this.toast.show('Catégorie renommée.'); this.gal = await this.api.gallery(); await this.loadCats(); } else this.toast.show(r.data?.error ?? 'Renommage impossible.');
  }
  async delCat(c: any) {
    if (!confirm(`Supprimer la catégorie « ${c.name} » ?`)) return;
    const r = await this.api.a('DELETE', `gallery-categories/${c.id}`);
    if (r.ok) { this.toast.show('Catégorie supprimée.'); await this.loadCats(); } else this.toast.show(r.data?.error ?? 'Suppression impossible.');
  }
  async publish() {
    const category = this.selCat === '__new' ? this.nct.trim() : this.selCat;
    if (!category) { this.toast.show('Choisissez une catégorie ou saisissez le nom d’une nouvelle catégorie.'); return; }
    if (!this.files.length) { this.toast.show('Choisissez au moins une photo.'); return; }
    this.busy = true; this.done = 0; let ok = 0, fail = '';
    for (const f of this.files) {
      const img = await shrinkImage(f); const title = this.files.length === 1 ? this.gt : f.name.replace(/\.\w+$/, '').replace(/[_-]+/g, ' ');
      const r = await this.api.addGallery(img, title, category); this.done++;
      if (r.ok) ok++; else fail = r.data?.error ?? 'échec';
    }
    this.busy = false; this.gt = ''; this.nct = ''; this.pickFiles(null); this.selCat = category;
    const inp = document.getElementById('gf') as HTMLInputElement | null; if (inp) inp.value = '';
    this.gal = await this.api.gallery(); await this.loadCats();
    this.toast.show(fail ? `${ok} photo(s) publiée(s). Erreur : ${fail}` : `${ok} photo(s) publiée(s) dans « ${category} ».`);
  }
  async savePhoto(g: any) { const r = await this.api.a('PATCH', `gallery/${g.id}`, { title: g.title ?? '' }); if (!r.ok) this.toast.show('Titre non enregistré.'); }
  async moveTo(g: any, category: string) {
    const r = await this.api.a('PATCH', `gallery/${g.id}`, { category });
    if (r.ok) { g.category = category; this.toast.show('Photo déplacée.'); await this.loadCats(); } else this.toast.show('Déplacement impossible.');
  }
  async delG(g: any) { if (!confirm('Supprimer cette photo ?')) return; const r = await this.api.deleteGallery(g.id); if (r.ok) { this.gal = this.gal.filter(x => x.id !== g.id); await this.loadCats(); } else this.toast.show('Suppression impossible.'); }
  async mark(m: any) { const r = await this.api.readMessage(m.id, !m.read); if (r.ok) m.read = !m.read; }
  async delM(m: any) { const r = await this.api.deleteMessage(m.id); if (r.ok) this.msgs = this.msgs.filter(x => x.id !== m.id); }
}