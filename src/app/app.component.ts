import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChildrenOutletContexts, RouterLink, RouterOutlet } from '@angular/router';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AppModule } from './app.module';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { SlideElement, slideInAnimation } from './animate';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet,AppModule,
        NgxSpinnerModule,
        DialogModule, ToastModule, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [slideInAnimation, SlideElement]
  // providers: [MessageService]
})
export class AppComponent implements OnInit {
  
  
  title = 'hospital-management-system';
  constructor(private router: Router,
     private activatedRoute: ActivatedRoute,
     private spinner: NgxSpinnerService,
     private contexts: ChildrenOutletContexts) {}

    ngOnInit(): void {
      this.spinner.show();
    setTimeout(() => {
      /** spinner ends after 5 seconds */
      this.spinner.hide();
    }, 2000);
    }
    getRouteAnimationData() {
      return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
    }
  shouldShowNavbarAndFooter(): boolean {
    // Check the current route and decide whether to show navbar and footer
    return !this.activatedRoute.firstChild?.snapshot.routeConfig?.data?.['hideNavbarAndFooter'];
  }
}
