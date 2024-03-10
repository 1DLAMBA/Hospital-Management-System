import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AppModule } from './app.module';
import { DialogModule } from 'primeng/dialog';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet,AppModule,
    DialogModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  title = 'hospital-management-system';
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}
  shouldShowNavbarAndFooter(): boolean {
    // Check the current route and decide whether to show navbar and footer
    return !this.activatedRoute.firstChild?.snapshot.routeConfig?.data?.['hideNavbarAndFooter'];
  }
}
