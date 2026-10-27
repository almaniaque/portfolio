import { Component, Input } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [Icon],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  @Input({ required: true }) label = '';
  @Input({ required: true }) href = '#accueil';
  @Input() icon = '';
  @Input() variant: 'primary' | 'outline' | 'quiet' = 'primary';
}
