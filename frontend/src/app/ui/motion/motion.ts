import { Directive, ElementRef, OnDestroy, OnInit, PLATFORM_ID, inject, Input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Révèle l'élément quand il entre dans l'écran. Sans effet côté serveur (SSR). */
@Directive({ selector: '[appReveal]', standalone: true })
export class Reveal implements OnInit, OnDestroy {
  @Input('appReveal') delay: string | number = 0;
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private io?: IntersectionObserver;

  ngOnInit(): void {
    if (!this.browser || !('IntersectionObserver' in window)) return;
    const d = Number(this.delay) || 0;
    this.el.classList.add('reveal');
    this.el.style.setProperty('--d', `${d}s`);
    this.io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { this.el.classList.add('is-in'); this.io?.disconnect(); }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    this.io.observe(this.el);
  }
  ngOnDestroy(): void { this.io?.disconnect(); }
}
