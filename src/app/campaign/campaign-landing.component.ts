import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { CampaignContent, CampaignCta, getCampaignContent } from './campaign-content';
import { AnalyticsService } from '../services/analytics.service';
import { AttributionService } from '../services/attribution.service';

/**
 * Single landing-page component driven by route data ({ campaign: 'patients' }).
 * The homepage sells the whole product; these pages sell one thing to one
 * audience and give them one action, which is what paid traffic needs.
 */
@Component({
  selector: 'app-campaign-landing',
  templateUrl: './campaign-landing.component.html',
  styleUrl: './campaign-landing.component.css',
})
export class CampaignLandingComponent implements OnInit, OnDestroy {
  content!: CampaignContent;
  openFaq: number | null = 0;

  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analytics: AnalyticsService,
    private attribution: AttributionService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.data.subscribe((data) => {
      this.content = getCampaignContent(data['campaign']);

      if (isPlatformBrowser(this.platformId)) {
        this.analytics.track('campaign_landing_view', {
          campaign_page: this.content.key,
          traffic_source: this.attribution.sourceLabel(),
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  /** Every CTA routes through here so no click can slip past the tracker. */
  onCtaClick(cta: CampaignCta, location: string): void {
    this.analytics.ctaClicked(cta.label, this.content.key + ':' + location);
    if (cta.route === '/register') {
      this.analytics.signUpStarted(this.content.audience);
    }
    this.router.navigate([cta.route], { queryParams: cta.queryParams });
  }

  toggleFaq(index: number): void {
    this.openFaq = this.openFaq === index ? null : index;
  }
}
