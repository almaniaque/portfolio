import { Component, ElementRef, NgZone, OnDestroy, afterNextRender, inject, viewChild } from '@angular/core';

/**
 * Champ de points interactif : les points s'écartent et s'allument près du pointeur,
 * avec une lente ondulation au repos. Statique si l'utilisateur réduit les animations.
 */
@Component({
  selector: 'app-dot-field',
  standalone: true,
  template: `<canvas #c aria-hidden="true"></canvas>`,
  styles: `:host{position:absolute;inset:0;display:block}canvas{width:100%;height:100%;display:block}`,
})
export class DotField implements OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('c');
  private readonly zone = inject(NgZone);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private raf = 0;
  private cleanup: (() => void)[] = [];

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.start()));
  }

  private start(): void {
    const cv = this.canvas().nativeElement;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const GAP = 30;
    let w = 0, h = 0, dpr = 1, visible = true;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = this.host.clientWidth; h = this.host.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const R = 170;
      for (let gx = GAP / 2; gx < w; gx += GAP) {
        for (let gy = GAP / 2; gy < h; gy += GAP) {
          let x = gx, y = gy;
          const wave = still ? 0 : Math.sin(gx * 0.011 + t * 0.0007) * Math.cos(gy * 0.013 - t * 0.0006);
          let r = 1.15 + wave * 0.55;
          const dx = gx - mouse.x, dy = gy - mouse.y;
          const d = Math.hypot(dx, dy);
          let hot = 0;
          if (d < R) {
            hot = 1 - d / R;
            const push = hot * hot * 26;
            x += (dx / (d || 1)) * push; y += (dy / (d || 1)) * push;
            r += hot * 2.6;
          }
          ctx.fillStyle = hot > 0.02 ? `rgba(255,46,136,${0.35 + hot * 0.65})` : `rgba(0,240,255,${0.28 + wave * 0.1})`;
          ctx.beginPath(); ctx.arc(x, y, Math.max(r, .4), 0, 6.2832); ctx.fill();
        }
      }
    };

    const loop = (t: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.14; mouse.y += (mouse.ty - mouse.y) * 0.14;
      if (visible) draw(t);
      this.raf = requestAnimationFrame(loop);
    };

    const move = (e: PointerEvent) => {
      const r = this.host.getBoundingClientRect();
      mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top;
      if (mouse.x < -999) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
    };
    const leave = () => { mouse.tx = mouse.ty = -9999; mouse.x = mouse.y = -9999; };

    const ro = new ResizeObserver(resize); ro.observe(this.host);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting)); io.observe(this.host);
    const section = this.host.parentElement ?? this.host;
    if (!still) {
      section.addEventListener('pointermove', move, { passive: true });
      section.addEventListener('pointerleave', leave);
      this.raf = requestAnimationFrame(loop);
    }
    this.cleanup.push(() => { ro.disconnect(); io.disconnect(); section.removeEventListener('pointermove', move); section.removeEventListener('pointerleave', leave); });
    resize();
  }

  ngOnDestroy(): void { cancelAnimationFrame(this.raf); this.cleanup.forEach(f => f()); }
}
