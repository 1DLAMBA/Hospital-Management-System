import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

/**
 * Consent state persisted for the visitor. Google Consent Mode v2 requires the
 * analytics/ad storage signals to be set BEFORE any tag fires, so we always send
 * a "default" (denied) state first and only upgrade once the visitor accepts.
 */
export type ConsentState = 'granted' | 'denied';

export interface ConversionPayload {
  [key: string]: string | number | boolean | undefined;
}

const CONSENT_KEY = 'ph_consent_ads';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: any;
    _fbq?: any;
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly isBrowser: boolean;
  private tagsLoaded = false;
  /** Events fired before the visitor consented, replayed once consent lands. */
  private queue: Array<{ name: string; params: ConversionPayload }> = [];

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /** Called once from AppComponent. Safe to call on the server (no-ops). */
  init(): void {
    if (!this.isBrowser || !environment.analytics?.enabled) {
      return;
    }
    this.bootstrapGtagStub();
    this.applyConsent(this.storedConsent() ?? 'denied', { persist: false });
    if (this.storedConsent() === 'granted') {
      this.loadTags();
    }
  }

  /** Has the visitor answered the consent prompt yet? */
  hasAnsweredConsent(): boolean {
    return this.storedConsent() !== null;
  }

  grantConsent(): void {
    this.applyConsent('granted', { persist: true });
    this.loadTags();
  }

  denyConsent(): void {
    this.applyConsent('denied', { persist: true });
  }

  trackPageView(path: string, title?: string): void {
    if (!this.ready()) {
      return;
    }
    window.gtag?.('event', 'page_view', {
      page_path: path,
      page_title: title ?? document.title,
      page_location: window.location.href,
    });
    window.fbq?.('track', 'PageView');
  }

  /**
   * Generic event. Mirrors to GA4 always; mirrors to the Meta Pixel only for the
   * standard event names Meta recognises, otherwise sends a custom event.
   */
  track(name: string, params: ConversionPayload = {}): void {
    if (!this.isBrowser || !environment.analytics?.enabled) {
      return;
    }
    if (!this.tagsLoaded) {
      this.queue.push({ name, params });
      return;
    }
    window.gtag?.('event', name, params);
  }

  // --- Named conversions -------------------------------------------------
  // Keeping these as methods (rather than raw strings at call sites) means the
  // event taxonomy lives in one file and cannot drift between components.

  signUpStarted(audience: string): void {
    this.track('sign_up_started', { audience });
    this.metaTrack('Lead', { content_category: audience });
  }

  signUpRoleSelected(userType: string): void {
    this.track('sign_up_role_selected', { user_type: userType });
  }

  signUpCompleted(userType: string): void {
    this.track('sign_up', { method: 'email', user_type: userType });
    this.metaTrack('CompleteRegistration', { content_name: userType, status: true });
  }

  ctaClicked(cta: string, location: string): void {
    this.track('cta_click', { cta_name: cta, cta_location: location });
  }

  // --- internals ---------------------------------------------------------

  private metaTrack(standardEvent: string, params: ConversionPayload = {}): void {
    if (!this.ready()) {
      return;
    }
    window.fbq?.('track', standardEvent, params);
  }

  private ready(): boolean {
    return this.isBrowser && !!environment.analytics?.enabled && this.tagsLoaded;
  }

  private storedConsent(): ConsentState | null {
    if (!this.isBrowser) {
      return null;
    }
    try {
      const value = localStorage.getItem(CONSENT_KEY);
      return value === 'granted' || value === 'denied' ? value : null;
    } catch {
      return null;
    }
  }

  private applyConsent(state: ConsentState, opts: { persist: boolean }): void {
    if (!this.isBrowser) {
      return;
    }
    if (opts.persist) {
      try {
        localStorage.setItem(CONSENT_KEY, state);
      } catch {
        /* storage blocked - consent stays session-only */
      }
    }
    const signals = {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state,
    };
    window.gtag?.('consent', opts.persist ? 'update' : 'default', signals);
  }

  /** Defines gtag/dataLayer synchronously so consent can be queued before load. */
  private bootstrapGtagStub(): void {
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      } as any;
    }
  }

  private loadTags(): void {
    if (this.tagsLoaded || !this.isBrowser) {
      return;
    }
    const ga4 = environment.analytics?.ga4MeasurementId;
    const pixel = environment.analytics?.metaPixelId;

    if (ga4) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ga4;
      document.head.appendChild(script);
      window.gtag?.('js', new Date());
      window.gtag?.('config', ga4, { send_page_view: false });
    }

    if (pixel) {
      this.loadMetaPixel(pixel);
    }

    this.tagsLoaded = true;
    this.flushQueue();
  }

  private loadMetaPixel(pixelId: string): void {
    if (window.fbq) {
      return;
    }
    const fbq: any = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    window.fbq('init', pixelId);
  }

  private flushQueue(): void {
    if (!this.tagsLoaded) {
      return;
    }
    const pending = this.queue.splice(0, this.queue.length);
    pending.forEach((event) => window.gtag?.('event', event.name, event.params));
  }
}
