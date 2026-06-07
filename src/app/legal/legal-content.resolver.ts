import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResolveFn } from '@angular/router';
import { getLegalPageConfig } from '../config/legal-pages.config';

export const legalContentResolver: ResolveFn<string> = (route) => {
  const slug = route.data['legalSlug'] as string;
  const config = getLegalPageConfig(slug);

  if (!config) {
    throw new Error(`Unknown legal page slug: ${slug}`);
  }

  return inject(HttpClient).get(config.assetPath, { responseType: 'text' });
};
