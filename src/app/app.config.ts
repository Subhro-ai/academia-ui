import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

// Imports for the new PrimeNG theme system
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';

import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

// 1. Define a new preset based on Aura
const CustomAura = definePreset(Aura, {
    // 2. Override the semantic tokens for the 'primary' color
    semantic: {
        primary: {
            50: '{slate.50}',
            100: '{slate.100}',
            200: '{slate.200}',
            300: '{slate.300}',
            400: '{slate.400}',
            500: '{slate.500}',
            600: '{slate.600}',
            700: '{slate.700}',
            800: '{slate.800}',
            900: '{slate.900}',
            950: '{slate.950}'
        }
    }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideCharts(withDefaultRegisterables()),

    
    // 3. Use your new custom preset
    providePrimeNG({
      theme: {
        preset: CustomAura
      }
    }),
    MessageService
  ]
};