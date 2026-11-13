import { Injectable } from '@angular/core';
export interface SavedOrder { code: string; phone: string; service?: string; at: number; }
/** Commandes retenues sur cet appareil (localStorage) pour la page « Mes commandes ». Jamais envoyées ailleurs. */
@Injectable({ providedIn: 'root' })
export class OrdersStore {
  private key = 'cf_orders';
  list(): SavedOrder[] { try { return JSON.parse(localStorage.getItem(this.key) ?? '[]'); } catch { return []; } }
  private write(a: SavedOrder[]) { try { localStorage.setItem(this.key, JSON.stringify(a.slice(0, 20))); } catch {} }
  save(o: SavedOrder) { const code = o.code.toUpperCase(); this.write([{ ...o, code }, ...this.list().filter(x => x.code !== code)]); }
  remove(code: string) { this.write(this.list().filter(x => x.code !== code)); }
}
