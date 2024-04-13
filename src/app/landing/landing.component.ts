import { Component } from '@angular/core';
import { SlideElement } from '../animate';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  animations: [SlideElement]
})
export class LandingComponent {
  visible: boolean = false;

  showDialog() {
      this.visible = true;
  }
}
