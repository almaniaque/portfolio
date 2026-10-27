import { Component, Input } from '@angular/core';

/** Affiche une icône depuis public/icon. La source originale reste dans src/app/icon. */
@Component({
  selector: 'app-icon',
  standalone: true,
  templateUrl: './icon.html',
  styleUrl: './icon.css',
})
export class Icon {
  @Input({ required: true }) name = '';
  @Input() label = '';
  get src(): string { return `/icon/${this.name}.svg`; }
}
