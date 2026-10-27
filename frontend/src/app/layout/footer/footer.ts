import { Component } from '@angular/core';
import { Icon } from '../../ui/icon/icon';

@Component({ 
    selector: 'app-footer', 
    standalone: true, 
    imports: [
        Icon
    ], 
    templateUrl: './footer.html', 
    styleUrl: './footer.css' 
})
export class Footer { }
