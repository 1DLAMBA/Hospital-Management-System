import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

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
    private title: Title
  ) {}

  /**
   * Update page title and meta tags
   */
  updatePageSeo(metadata: SeoMetadata): void {
    // Update title
    if (metadata.title) {
      this.title.setTitle(metadata.title);
      this.meta.updateTag({ name: 'og:title', content: metadata.ogTitle || metadata.title });
    }

    // Update description
    if (metadata.description) {
      this.meta.updateTag({ name: 'description', content: metadata.description });
      this.meta.updateTag({ name: 'og:description', content: metadata.ogDescription || metadata.description });
    }

    // Update keywords if provided
    if (metadata.keywords) {
      this.meta.updateTag({ name: 'keywords', content: metadata.keywords });
    }

    // Update OG image
    if (metadata.ogImage) {
      this.meta.updateTag({ name: 'og:image', content: metadata.ogImage });
    }

    // Update canonical URL
    if (metadata.canonical) {
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute('href', metadata.canonical);
      } else {
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = metadata.canonical;
        document.head.appendChild(link);
      }
    }

    // Update OG URL
    if (metadata.ogUrl) {
      this.meta.updateTag({ name: 'og:url', content: metadata.ogUrl });
    }

    // Update robots meta tag
    if (metadata.robotsIndex !== undefined) {
      const robotsContent = metadata.robotsIndex ? 'index, follow' : 'noindex, nofollow';
      this.meta.updateTag({ name: 'robots', content: robotsContent });
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
