export interface LegalPageConfig {
  slug: string;
  title: string;
  assetPath: string;
}

export const LEGAL_PAGES: Record<string, LegalPageConfig> = {
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    assetPath: 'assets/phoenixmed-privacy-policy.md',
  },
  'terms-of-service': {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    assetPath: 'assets/phoenixmed-terms-of-service.md',
  },
  'medical-disclaimer': {
    slug: 'medical-disclaimer',
    title: 'Medical Disclaimer',
    assetPath: 'assets/phoenixmed-medical-disclaimer.md',
  },
};

export function getLegalPageConfig(slug: string): LegalPageConfig | undefined {
  return LEGAL_PAGES[slug];
}

export function getLegalPageSlugs(): string[] {
  return Object.keys(LEGAL_PAGES);
}
