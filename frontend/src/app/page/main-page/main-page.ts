import { Component } from '@angular/core';
import { AnimatedSilkComponent } from '../../ui/animated-silk/animated-silk.component';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';
import { Button } from '../../ui/button/button';
import { Card } from '../../ui/card/card';
import { Badge } from '../../ui/badge/badge';
import { Icon } from '../../ui/icon/icon';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    AnimatedSilkComponent, 
    Navbar,
    Footer, 
    Button, 
    Card, 
    Badge, 
    Icon
  ],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPage {}
