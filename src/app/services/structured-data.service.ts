import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class StructuredDataService {
  private baseUrl = 'https://phoenixmed.online';
  private scriptId = 'structured-data-schema';

  constructor(private meta: Meta) {}

  /**
   * Add structured data (JSON-LD) to page
   */
  addStructuredData(data: StructuredData): void {
    this.removeStructuredData();
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = this.scriptId;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /**
   * Remove existing structured data
   */
  removeStructuredData(): void {
    const existingScript = document.getElementById(this.scriptId);
    if (existingScript) {
      existingScript.remove();
    }
  }

  /**
   * Generate organization schema for medical business
   */
  generateOrganizationSchema(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'MedicalBusiness',
      'name': 'Phoenix',
      'url': this.baseUrl,
      'description': 'AI-powered healthcare platform for online doctor booking, medical records, and health guidance.',
      'logo': `${this.baseUrl}/assets/Phoenix.png`,
      'medicalSpecialty': 'General Practice',
      'availableService': [
        {
          '@type': 'MedicalTherapy',
          'name': 'Online Doctor Appointments',
          'description': 'Book appointments with licensed specialists instantly'
        },
        {
          '@type': 'MedicalTherapy',
          'name': 'AI Health Assistant',
          'description': 'Get 24/7 health guidance from AI-powered assistant'
        },
        {
          '@type': 'MedicalTherapy',
          'name': 'Medical Records Access',
          'description': 'Securely manage and access your medical records'
        }
      ],
      'sameAs': [
        'https://www.facebook.com/phoenixmed',
        'https://www.twitter.com/phoenixmed',
        'https://www.instagram.com/phoenixmed'
      ]
    };
  }

  /**
   * Generate home page schema
   */
  generateHomePageSchema(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Phoenix - AI Health Assistant & Online Doctor Booking',
      'url': this.baseUrl,
      'description': 'Ask your AI health assistant 24/7, book a doctor in minutes, and manage your medical records securely.',
      'image': {
        '@type': 'ImageObject',
        'url': `${this.baseUrl}/assets/heroimg.png`,
        'width': 1200,
        'height': 630
      }
    };
  }

  /**
   * Generate service page schema
   */
  generateServicePageSchema(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Phoenix Services - AI Doctor, Appointments & Medical Records',
      'url': `${this.baseUrl}/services`,
      'description': 'Explore Phoenix healthcare services including AI health assistant, online doctor booking, and medical records management.',
      'image': {
        '@type': 'ImageObject',
        'url': `${this.baseUrl}/assets/servicenurse1.png`,
        'width': 1200,
        'height': 630
      }
    };
  }

  /**
   * Generate about page schema
   */
  generateAboutPageSchema(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Phoenix',
      'url': `${this.baseUrl}/about`,
      'description': 'About Phoenix - Transforming healthcare through AI and technology.',
      'image': `${this.baseUrl}/assets/mission.png`
    };
  }

  /**
   * Generate contact page schema
   */
  generateContactPageSchema(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': 'Phoenix',
      'url': `${this.baseUrl}/contact`,
      'contactPoint': {
        '@type': 'ContactPoint',
        'contactType': 'Customer Support',
        'availableLanguage': 'en'
      }
    };
  }
}
