import { Component, ElementRef, NgZone, OnDestroy, afterNextRender, inject, viewChild } from '@angular/core';

/** Curseur personnalisé : un point + un halo qui grossit sur les éléments [data-cursor]. */
@Component({
  selector: 'app-cursor',
  standalone: true,
  template: `<div class="halo" #halo aria-hidden="true"><span #label></span></div><div class="dot" #dot aria-hidden="true"></div>`,
  styleUrl: './cursor.css',
})
export class Cursor implements OnDestroy {
  private readonly halo = viewChild.required<ElementRef<HTMLElement>>('halo');
  private readonly dot = viewChild.required<ElementRef<HTMLElement>>('dot');
  private readonly label = viewChild.required<ElementRef<HTMLElement>>('label');
  private readonly zone = inject(NgZone);
  private raf = 0;
  private off: (() => void)[] = [];

  constructor() {
    afterNextRender(() => {
      if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      document.documentElement.classList.add('has-cursor');
      const halo = this.halo().nativeElement, dot = this.dot().nativeElement, label = this.label().nativeElement;
      let x = innerWidth / 2, y = innerHeight / 2, hx = x, hy = y;
      this.zone.runOutsideAngular(() => {
        const move = (e: PointerEvent) => {
          x = e.clientX; y = e.clientY;
          dot.style.transform = `translate(${x}px, ${y}px)`;
          const t = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]');
          const txt = t?.dataset['cursor'] ?? '';
          halo.classList.toggle('is-big', !!t);
          halo.classList.toggle('has-label', !!txt);
          if (label.textContent !== txt) label.textContent = txt;
        };
        addEventListener('pointermove', move, { passive: true });
        this.off.push(() => removeEventListener('pointermove', move));
        const tick = () => {
          hx += (x - hx) * 0.16; hy += (y - hy) * 0.16;
          halo.style.transform = `translate(${hx}px, ${hy}px)`;
          this.raf = requestAnimationFrame(tick);
        };
        tick();
      });
    });
  }
  ngOnDestroy(): void { cancelAnimationFrame(this.raf); this.off.forEach(f => f()); document.documentElement.classList.remove('has-cursor'); }
}
