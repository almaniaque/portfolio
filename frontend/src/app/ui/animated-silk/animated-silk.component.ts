import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';

interface Point {
  x: number;
  y: number;
}

interface Ribbon {
  start: Point;
  control1: Point;
  control2: Point;
  end: Point;
  width: number;
  phase: number;
  rgb: readonly [number, number, number];
}

interface Spark {
  x: number;
  y: number;
  radius: number;
  phase: number;
}

@Component({
  selector: 'app-animated-silk',
  standalone: true,
  templateUrl: './animated-silk.component.html',
  styleUrl: './animated-silk.component.css',
})
export class AnimatedSilkComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  /** 0 = immobile, 0.6 = lent, 1.5 = plus dynamique. */
  @Input() speed = 0.6;

  /** Nombre de filaments par voile. 48 est un bon compromis. */
  @Input() strands = 54;

  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private ctx: CanvasRenderingContext2D | null = null;
  private observer?: ResizeObserver;
  private frame = 0;
  private width = 1;
  private height = 1;
  private start = 0;
  private reducedMotion = false;
  private mouseTarget = 0;
  private mouse = 0;
  private destroyed = false;

  private readonly ribbons: Ribbon[] = [
    {
      start: { x: -0.23, y: 0.88 },
      control1: { x: 0.29, y: 1.14 },
      control2: { x: 0.59, y: 0.11 },
      end: { x: 1.19, y: 0.12 },
      width: 0.22,
      phase: 0.1,
      rgb: [119, 87, 255],
    },
    {
      start: { x: -0.14, y: 1.04 },
      control1: { x: 0.19, y: 0.42 },
      control2: { x: 0.66, y: 0.83 },
      end: { x: 1.13, y: -0.19 },
      width: 0.27,
      phase: 2.1,
      rgb: [180, 123, 255],
    },
    {
      start: { x: 0.27, y: 1.21 },
      control1: { x: 0.53, y: 0.84 },
      control2: { x: 0.38, y: 0.04 },
      end: { x: 0.94, y: -0.2 },
      width: 0.19,
      phase: 4.2,
      rgb: [93, 142, 255],
    },
    {
      start: { x: 0.1, y: 0.77 },
      control1: { x: 0.52, y: 0.33 },
      control2: { x: 0.8, y: 0.62 },
      end: { x: 1.21, y: 0.08 },
      width: 0.14,
      phase: 3.2,
      rgb: [208, 155, 255],
    },
  ];

  // Positions déterministes : les étoiles ne sautent pas au redimensionnement.
  private readonly sparks: Spark[] = Array.from({ length: 58 }, (_, index) => ({
    x: this.random(index * 4 + 1),
    y: this.random(index * 4 + 2),
    radius: 0.45 + this.random(index * 4 + 3) * 1.35,
    phase: this.random(index * 4 + 4) * Math.PI * 2,
  }));

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d', { alpha: false });
    if (!this.ctx) return;

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas.parentElement ?? canvas);
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });

    this.zone.runOutsideAngular(() => {
      this.resize();
      if (!this.reducedMotion) {
        this.start = performance.now();
        this.frame = requestAnimationFrame(this.animate);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;

    // Le serveur Angular n'a pas accès aux fonctions du navigateur.
    if (!this.isBrowser) return;

    if (this.frame) {
      window.cancelAnimationFrame(this.frame);
      this.frame = 0;
    }

    this.observer?.disconnect();
    window.removeEventListener('pointermove', this.onPointerMove);
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.mouseTarget = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
  };

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);

    // Plafond à 2 : évite de saturer les écrans haute densité.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(this.width * dpr);
    canvas.height = Math.round(this.height * dpr);
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.render(0);
  }

  private readonly animate = (now: number): void => {
    if (this.destroyed) return;
    if (!document.hidden) {
      const time = ((now - this.start) / 1000) * this.speed;
      this.mouse += (this.mouseTarget - this.mouse) * 0.025;
      this.render(time);
    }
    this.frame = requestAnimationFrame(this.animate);
  };

  private render(time: number): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const w = this.width;
    const h = this.height;
    ctx.clearRect(0, 0, w, h);

    // Fond nuit : les textes et cartes doivent être placés dans un calque supérieur.
    const background = ctx.createLinearGradient(0, 0, w, h);
    background.addColorStop(0, '#060711');
    background.addColorStop(0.53, '#0b0a1b');
    background.addColorStop(1, '#050711');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);

    this.drawGlow(ctx, w * 0.60, h * 0.49, w * 0.53, [64, 37, 170], 0.15);
    this.drawGlow(ctx, w * 0.82, h * 0.24, w * 0.36, [47, 89, 210], 0.12);

    ctx.globalCompositeOperation = 'screen';
    for (const ribbon of this.ribbons) {
      this.drawRibbon(ctx, ribbon, time);
    }
    this.drawSparks(ctx, time);
    ctx.globalCompositeOperation = 'source-over';

    // Dégradé sombre à gauche pour garder le titre parfaitement lisible.
    const shade = ctx.createLinearGradient(0, 0, w * 0.7, 0);
    shade.addColorStop(0, 'rgba(5, 7, 15, 0.94)');
    shade.addColorStop(0.53, 'rgba(5, 7, 15, 0.58)');
    shade.addColorStop(1, 'rgba(5, 7, 15, 0)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, w, h);
  }

  private drawRibbon(ctx: CanvasRenderingContext2D, ribbon: Ribbon, time: number): void {
    const count = Math.max(16, Math.min(110, Math.round(this.strands)));
    const steps = 80;
    const [red, green, blue] = ribbon.rgb;

    // Nappe translucide : elle sert de base au tissage des filaments.
    ctx.beginPath();
    for (let step = 0; step <= steps; step++) {
      const point = this.ribbonPoint(ribbon, step / steps, -1, time);
      if (step === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
    for (let step = steps; step >= 0; step--) {
      const point = this.ribbonPoint(ribbon, step / steps, 1, time);
      ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
    const mist = ctx.createLinearGradient(0, this.height, this.width, 0);
    mist.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 0.013)`);
    mist.addColorStop(0.48, `rgba(${red}, ${green}, ${blue}, 0.09)`);
    mist.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0.024)`);
    ctx.fillStyle = mist;
    ctx.fill();

    // Filaments translucides, serrés : aspect tissu / fibre optique.
    for (let i = 0; i < count; i++) {
      const v = (i / (count - 1)) * 2 - 1;
      const edge = Math.abs(v);
      const bright = Math.pow(1 - edge, 1.4);
      const highlighted = i % 13 === 0;
      const opacity = highlighted ? 0.31 : 0.08 + bright * 0.105;

      ctx.beginPath();
      for (let step = 0; step <= steps; step++) {
        const u = step / steps;
        const point = this.ribbonPoint(ribbon, u, v, time);
        if (step === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.lineWidth = highlighted ? 1.08 : 0.53;
      ctx.strokeStyle = `rgba(${Math.min(255, red + 42)}, ${Math.min(255, green + 51)}, 255, ${opacity})`;
      ctx.shadowColor = highlighted ? `rgba(${red}, ${green}, 255, 0.65)` : 'transparent';
      ctx.shadowBlur = highlighted ? 9 : 0;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Deux bords éclairés soulignent les plis du voile.
    for (const v of [-0.94, 0.94]) {
      ctx.beginPath();
      for (let step = 0; step <= steps; step++) {
        const point = this.ribbonPoint(ribbon, step / steps, v, time);
        if (step === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.strokeStyle = `rgba(${red + 30}, ${green + 35}, 255, 0.35)`;
      ctx.lineWidth = 1.1;
      ctx.shadowColor = `rgb(${red}, ${green}, ${blue})`;
      ctx.shadowBlur = 13;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  private ribbonPoint(ribbon: Ribbon, u: number, v: number, time: number): Point {
    const { start, control1, control2, end, phase } = ribbon;
    const x = this.bezier(start.x, control1.x, control2.x, end.x, u) * this.width;
    const y = this.bezier(start.y, control1.y, control2.y, end.y, u) * this.height;
    const dx = this.bezierDerivative(start.x, control1.x, control2.x, end.x, u) * this.width;
    const dy = this.bezierDerivative(start.y, control1.y, control2.y, end.y, u) * this.height;
    const length = Math.hypot(dx, dy) || 1;
    const normalX = -dy / length;
    const normalY = dx / length;
    const envelope = Math.pow(Math.max(0, Math.sin(Math.PI * u)), 0.43);

    const flow =
      Math.sin(u * 10.5 + phase + time * 0.34) * 0.036 * this.height * envelope +
      Math.sin(u * 19.0 - phase + time * 0.17) * 0.011 * this.height * envelope;
    const twist = Math.cos(u * 9.5 - phase * 0.8 + time * 0.26);
    const fold = Math.sin(u * 18.2 + phase + time * 0.41);
    const spread = ribbon.width * this.height * envelope;
    const offset = v * spread * (0.14 + twist * 0.73) + v * v * fold * spread * 0.14;

    return {
      x: x + normalX * offset + this.mouse * envelope * 11,
      y: y + normalY * offset + flow + v * spread * Math.sin(u * 6 + phase + time * 0.2) * 0.12,
    };
  }

  private drawGlow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    rgb: readonly [number, number, number],
    alpha: number,
  ): void {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${rgb.join(',')},${alpha})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  private drawSparks(ctx: CanvasRenderingContext2D, time: number): void {
    for (const spark of this.sparks) {
      const x = spark.x * this.width;
      const y = spark.y * this.height;
      const shimmer = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(time * 1.4 + spark.phase));
      ctx.beginPath();
      ctx.arc(x, y, spark.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(143, 148, 255, ${shimmer})`;
      ctx.fill();
    }
  }

  private bezier(a: number, b: number, c: number, d: number, t: number): number {
    const s = 1 - t;
    return s * s * s * a + 3 * s * s * t * b + 3 * s * t * t * c + t * t * t * d;
  }

  private bezierDerivative(a: number, b: number, c: number, d: number, t: number): number {
    const s = 1 - t;
    return 3 * s * s * (b - a) + 6 * s * t * (c - b) + 3 * t * t * (d - c);
  }

  private random(seed: number): number {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
    return value - Math.floor(value);
  }
}
