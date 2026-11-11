import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class ToastService {
  msg = ''; private t: any;
  show(m: string) { this.msg = m; clearTimeout(this.t); this.t = setTimeout(() => this.msg = '', 4500); }
}
