import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AnalyticsService } from '../services/analytics.service';
import { environment } from '../../environments/environment';

/**
 * Consent prompt for advertising and analytics storage.
 *
 * This is not decoration: AnalyticsService defaults every Consent Mode signal
 * to "denied" and refuses to load GA4 or the Meta Pixel until consent is
 * granted, so without this prompt the campaigns collect nothing at all.
 */
@Component({
  selector: 'app-consent-banner',
  templateUrl: './consent-banner.component.html',
  styleUrl: './consent-banner.component.css',
})
export class ConsentBannerComponent implements OnInit {
  visible = false;

  constructor(
    private analytics: AnalyticsService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId) || !environment.analytics?.enabled) {
      return;
    }
    // Defer so the prompt does not compete with the page's first paint.
    setTimeout(() => {
      this.visible = !this.analytics.hasAnsweredConsent();
    }, 1200);
  }

  accept(): void {
    this.analytics.grantConsent();
    this.visible = false;
  }

  decline(): void {
    this.analytics.denyConsent();
    this.visible = false;
  }
}
