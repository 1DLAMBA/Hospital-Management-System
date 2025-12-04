import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChildrenOutletContexts, RouterLink, RouterOutlet } from '@angular/router';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AppModule } from './app.module';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { SlideElement, slideInAnimation } from './animate';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';



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
export class AppComponent implements OnInit, OnDestroy {
  
  
  title = 'hospital-management-system';
  showNavbarAndFooter: boolean = true;
  private routerSubscription?: Subscription;

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
    
    // Check initial route
    this.updateNavbarFooterVisibility();
    
    // Subscribe to route changes
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateNavbarFooterVisibility();
    });
    }
    
    ngOnDestroy(): void {
      if (this.routerSubscription) {
        this.routerSubscription.unsubscribe();
      }
    }
    
    updateNavbarFooterVisibility(): void {
      // Check if current URL starts with /panel - if so, hide navbar and footer
      const currentUrl = this.router.url;
      if (currentUrl.startsWith('/panel')) {
        this.showNavbarAndFooter = false;
        return;
      }
      
      // Also check route data as fallback
      let route = this.activatedRoute.firstChild;
      while (route) {
        if (route.snapshot.routeConfig?.data?.['hideNavbarAndFooter']) {
          this.showNavbarAndFooter = false;
          return;
        }
        route = route.firstChild;
      }
      this.showNavbarAndFooter = true;
    }
    
    getRouteAnimationData() {
      return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
    }
    
  shouldShowNavbarAndFooter(): boolean {
    return this.showNavbarAndFooter;
  }
}
