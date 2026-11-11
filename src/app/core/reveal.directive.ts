import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
@Directive({ selector: '[reveal]', standalone: true })
export class RevealDirective implements OnInit, OnDestroy {
  private io?: IntersectionObserver;
  private pid = inject(PLATFORM_ID);
  constructor(private el: ElementRef<HTMLElement>) {}
  ngOnInit() {
    const e = this.el.nativeElement;
    if (!isPlatformBrowser(this.pid) || typeof IntersectionObserver === 'undefined') { e.classList.add('rv', 'in'); return; }
    e.classList.add('rv');
    this.io = new IntersectionObserver(([x]) => { if (x.isIntersecting) { e.classList.add('in'); this.io?.disconnect(); } }, { threshold: .12 });
    this.io.observe(e);
  }
  ngOnDestroy() { this.io?.disconnect(); }
}
