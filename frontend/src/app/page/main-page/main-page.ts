import { Component } from '@angular/core';
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
  readonly github = 'https://github.com/almaniaque';
  readonly amyRepo = 'https://github.com/almaniaque/LepetitAtelierd-amy';
}
