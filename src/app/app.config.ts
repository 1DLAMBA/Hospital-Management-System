import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideClientHydration(),
    MessageService, 
    provideAnimationsAsync(),
    importProvidersFrom(TranslateModule.forRoot()),
    provideHttpClient()
  ]
};
