import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // Import provideHttpClient
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // Import provideAnimationsAsync

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(), // Add provideHttpClient
    provideAnimationsAsync(), // Add provideAnimationsAsync
  ],
};
