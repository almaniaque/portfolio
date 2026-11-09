import { Component, afterNextRender, signal } from '@angular/core';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';
import { DotField } from '../../ui/dot-field/dot-field';
import { Icon } from '../../ui/icon/icon';
import { Reveal } from '../../ui/motion/motion';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [Navbar, Footer, DotField, Icon, Reveal],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPage {
  readonly flipped = signal<Record<string, boolean>>({});
  toggle(key: string): void { this.flipped.update(f => ({ ...f, [key]: !f[key] })); }

  constructor() {
    // Affiche les captures réelles seulement si elles existent (sinon la maquette reste visible).
    afterNextRender(() => document.querySelectorAll<HTMLImageElement>('.shot').forEach(img => {
      const ok = () => img.classList.add('loaded');
      if (img.complete && img.naturalWidth > 0) ok(); else img.addEventListener('load', ok, { once: true });
    }));
  }

  readonly github = 'https://github.com/almaniaque';
  readonly amyRepo = 'https://github.com/almaniaque/LepetitAtelierd-amy';
}
