import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

export interface SeoMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  robotsIndex?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private baseUrl = 'https://phoenixmed.online';

  constructor(
    private meta: Meta,
    private title: Title,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  /**
   * Update page title and meta tags
   */
  updatePageSeo(metadata: SeoMetadata): void {
    if (metadata.title) {
      this.title.setTitle(metadata.title);
      this.updateOrAddTag({ property: 'og:title', content: metadata.ogTitle || metadata.title });
      this.updateOrAddTag({ name: 'twitter:title', content: metadata.ogTitle || metadata.title });
    }

    if (metadata.description) {
      this.updateOrAddTag({ name: 'description', content: metadata.description });
      this.updateOrAddTag({ property: 'og:description', content: metadata.ogDescription || metadata.description });
      this.updateOrAddTag({ name: 'twitter:description', content: metadata.ogDescription || metadata.description });
    }

    if (metadata.keywords) {
      this.updateOrAddTag({ name: 'keywords', content: metadata.keywords });
    }

    if (metadata.ogImage) {
      this.updateOrAddTag({ property: 'og:image', content: metadata.ogImage });
      this.updateOrAddTag({ name: 'twitter:image', content: metadata.ogImage });
    }

    if (metadata.canonical) {
      this.updateCanonical(metadata.canonical);
    }

    if (metadata.ogUrl) {
      this.updateOrAddTag({ property: 'og:url', content: metadata.ogUrl });
    }

    if (metadata.robotsIndex !== undefined) {
      const robotsContent = metadata.robotsIndex ? 'index, follow' : 'noindex, nofollow';
      this.updateOrAddTag({ name: 'robots', content: robotsContent });
    }
  }

  private updateOrAddTag(tag: { name?: string; property?: string; content: string }): void {
    const updated = this.meta.updateTag(tag);
    if (!updated) {
      this.meta.addTag(tag);
    }
  }

  private updateCanonical(url: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', url);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = url;
      document.head.appendChild(link);
    }
  }

  /**
   * Reset to default SEO metadata
   */
  resetToDefaults(): void {
    const defaults: SeoMetadata = {
      title: 'Phoenix - AI Health Assistant & Online Doctor Booking',
      description: 'Ask your AI health assistant 24/7, book a doctor in minutes, and manage your medical records securely. Phoenix puts your healthcare in your hands.',
      keywords: 'online doctor, AI health assistant, book doctor online, medical records, healthcare platform',
      ogImage: `${this.baseUrl}/assets/Phoenix.png`,
      ogUrl: this.baseUrl,
      canonical: this.baseUrl,
      robotsIndex: true
    };
    this.updatePageSeo(defaults);
  }

  /**
   * Set basic page metadata for quick updates
   */
  setPageMetadata(title: string, description: string, path: string = '/'): void {
    const metadata: SeoMetadata = {
      title,
      description,
      ogTitle: title,
      ogDescription: description,
      ogUrl: `${this.baseUrl}${path}`,
      canonical: `${this.baseUrl}${path}`
    };
    this.updatePageSeo(metadata);
  }
}
