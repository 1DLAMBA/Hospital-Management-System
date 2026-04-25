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
import { SeoService } from './services/seo.service';
import { StructuredDataService } from './services/structured-data.service';
import { getSeoConfigByRoute } from './config/seo-config';



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
     private contexts: ChildrenOutletContexts,
     private seoService: SeoService,
     private structuredDataService: StructuredDataService) {}

    ngOnInit(): void {
      // Initialize SEO with default metadata
      this.seoService.resetToDefaults();
      this.structuredDataService.addStructuredData(
        this.structuredDataService.generateOrganizationSchema()
      );

      this.spinner.show();
    setTimeout(() => {
      /** spinner ends after 5 seconds */
      this.spinner.hide();
    }, 2000);
    
    // Check initial route
    this.updateNavbarFooterVisibility();
    this.updatePageSeo();
    
    // Subscribe to route changes
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateNavbarFooterVisibility();
      this.updatePageSeo();
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

    /**
     * Update page SEO metadata based on current route
     */
    private updatePageSeo(): void {
      const currentPath = this.router.url;
      
      // Get route data for custom SEO metadata
      let route = this.activatedRoute.firstChild;
      let seoData = null;
      
      while (route) {
        if (route.snapshot.data?.['seo']) {
          seoData = route.snapshot.data['seo'];
          break;
        }
        route = route.firstChild;
      }
      
      // Use custom SEO data from route or fall back to config
      const metadata = seoData || getSeoConfigByRoute(currentPath);
      this.seoService.updatePageSeo(metadata);

      // Update structured data based on route
      if (currentPath === '/') {
        this.structuredDataService.addStructuredData(
          this.structuredDataService.generateHomePageSchema()
        );
      } else if (currentPath === '/services') {
        this.structuredDataService.addStructuredData(
          this.structuredDataService.generateServicePageSchema()
        );
      } else if (currentPath === '/about') {
        this.structuredDataService.addStructuredData(
          this.structuredDataService.generateAboutPageSchema()
        );
      } else if (currentPath === '/contact') {
        this.structuredDataService.addStructuredData(
          this.structuredDataService.generateContactPageSchema()
        );
      }
    }
    
    getRouteAnimationData() {
      return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
    }
    
  shouldShowNavbarAndFooter(): boolean {
    return this.showNavbarAndFooter;
  }
}
