import { Component, Input } from '@angular/core';
import { P } from './bg-icons.component';
@Component({
  selector: 'app-icon', standalone: true,
  template: `<svg viewBox="0 0 24 24" [attr.width]="size" [attr.height]="size" aria-hidden="true"><path [attr.d]="d()" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  styles: [`:host{display:inline-grid;place-items:center;line-height:0}`]
})
export class IconComponent { @Input() name = 'file'; @Input() size = 26; d = () => P[this.name] ?? P['file']; }
