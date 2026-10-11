import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { PhoenixRouteReuseStrategy } from './route-reuse';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideClientHydration(),
    MessageService, 
    importProvidersFrom(TranslateModule.forRoot()),
    provideHttpClient(withFetch()),
    provideMarkdown(),
    { provide: RouteReuseStrategy, useClass: PhoenixRouteReuseStrategy }
  ]
};
