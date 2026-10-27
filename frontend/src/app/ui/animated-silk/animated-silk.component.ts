import { Component, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';

type Point = Readonly<{ x: number; y: number }>;
type Ribbon = Readonly<{
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
  spread: number;
  phase: number;
}>;

const BACK: Ribbon = {
  p0: { x: -170, y: 780 },
  p1: { x: 420, y: 1090 },
  p2: { x: 850, y: 180 },
  p3: { x: 1700, y: 5 },
  spread: 205,
  phase: 0.6,
};
const MIDDLE: Ribbon = {
  p0: { x: 80, y: 850 },
  p1: { x: 560, y: 160 },
  p2: { x: 960, y: 970 },
  p3: { x: 1590, y: 160 },
  spread: 230,
  phase: 2.1,
};
const FRONT: Ribbon = {
  p0: { x: 260, y: 1010 },
  p1: { x: 820, y: 690 },
  p2: { x: 950, y: 30 },
  p3: { x: 1520, y: -180 },
  spread: 230,
  phase: 4.1,
};

/**
 * Voiles SVG animés pour le hero NeoForge.
 * Aucun accès à window, document, Canvas ou requestAnimationFrame.
 * Compatible Angular SSR et hydratation.
 */
@Component({
  selector: 'app-animated-silk',
  standalone: true,
  templateUrl: './animated-silk.component.html',
  styleUrl: './animated-silk.component.css',
})
export class AnimatedSilkComponent implements OnChanges {
  /** Compatibilité avec les attributs déjà présents dans main-page.html. */
  @Input() speed = 0.6;
  @Input() strands = 54;

  readonly backSurface = this.surface(BACK);
  readonly middleSurface = this.surface(MIDDLE);
  readonly frontSurface = this.surface(FRONT);
  backFibers: string[] = [];
  middleFibers: string[] = [];
  frontFibers: string[] = [];

  @HostBinding('style.--nf-back-time')
  get backTime(): string { return `${(14 / Math.max(0.1, this.speed)).toFixed(1)}s`; }

  @HostBinding('style.--nf-middle-time')
  get middleTime(): string { return `${(11 / Math.max(0.1, this.speed)).toFixed(1)}s`; }

  @HostBinding('style.--nf-front-time')
  get frontTime(): string { return `${(16 / Math.max(0.1, this.speed)).toFixed(1)}s`; }

  @HostBinding('class.nf-paused')
  get paused(): boolean { return this.speed <= 0; }

  readonly stars = Array.from({ length: 70 }, (_, i) => ({
    x: 300 + this.random(i * 11 + 1) * 1300,
    y: 25 + this.random(i * 11 + 2) * 750,
    radius: 0.5 + this.random(i * 11 + 3) * 1.6,
    opacity: 0.25 + this.random(i * 11 + 4) * 0.65,
  }));

  constructor() { this.updateFibers(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['strands']) this.updateFibers();
  }

  private updateFibers(): void {
    const count = Math.min(95, Math.max(12, Math.round(this.strands)));
    this.backFibers = this.fibers(BACK, Math.round(count * 0.9));
    this.middleFibers = this.fibers(MIDDLE, count);
    this.frontFibers = this.fibers(FRONT, Math.round(count * 1.1));
  }

  private fibers(ribbon: Ribbon, count: number): string[] {
    return Array.from({ length: count }, (_, i) => {
      const v = -0.98 + (1.96 * i) / (count - 1);
      return this.line(ribbon, v);
    });
  }

  private surface(ribbon: Ribbon): string {
    const first = this.points(ribbon, -0.98);
    const second = this.points(ribbon, 0.98).reverse();
    return `M ${first.join(' L ')} L ${second.join(' L ')} Z`;
  }

  private line(ribbon: Ribbon, v: number): string {
    return `M ${this.points(ribbon, v).join(' L ')}`;
  }

  private points(ribbon: Ribbon, v: number): string[] {
    const output: string[] = [];
    for (let i = 0; i <= 75; i++) {
      const u = i / 75;
      const base = this.bezierPoint(ribbon, u);
      const deriv = this.derivative(ribbon, u);
      const length = Math.hypot(deriv.x, deriv.y) || 1;
      const envelope = Math.pow(Math.max(0, Math.sin(Math.PI * u)), 0.42);
      const twist = 0.35 + 0.67 * Math.cos(u * 9.5 + ribbon.phase);
      const ripple = Math.sin(u * 16.0 + ribbon.phase) * 0.13;
      const offset = v * ribbon.spread * envelope * (twist + ripple * v);
      const wave = Math.sin(u * 12.0 + ribbon.phase) * 24 * envelope;
      const x = base.x - (deriv.y / length) * offset;
      const y = base.y + (deriv.x / length) * offset + wave;
      output.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return output;
  }

  private bezierPoint(r: Ribbon, t: number): Point {
    const s = 1 - t;
    const a = s * s * s;
    const b = 3 * s * s * t;
    const c = 3 * s * t * t;
    const d = t * t * t;
    return {
      x: a * r.p0.x + b * r.p1.x + c * r.p2.x + d * r.p3.x,
      y: a * r.p0.y + b * r.p1.y + c * r.p2.y + d * r.p3.y,
    };
  }

  private derivative(r: Ribbon, t: number): Point {
    const s = 1 - t;
    return {
      x: 3 * s * s * (r.p1.x - r.p0.x) + 6 * s * t * (r.p2.x - r.p1.x) + 3 * t * t * (r.p3.x - r.p2.x),
      y: 3 * s * s * (r.p1.y - r.p0.y) + 6 * s * t * (r.p2.y - r.p1.y) + 3 * t * t * (r.p3.y - r.p2.y),
    };
  }

  private random(seed: number): number {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
    return value - Math.floor(value);
  }
}
