import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChildrenOutletContexts, RouterLink, RouterOutlet } from '@angular/router';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AppModule } from './app.module';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
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
  // Route animations disabled for SSR/prerender compatibility
  // providers: [MessageService]
})
export class AppComponent implements OnInit, OnDestroy {
  showNavbarAndFooter: boolean = true;
  private routerSubscription?: Subscription;

  constructor(private router: Router,
     private activatedRoute: ActivatedRoute,
     private spinner: NgxSpinnerService,
     private contexts: ChildrenOutletContexts,
     private seoService: SeoService,
     private structuredDataService: StructuredDataService,
     @Inject(PLATFORM_ID) private platformId: object) {}

    ngOnInit(): void {
      // Initialize SEO with default metadata
      this.seoService.resetToDefaults();
      this.structuredDataService.addStructuredData(
        this.structuredDataService.generateOrganizationSchema()
      );

      if (isPlatformBrowser(this.platformId)) {
        this.spinner.show();
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
      }
    
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
      } else if (currentPath === '/privacy-policy') {
        this.structuredDataService.addStructuredData(
          this.structuredDataService.generateLegalPageSchema('Privacy Policy', '/privacy-policy')
        );
      } else if (currentPath === '/terms-of-service') {
        this.structuredDataService.addStructuredData(
          this.structuredDataService.generateLegalPageSchema('Terms of Service', '/terms-of-service')
        );
      } else if (currentPath === '/medical-disclaimer') {
        this.structuredDataService.addStructuredData(
          this.structuredDataService.generateLegalPageSchema('Medical Disclaimer', '/medical-disclaimer')
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
