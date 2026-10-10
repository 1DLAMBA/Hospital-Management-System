import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Captures campaign attribution on the first page of a visit and keeps it for
 * the length of the consideration window, so a signup that happens days after
 * the ad click can still be credited to the campaign that paid for it.
 *
 * First-touch wins: once a visit is attributed we do not overwrite it with a
 * later organic visit, but a NEW paid click does overwrite (last paid click),
 * which is what Google and Meta reconcile against.
 */

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  landing_page?: string;
  referrer?: string;
  captured_at?: number;
}

const STORAGE_KEY = 'ph_attribution';
/** 30 days, matching the default conversion window on Google and Meta. */
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const CLICK_ID_KEYS = ['gclid', 'fbclid'] as const;

@Injectable({ providedIn: 'root' })
export class AttributionService {
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /** Call once per app load, before the first navigation is handled. */
  capture(): void {
    if (!this.isBrowser) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const incoming: Attribution = {};

    UTM_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value) {
        incoming[key] = value.slice(0, 120);
      }
    });
    CLICK_ID_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value) {
        incoming[key] = value.slice(0, 250);
      }
    });

    const hasPaidClick = !!(incoming.gclid || incoming.fbclid);
    const hasCampaign = Object.keys(incoming).length > 0;
    const existing = this.get();

    // Nothing to record and nothing worth refreshing.
    if (!hasCampaign && existing) {
      return;
    }

    if (!hasCampaign && !existing) {
      this.write({
        landing_page: window.location.pathname,
        referrer: document.referrer || undefined,
        captured_at: Date.now(),
      });
      return;
    }

    // A fresh paid click always wins; otherwise keep the first touch.
    if (existing && !hasPaidClick) {
      return;
    }

    this.write({
      ...incoming,
      landing_page: window.location.pathname,
      referrer: document.referrer || undefined,
      captured_at: Date.now(),
    });
  }

  /** Current attribution, or null once it has aged out. */
  get(): Attribution | null {
    if (!this.isBrowser) {
      return null;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as Attribution;
      if (!parsed.captured_at || Date.now() - parsed.captured_at > TTL_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  /**
   * Flat attribution fields to merge into a registration payload, so the API
   * can store the source alongside the account. Returns {} when unattributed.
   */
  asPayload(): Record<string, string> {
    const attribution = this.get();
    if (!attribution) {
      return {};
    }
    const payload: Record<string, string> = {};
    ([...UTM_KEYS, ...CLICK_ID_KEYS] as string[]).forEach((key) => {
      const value = (attribution as Record<string, any>)[key];
      if (value) {
        payload[key] = String(value);
      }
    });
    if (attribution.landing_page) {
      payload['landing_page'] = attribution.landing_page;
    }
    if (attribution.referrer) {
      payload['referrer'] = attribution.referrer;
    }
    return payload;
  }

  /** Human-readable source for event params, e.g. "google / cpc". */
  sourceLabel(): string {
    const attribution = this.get();
    if (!attribution) {
      return 'direct';
    }
    if (attribution.utm_source || attribution.utm_medium) {
      return [attribution.utm_source ?? 'unknown', attribution.utm_medium ?? 'unknown'].join(' / ');
    }
    if (attribution.gclid) {
      return 'google / cpc';
    }
    if (attribution.fbclid) {
      return 'meta / paid_social';
    }
    return attribution.referrer ? 'referral' : 'direct';
  }

  private write(attribution: Attribution): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    } catch {
      /* storage blocked - attribution is best effort */
    }
  }
}
