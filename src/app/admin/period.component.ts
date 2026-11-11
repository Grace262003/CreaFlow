import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { range } from './util';
@Component({
  selector: 'app-period', standalone: true, imports: [FormsModule],
  template: `<div class="pb noprint">
    @for (p of presets; track p[0]) {<button type="button" class="chip" (click)="pick(p[0])">{{p[1]}}</button>}
    <input type="date" [ngModel]="from" (ngModelChange)="fromChange.emit($event)" aria-label="Du"> <span>au</span>
    <input type="date" [ngModel]="to" (ngModelChange)="toChange.emit($event)" aria-label="Au">
    <button type="button" class="btn dark" style="padding:.6rem 1.2rem" (click)="go.emit()">Afficher</button></div>`
})
export class PeriodComponent {
  @Input() from = ''; @Input() to = ''; @Output() fromChange = new EventEmitter<string>(); @Output() toChange = new EventEmitter<string>(); @Output() go = new EventEmitter<void>();
  presets = [['today', 'Aujourd’hui'], ['week', 'Cette semaine'], ['month', 'Ce mois'], ['last', 'Mois dernier'], ['year', 'Cette année']];
  pick(k: string) { const [f, t] = range(k); this.fromChange.emit(f); this.toChange.emit(t); setTimeout(() => this.go.emit()); }
}
