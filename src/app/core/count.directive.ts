import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, Input, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
/** Compteur animé : le nombre monte de 0 à la valeur quand il devient visible. */
@Directive({ selector: '[count]', standalone: true })
export class CountDirective implements OnInit, OnDestroy {
  @Input('count') target = 0; private io?: IntersectionObserver; private pid = inject(PLATFORM_ID);
  constructor(private el: ElementRef<HTMLElement>) {}
  ngOnInit() {
    const e = this.el.nativeElement; e.textContent = String(this.target);
    if (!isPlatformBrowser(this.pid) || typeof IntersectionObserver === 'undefined') return;
    this.io = new IntersectionObserver(([x]) => {
      if (!x.isIntersecting) return; this.io?.disconnect(); const t0 = performance.now(), d = 1200;
      const step = (t: number) => { const k = Math.min(1, (t - t0) / d); e.textContent = String(Math.round(this.target * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }, { threshold: .4 });
    this.io.observe(e);
  }
  ngOnDestroy() { this.io?.disconnect(); }
}
