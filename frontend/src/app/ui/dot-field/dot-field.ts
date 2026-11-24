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
    let w = 0, h = 0, visible = true;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    // A braided torus knot, projected into the right half of the cover.
    const strands = Array.from({ length: 46 }, (_, strand) => {
      const phase = strand * 2 * Math.PI / 46;
      return Array.from({ length: 241 }, (_, index) => {
        const t = index * Math.PI / 120;
        const twist = phase + 3 * t;
        const radius = 1.18 + .48 * Math.cos(3 * t) + .19 * Math.cos(twist);
        return { x: radius * Math.cos(2 * t), y: radius * Math.sin(2 * t),
          z: .61 * Math.sin(3 * t) + .19 * Math.sin(twist) };
      });
    });
    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      const tilt = .85 + .18 * Math.sin(time * .00019) + mouse.y * .12;
      const turn = -.48 + .22 * Math.sin(time * .00014) + mouse.x * .16;
      const scale = Math.min(w * .25, h * .32);
      const cx = w * .5, cy = h * .51;
      const ct = Math.cos(tilt), st = Math.sin(tilt), cr = Math.cos(turn), sr = Math.sin(turn);
      strands.forEach((strand, i) => {
        ctx.beginPath();
        strand.forEach((p, j) => {
          const y = p.y * ct - p.z * st;
          const depth = p.y * st + p.z * ct;
          const k = scale / (1 - depth * .12);
          const x = cx + (p.x * cr - y * sr) * k;
          const py = cy + (p.x * sr + y * cr) * k;
          if (j === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
        });
        const light = .5 + .5 * Math.cos(i * Math.PI / 23);
        ctx.strokeStyle = `hsla(${259 + 26 * light},95%,${45 + 43 * light}%,.87)`;
        ctx.lineWidth = .7 + light;
        ctx.stroke();
      });
    };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = this.host.clientWidth; h = this.host.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    };
    const loop = (t: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.14; mouse.y += (mouse.ty - mouse.y) * 0.14;
      if (visible) draw(t);
      this.raf = requestAnimationFrame(loop);
    };

    const move = (e: PointerEvent) => {
      const r = this.host.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / Math.max(w, 1) - .5; mouse.ty = (e.clientY - r.top) / Math.max(h, 1) - .5;

    };
    const leave = () => { mouse.tx = mouse.ty = 0; };

    const ro = new ResizeObserver(resize); ro.observe(this.host);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting)); io.observe(this.host);
    const section = this.host.parentElement ?? this.host;
    if (!still) {
      section.addEventListener('pointermove', move, { passive: true });
      section.addEventListener('pointerleave', leave);
      this.cleanup.push(() => cancelAnimationFrame(this.raf));
      this.raf = requestAnimationFrame(loop);
    }
    this.cleanup.push(() => { ro.disconnect(); io.disconnect(); section.removeEventListener('pointermove', move); section.removeEventListener('pointerleave', leave); });
    resize();
  }

  ngOnDestroy(): void { this.cleanup.forEach(f => f()); }
}
