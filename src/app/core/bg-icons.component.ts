import { Component } from '@angular/core';
export const P: Record<string, string> = {
  printer: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z',
  shirt: 'M20.4 5.5 16 3a4 4 0 0 1-8 0L3.6 5.5 2 10l4 1.5V21h12v-9.5l4-1.5z',
  pencil: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  scissors: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12',
  palette: 'M12 22a10 10 0 1 1 10-10c0 2.8-2.2 3-4 3h-2a2 2 0 0 0-1 3.7c.6.5.5 1.3-.2 2.2-.8.8-1.8 1.1-2.8 1.1zM7.5 11.5h.01M12 7.5h.01M16.5 11.5h.01',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8',
  image: 'M3 3h18v18H3zM8.5 9.5h.01M21 15l-5-5L5 21',
  layers: 'M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  tag: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01',
  cap: 'M2 15c0-5 4-9 10-9s8 3 8 7zM2 15h20v3H2z',
  card: 'M2 5h20v14H2zM2 10h20M6 15h4',
  bag: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  stamp: 'M5 22h14M19 18H5v-3a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4zM12 11V8a3 3 0 1 0-3-3',
  pointer: 'M3 3l7 18 2.5-7.5L20 11z',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5zM4 19.5V22h16',
  mail: 'M3 5h18v14H3zM3 7l9 7 9-7',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  check: 'M20 6 9 17l-5-5',
  truck: 'M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  building: 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9h.01M9 13h.01M9 17h.01',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z'
};
const POS: [string, number, number, number, number, number][] = [
  ['printer', 4, 8, 64, 22, 0], ['shirt', 88, 12, 58, 26, 3], ['pencil', 14, 38, 46, 19, 6], ['palette', 80, 44, 62, 24, 2],
  ['scissors', 6, 70, 52, 21, 5], ['layers', 92, 78, 50, 25, 1], ['file', 30, 18, 40, 23, 7], ['image', 66, 26, 44, 20, 4],
  ['tag', 45, 52, 38, 27, 8], ['cap', 20, 88, 56, 22, 2], ['card', 60, 90, 48, 24, 6], ['bag', 74, 62, 42, 21, 9],
  ['stamp', 38, 76, 46, 26, 3], ['pointer', 52, 8, 34, 18, 5], ['book', 10, 54, 44, 23, 1], ['mail', 94, 30, 36, 20, 7]
];
@Component({
  selector: 'app-bg-icons', standalone: true,
  template: `<div class="bg" aria-hidden="true">@for (p of icons; track $index) {
    <svg viewBox="0 0 24 24" [style.left.%]="p[1]" [style.top.%]="p[2]" [style.width.px]="p[3]" [style.height.px]="p[3]"
      [style.animation-duration.s]="p[4]" [style.animation-delay.s]="-p[5]" [class.r]="$index % 4 === 0">
      <path [attr.d]="path(p[0])" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>}</div>`,
  styles: [`.bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
  svg{position:absolute;color:#0b1b3a;opacity:.07;animation:drift ease-in-out infinite}svg.r{color:#d81e3e;opacity:.1}
  @keyframes drift{0%,100%{transform:translate(0,0) rotate(-8deg)}50%{transform:translate(14px,-26px) rotate(10deg)}}`]
})
export class BgIconsComponent { icons = POS; path = (k: string) => P[k]; }
