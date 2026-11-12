import { isPlatformServer } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { SERVICES, Service } from './data';
export interface R { ok: boolean; status: number; data: any; }
@Injectable({ providedIn: 'root' })
export class ApiService {
  private server = isPlatformServer(inject(PLATFORM_ID));
  onExpire?: () => void;
  token = (() => { try { return localStorage.getItem('cf_admin') ?? ''; } catch { return ''; } })();
  async req(method: string, url: string, body?: any, auth = false): Promise<R> {
    if (this.server) return { ok: false, status: 0, data: null }; // pas d'appel réseau pendant le prérendu
    const headers: Record<string, string> = {}; let payload: any;
    if (body instanceof FormData) payload = body; else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
    if (auth && this.token) headers['Authorization'] = 'Bearer ' + this.token;
    try {
      const r = await fetch(url, { method, headers, body: payload });
      if (auth && r.status === 401) { this.logout(); this.onExpire?.(); }
      const data = await r.json().catch(() => null);
      if (r.ok && data === null && url.startsWith('/api/')) return { ok: false, status: 0, data: { error: 'Serveur de l’API injoignable : en local, lancez « npx netlify-cli dev » (et non « ng serve »).' } };
      return { ok: r.ok, status: r.status, data };
    }
    catch { return { ok: false, status: 0, data: null }; }
  }
  async catalog(): Promise<Service[]> { const r = await this.req('GET', '/api/catalog'); return r.ok && r.data?.length ? r.data : SERVICES; }
  async gallery(): Promise<any[]> { const r = await this.req('GET', '/api/gallery'); return r.ok && Array.isArray(r.data) ? r.data : []; }
  imgUrl(path: string) { return `/api/file/gallery/${encodeURIComponent(path)}`; }
  upload(file: File) { const f = new FormData(); f.append('file', file); return this.req('POST', '/api/upload', f); }
  createOrder(o: any) { return this.req('POST', '/api/orders', o); }
  trackOrder(code: string, phone: string) { return this.req('POST', '/api/track', { code, phone }); }
  pay(code: string, phone: string) { return this.req('POST', '/api/pay', { code, phone }); }
  contact(m: any) { return this.req('POST', '/api/contact', m); }
  // --- admin ---
  a(method: string, path: string, body?: any) { return this.req(method, '/api/admin/' + path, body, true); }
  async login(email: string, password: string) {
    const r = await this.req('POST', '/api/admin/login', { email, password });
    if (r.ok) { this.token = r.data.token; try { localStorage.setItem('cf_admin', this.token); } catch {} }
    return r;
  }
  adminStatus() { return this.req('GET', '/api/admin/status'); }
  async setup(code: string, email: string, password: string) {
    const r = await this.req('POST', '/api/admin/setup', { code, email, password });
    if (r.ok) { this.token = r.data.token; try { localStorage.setItem('cf_admin', this.token); } catch {} }
    return r;
  }
  changePassword(current: string, next: string) { return this.req('POST', '/api/admin/password', { current, next }, true); }
  logout() { this.token = ''; try { localStorage.removeItem('cf_admin'); } catch {} }
  hasToken() { return !!this.token; }
  orders() { return this.req('GET', '/api/admin/orders', undefined, true); }
  patchOrder(id: string, body: any) { return this.req('PATCH', `/api/admin/orders/${id}`, body, true); }
  receipt(id: string, send: boolean) { return this.req('POST', '/api/admin/receipt', { id, send }, true); }
  orderFileUrl(key: string) { return `/api/file/orders/${encodeURIComponent(key)}?t=${encodeURIComponent(this.token)}`; }
  allServices() { return this.req('GET', '/api/admin/services', undefined, true); }
  saveService(s: any) { return this.req('PUT', '/api/admin/services', s, true); }
  deleteService(id: string) { return this.req('DELETE', `/api/admin/services/${id}`, undefined, true); }
  addGallery(file: File, title: string, category: string) { const f = new FormData(); f.append('file', file); f.append('title', title); f.append('category', category); return this.req('POST', '/api/admin/gallery', f, true); }
  deleteGallery(id: string) { return this.req('DELETE', `/api/admin/gallery/${id}`, undefined, true); }
  messages() { return this.req('GET', '/api/admin/messages', undefined, true); }
  readMessage(id: string, read: boolean) { return this.req('PATCH', `/api/admin/messages/${id}`, { read }, true); }
  deleteMessage(id: string) { return this.req('DELETE', `/api/admin/messages/${id}`, undefined, true); }
}