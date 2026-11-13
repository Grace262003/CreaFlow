import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { POLES, Service, fcfa } from '../core/data';
import { ApiService } from '../core/api.service';
import { Field, FORMS, FormKind, kindOf } from '../core/forms';
import { OrdersStore } from '../core/orders-store';
import { seo } from '../core/seo';
interface UFile { name: string; key?: string; busy: boolean; error?: string; }
@Component({
  selector: 'app-order', standalone: true, imports: [FormsModule, RouterLink],
  template: `
  <section class="top"><div class="wrap">
    <h1>Commander</h1><p class="lead">Trois étapes, moins de deux minutes. Aucun compte à créer.</p>
    @if (!done) {
    <ol class="steps">@for (l of labels; track l; let i = $index) {<li [class.on]="step===i+1" [class.ok]="step>i+1"><b>{{step>i+1 ? '✓' : i+1}}</b><span>{{l}}</span></li>}</ol>
    <div class="lay">
      <form class="card main" (ngSubmit)="step<3 ? next() : submit()" novalidate>
        @if (step===1) { <div class="pane">
          @for (p of poles; track p.id) { <h3>{{p.title}}</h3>
            <div class="tiles">@for (s of byPole(p.id); track s.id) {
              <button type="button" class="tile" [class.sel]="sid===s.id" (click)="pick(s)"><b>{{s.name}}</b><small>{{price(s)}}</small></button>}</div> }
          @if (cur()) { <p class="ask"><b>Pour « {{cur()?.name}} », nous vous demanderons :</b> {{asks()}}.</p> }
        </div> }
        @if (step===2) { <div class="pane">
          <h3 style="margin-top:0">{{form().title}}</h3><p>{{form().intro}}</p>
          @for (fl of visible(); track fl.key) {
            <label [attr.for]="'f-' + fl.key">{{fl.label}}@if (fl.required) {<span class="req"> *</span>}</label>
            @switch (fl.type) {
              @case ('choice') { <div class="segs">@for (o of fl.options; track o) {<button type="button" class="seg" [class.sel]="ans[fl.key]===o" (click)="ans[fl.key]=o">{{o}}</button>}</div> }
              @case ('select') { <select [id]="'f-' + fl.key" [name]="'f-' + fl.key" [ngModel]="ans[fl.key] || ''" (ngModelChange)="ans[fl.key] = $event"><option value="">Choisir…</option>@for (o of fl.options; track o) {<option>{{o}}</option>}</select> }
              @case ('textarea') { <textarea [id]="'f-' + fl.key" [name]="'f-' + fl.key" rows="3" [(ngModel)]="ans[fl.key]" [placeholder]="fl.placeholder ?? ''"></textarea> }
              @case ('number') { <input [id]="'f-' + fl.key" [name]="'f-' + fl.key" type="number" min="0" [(ngModel)]="ans[fl.key]" [placeholder]="fl.placeholder ?? ''"> }
              @default { <input [id]="'f-' + fl.key" [name]="'f-' + fl.key" type="text" [(ngModel)]="ans[fl.key]" [placeholder]="fl.placeholder ?? ''"> }
            }
            @if (errs[fl.key]) {<p class="err">{{errs[fl.key]}}</p>}
          }
          @if (showSizes()) { <label>Tailles et quantités</label>
            <div class="sizes">@for (z of form().sizes; track z) {<div><small>{{z}}</small><input type="number" min="0" [name]="'sz-' + z" [ngModel]="sizes[z] || 0" (ngModelChange)="setSize(z, $event)"></div>}</div> }
          @if (!form().noQty) { <label for="qty">{{form().qty}}</label>
            <div class="qty"><button type="button" (click)="setQty(qty-1)" [disabled]="bySizes()" aria-label="Moins">−</button><input id="qty" name="qty" type="number" min="1" [ngModel]="effQty()" (ngModelChange)="setQty($event)" [disabled]="bySizes()"><button type="button" (click)="setQty(qty+1)" [disabled]="bySizes()" aria-label="Plus">+</button></div>
            @if (bySizes()) {<small>Calculée d’après vos tailles.</small>} }
          <label for="det">Précisions @if (form().id==='generic') {<span class="req"> *</span>} @else {(facultatif)}</label>
          <textarea id="det" name="det" rows="3" [(ngModel)]="details" [placeholder]="form().notePlaceholder"></textarea>
          @if (errs['details']) {<p class="err">{{errs['details']}}</p>}
          <label>{{form().fileLabel}}</label>
          <label class="drop" [class.drag]="drag" (dragover)="$event.preventDefault(); drag=true" (dragleave)="drag=false" (drop)="onDrop($event)">
            <input type="file" multiple hidden (change)="onFiles($any($event.target).files); $any($event.target).value=''">
            <b>Glissez vos fichiers ici</b><span>ou cliquez pour parcourir · 5 fichiers max · 4 Mo chacun</span></label>
          @if (form().fileHelp) {<small>{{form().fileHelp}}</small>}
          @if (form().privacy) {<p class="priv">{{form().privacy}}</p>}
          @for (f of files; track $index) { <div class="file"><span>{{f.name}}</span>
            <em [class.bad]="f.error">{{f.busy ? 'envoi…' : (f.error ?? 'prêt ✓')}}</em>
            <button type="button" (click)="files.splice($index,1)" aria-label="Retirer le fichier">×</button></div> }
          @if (errs['files']) {<p class="err">{{errs['files']}}</p>}
        </div> }
        @if (step===3) { <div class="pane">
          <label for="nm">Nom complet</label><input id="nm" name="nm" [(ngModel)]="name" autocomplete="name">
          @if (errs['name']) {<p class="err">{{errs['name']}}</p>}
          <label for="ph">Téléphone (WhatsApp ou Mobile Money)</label><input id="ph" name="ph" type="tel" [(ngModel)]="phone" autocomplete="tel" placeholder="01 97 16 80 15">
          @if (errs['phone']) {<p class="err">{{errs['phone']}}</p>}
          <label for="em">E-mail (pour recevoir le reçu PDF)</label><input id="em" name="em" type="email" [(ngModel)]="email" autocomplete="email">
          @if (errs['email']) {<p class="err">{{errs['email']}}</p>}
          <label>Réception</label>
          <div class="opts"><button type="button" class="opt" [class.sel]="delivery==='retrait'" (click)="delivery='retrait'"><b>Retrait</b><small>à Calavi-Agualand</small></button>
            <button type="button" class="opt" [class.sel]="delivery==='livraison'" (click)="delivery='livraison'"><b>Livraison</b><small>frais confirmés avant paiement</small></button></div>
          <label>Paiement</label>
          <div class="opts"><button type="button" class="opt" [class.sel]="pm==='ligne'" [disabled]="!total()" (click)="pm='ligne'"><b>Mobile Money</b><small>{{total() ? 'MTN, Moov : en ligne maintenant' : 'indisponible pour un devis'}}</small></button>
            <button type="button" class="opt" [class.sel]="pm==='place'" (click)="pm='place'"><b>À la remise</b><small>en espèces ou Mobile Money sur place</small></button></div>
        </div> }
        @if (err) {<p class="err">{{err}}</p>}
        <div class="mtot"><small>Total estimé</small><b>{{ total() ? f(total()) : 'Sur devis' }}</b></div>
        <div class="nav">
          @if (step>1) {<button type="button" class="btn ghost" (click)="prev()">Précédent</button>} @else {<span></span>}
          <button class="btn" [disabled]="busy">{{ step<3 ? 'Continuer' : busy ? 'Envoi en cours…' : (pm==='ligne' && total() ? 'Commander et payer' : 'Envoyer ma commande') }}</button>
        </div>
      </form>
      <aside class="card sum"><h3>Récapitulatif</h3>
        <p><b>{{cur()?.name ?? 'Choisissez un service'}}</b></p>
        @for (o of summary(); track o[0]) {<p class="line"><small>{{o[0]}}</small> {{o[1]}}</p>}
        <p class="line"><small>{{form().noQty ? 'Quantité' : form().qty}}</small> {{effQty()}}</p>
        <p class="line"><small>Réception</small> {{delivery==='retrait' ? 'retrait en boutique' : 'livraison'}}</p>
        @if (files.length) {<p class="line"><small>Fichiers</small> {{files.length}}</p>}
        <div class="tot">{{ total() ? f(total()) : 'Sur devis' }}</div>
        <small>{{ total() ? 'Montant estimé, confirmé à la commande.' : 'Nous vous répondons avec un prix avant toute production.' }}</small>
      </aside>
    </div> }
    @else { <div class="card ok pane"><h2>Commande enregistrée ✓</h2>
      <p>Votre numéro de commande :</p><div class="code">{{done.code}}</div>
      <p>Votre commande est enregistrée dans « Mes commandes » sur cet appareil. Gardez ce numéro et votre téléphone pour la retrouver ailleurs.</p>
      @if (payErr) {<p class="err">Le paiement en ligne n’a pas démarré. Vous pouvez réessayer ou régler à la remise.</p>}
      <div class="row">
        @if (pm==='ligne' && done.total) {<button class="btn" (click)="startPay()" [disabled]="paying">{{paying ? 'Redirection…' : (payErr ? 'Réessayer le paiement' : 'Payer maintenant')}}</button>}
        <button class="btn dark" type="button" (click)="copy()">{{copied ? 'Copié ✓' : 'Copier le numéro'}}</button>
        <a class="btn ghost" routerLink="/mes-commandes" [queryParams]="{code: done.code}">Suivre ma commande</a>
        <a class="btn ghost" [href]="waLink()" target="_blank" rel="noopener">Écrire sur WhatsApp</a>
        <button class="btn ghost" type="button" (click)="reset()">Nouvelle commande</button></div></div> }
  </div></section>`,
  styles: [`
  .top{padding-top:3.5rem}.lead{font-size:1.1rem}.pane{animation:up .5s both}
  .steps{display:flex;gap:.6rem;list-style:none;padding:0;margin:1.5rem 0;flex-wrap:wrap}.steps li{display:flex;align-items:center;gap:.5rem;padding:.5rem 1rem;border-radius:99px;background:#fff;border:1.5px solid var(--line);font-weight:600;color:var(--mut);transition:all .3s}
  .steps b{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#eef2fa;font-size:.85rem}.steps li.on{border-color:var(--red);color:var(--navy)}.steps li.on b{background:var(--g);color:#fff}.steps li.ok b{background:#1fa855;color:#fff}
  .lay{display:grid;gap:1.5rem;grid-template-columns:1fr 310px;align-items:start}@media(max-width:900px){.lay{grid-template-columns:1fr}.sum{position:static}}
  .mtot{display:none}@media(max-width:900px){.mtot{display:flex;justify-content:space-between;align-items:baseline;margin-top:1.2rem;padding:.8rem 1rem;border-radius:14px;background:#fff7f1;border:1px solid #f26a2133}.mtot b{font-size:1.3rem;color:var(--navy)}}
  @media(max-width:600px){.steps{gap:.4rem}.steps li{padding:.4rem .7rem}.steps li:not(.on) span{display:none}.nav .btn{padding:.8rem 1.2rem}.tiles{grid-template-columns:1fr}.code{font-size:1.7rem}}
  .main h3{margin:1.2rem 0 .6rem;font-size:1.05rem}.tiles{display:grid;gap:.6rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
  .tile,.opt,.seg{display:flex;flex-direction:column;gap:.15rem;text-align:left;border:1.5px solid var(--line);background:#fff;border-radius:14px;padding:.8rem 1rem;font:inherit;color:var(--navy);cursor:pointer;transition:all .25s}
  .tile:hover,.opt:hover:not(:disabled),.seg:hover{transform:translateY(-3px);border-color:#f26a2188}.tile.sel,.opt.sel,.seg.sel{border-color:var(--red);box-shadow:0 0 0 3px #d81e3e22;background:#fff7f8}.opt:disabled{opacity:.5;cursor:not-allowed}
  .segs{display:flex;gap:.5rem;flex-wrap:wrap}.seg{padding:.55rem 1rem;border-radius:99px;font-weight:600}
  .ask{margin-top:1.2rem;padding:.9rem 1.1rem;border-radius:14px;background:#fff7f1;border:1px solid #f26a2133;color:var(--navy)}.req{color:var(--red)}
  .sizes{display:grid;gap:.6rem;grid-template-columns:repeat(auto-fit,minmax(80px,1fr))}.sizes div{display:flex;flex-direction:column;gap:.2rem}.sizes input{text-align:center;padding:.6rem}
  small{color:var(--mut)}.opts{display:grid;gap:.6rem;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
  .qty{display:flex;gap:.5rem;align-items:center}.qty input{width:110px;text-align:center}.qty button{width:44px;height:44px;border-radius:50%;border:1.5px solid var(--line);background:#fff;font-size:1.3rem;cursor:pointer}.qty button:hover:not(:disabled){border-color:var(--red)}.qty button:disabled,.qty input:disabled{opacity:.5}
  .drop{display:flex;flex-direction:column;align-items:center;gap:.2rem;padding:1.6rem;border:2px dashed var(--line);border-radius:16px;background:#fbfcff;cursor:pointer;text-align:center;transition:all .25s;font-weight:400}.drop:hover,.drop.drag{border-color:var(--orange);background:#fff7f1}.drop span{color:var(--mut);font-size:.9rem}
  .priv{margin:.6rem 0 0;padding:.7rem 1rem;border-radius:12px;background:#eef2fa;color:var(--navy);font-size:.92rem}
  .file{display:flex;gap:.8rem;align-items:center;padding:.5rem .8rem;margin-top:.5rem;border:1px solid var(--line);border-radius:10px;background:#fff}.file span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.file em{font-style:normal;color:#1fa855;font-size:.85rem}.file em.bad{color:var(--red)}.file button{border:0;background:none;font-size:1.3rem;cursor:pointer}
  .err{color:var(--red);margin:.4rem 0 0;font-weight:600}.nav{display:flex;justify-content:space-between;margin-top:1.6rem}
  .sum{position:sticky;top:90px}.sum p{margin:.2rem 0}.sum .line small{display:block}.tot{font-size:1.9rem;font-weight:800;color:var(--navy);margin:1rem 0 .2rem}
  .ok{max-width:640px}.code{font-size:2.2rem;font-weight:800;color:var(--red);letter-spacing:.04em;margin:.2rem 0 1rem}.row{display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1rem}`]
})
export class OrderComponent implements OnInit {
  api = inject(ApiService); store = inject(OrdersStore); route = inject(ActivatedRoute); f = fcfa; poles = POLES;
  labels = ['Service', 'Détails', 'Coordonnées'];
  cat: Service[] = []; step = 1; sid = ''; qty = 1; details = ''; files: UFile[] = []; ans: Record<string, string> = {}; sizes: Record<string, number> = {};
  name = ''; phone = ''; email = ''; delivery = 'retrait'; pm = 'place';
  errs: Record<string, string> = {}; err = ''; busy = false; drag = false;
  done: { code: string; total: number | null } | null = null; paying = false; payErr = false; copied = false;
  constructor() { seo('Commander en ligne', 'Commandez impression, flyers, tee-shirts ou démarches chez Creaflow et payez par Mobile Money.', { path: '/commander' }); }
  async ngOnInit() { this.cat = await this.api.catalog(); this.sid = this.route.snapshot.queryParamMap.get('service') ?? this.cat[0]?.id ?? ''; if (!this.cat.some(s => s.id === this.sid)) this.sid = this.cat[0]?.id ?? ''; }
  byPole = (id: string) => this.cat.filter(s => s.pole === id);
  cur = () => this.cat.find(s => s.id === this.sid);
  form = (): FormKind => FORMS[kindOf(this.cur())];
  asks = () => { const k = this.form(); const l = k.fields.filter(x => x.required && !x.when).map(x => x.label.toLowerCase()); if (!k.noQty) l.push(k.qty.toLowerCase()); return l.slice(0, 5).join(', ') || 'une description de votre besoin'; };
  visible = (): Field[] => this.form().fields.filter(x => !x.when || this.ans[x.when[0]] === x.when[1]);
  showSizes = () => !!this.form().sizes && !(this.form().sizesHideFor ?? []).includes(this.ans['Article']);
  sizeTotal = () => Object.values(this.sizes).reduce((a, n) => a + (Number(n) || 0), 0);
  bySizes = () => this.showSizes() && this.sizeTotal() > 0;
  effQty = () => (this.form().noQty ? 1 : this.bySizes() ? this.sizeTotal() : this.qty);
  summary = (): [string, string][] => { const r: [string, string][] = this.visible().filter(x => (this.ans[x.key] ?? '') !== '' && x.type !== 'textarea').map(x => [x.key, String(this.ans[x.key])]); if (this.bySizes()) r.push(['Tailles', this.sizeText()]); return r.slice(0, 7); };
  sizeText = () => Object.entries(this.sizes).filter(([, n]) => Number(n) > 0).map(([z, n]) => `${z}×${n}`).join(', ');
  price = (s: Service) => (s.price ? 'dès ' + fcfa(s.price) : 'Sur devis');
  total = () => { const s = this.cur(); return s?.price ? Number(s.price) * this.effQty() : 0; };
  pick(s: Service) { if (s.id !== this.sid) { this.ans = {}; this.sizes = {}; this.qty = 1; } this.sid = s.id; if (!this.total()) this.pm = 'place'; }
  setQty(v: any) { this.qty = Math.min(100000, Math.max(1, Math.floor(Number(v)) || 1)); }
  setSize(z: string, v: any) { this.sizes[z] = Math.max(0, Math.floor(Number(v)) || 0); }
  async onFiles(list: FileList | null) {
    for (const file of Array.from(list ?? [])) {
      if (this.files.length >= 5) { this.errs['files'] = '5 fichiers maximum.'; break; }
      const u: UFile = { name: file.name, busy: true }; this.files.push(u); this.errs['files'] = '';
      if (file.size > 4 * 1024 * 1024) { u.busy = false; u.error = 'trop lourd (4 Mo max)'; continue; }
      const r = await this.api.upload(file); u.busy = false;
      if (r.ok) u.key = r.data.key; else u.error = r.data?.error ?? 'échec de l’envoi';
    }
  }
  onDrop(e: DragEvent) { e.preventDefault(); this.drag = false; this.onFiles(e.dataTransfer?.files ?? null); }
  next() {
    this.err = ''; this.errs = {};
    if (this.step === 1 && !this.cur()) { this.err = 'Choisissez un service.'; return; }
    if (this.step === 2) {
      for (const fl of this.visible()) if (fl.required && !String(this.ans[fl.key] ?? '').trim()) this.errs[fl.key] = 'Ce champ est obligatoire.';
      if (this.form().id === 'generic' && this.details.trim().length < 3) this.errs['details'] = 'Décrivez brièvement votre besoin.';
      if (this.files.some(f => f.busy)) this.errs['files'] = 'Patientez, vos fichiers sont en cours d’envoi.';
      if (Object.keys(this.errs).length) { this.err = 'Complétez les champs signalés.'; return; }
    }
    this.step++;
  }
  prev() { this.err = ''; this.step = Math.max(1, this.step - 1); }
  options() {
    const o = this.visible().filter(x => String(this.ans[x.key] ?? '').trim() !== '').map(x => ({ label: x.key, value: String(this.ans[x.key]).trim() }));
    if (this.bySizes()) o.push({ label: 'Tailles', value: this.sizeText() });
    if (!this.form().noQty) o.push({ label: this.form().qty, value: String(this.effQty()) });
    return o;
  }
  async submit() {
    this.err = ''; this.errs = {};
    if (!this.name.trim()) this.errs['name'] = 'Indiquez votre nom.';
    if (this.phone.replace(/\D/g, '').length < 8) this.errs['phone'] = 'Numéro de téléphone invalide.';
    if (this.email.trim() && !/^\S+@\S+\.\S+$/.test(this.email.trim())) this.errs['email'] = 'Adresse e-mail invalide.';
    if (Object.keys(this.errs).length) return;
    this.busy = true;
    const r = await this.api.createOrder({ service: this.sid, details: this.details, quantity: this.effQty(), options: this.options(), name: this.name, phone: this.phone, email: this.email, delivery: this.delivery, files: this.files.filter(f => f.key).map(f => f.key) });
    this.busy = false;
    if (!r.ok) { this.err = r.data?.error ?? 'Connexion impossible. Vérifiez votre réseau ou écrivez-nous sur WhatsApp.'; return; }
    this.done = r.data; this.store.save({ code: r.data.code, phone: this.phone, service: this.cur()?.name, at: Date.now() });
    if (this.pm === 'ligne' && r.data.total) this.startPay();
  }
  async startPay() {
    if (!this.done) return; this.paying = true; this.payErr = false;
    const r = await this.api.pay(this.done.code, this.phone);
    if (r.ok && r.data?.url) { window.location.href = r.data.url; return; }
    this.payErr = true; this.paying = false;
  }
  async copy() { try { await navigator.clipboard.writeText(this.done?.code ?? ''); this.copied = true; setTimeout(() => this.copied = false, 2000); } catch {} }
  waLink = () => `https://wa.me/${environment.whatsapp}?text=${encodeURIComponent('Bonjour Creaflow, ma commande ' + (this.done?.code ?? ''))}`;
  reset() { this.done = null; this.step = 1; this.details = ''; this.files = []; this.qty = 1; this.ans = {}; this.sizes = {}; this.payErr = false; this.err = ''; this.errs = {}; }
}