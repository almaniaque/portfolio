import { Component, signal } from '@angular/core';
import { Icon } from '../../ui/icon/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    Icon
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  readonly menuOpen = signal(false);
  toggleMenu(): void { this.menuOpen.update(open => !open); }
  closeMenu(): void { this.menuOpen.set(false); }
}
