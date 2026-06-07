import { bootstrapApplication } from '@angular/platform-browser';
import { mergeApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(
  AppComponent,
  mergeApplicationConfig(appConfig, {
    providers: [provideAnimationsAsync()],
  })
).catch((err) => console.error(err));
