import { Component } from '@angular/core';
import { AnimatedSilkComponent } from '../../ui/animated-silk/animated-silk.component';

@Component({
  imports: [    
    AnimatedSilkComponent,
  ],
  selector: 'app-shell',
  styleUrl: './shell.css',
  templateUrl: './shell.html',
})
export class Shell {}
