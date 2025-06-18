// src/main.ts
import 'zone.js';                                 // mantém o change-detection
import { bootstrapApplication } from '@angular/platform-browser';

import {
  RouteReuseStrategy,
  PreloadAllModules,
  provideRouter,
  withPreloading,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { addIcons } from 'ionicons';
import { heart, heartOutline, close } from 'ionicons/icons';


addIcons({
  heart,
  'heart-outline': heartOutline,
  close
});
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // ← habilita HttpClient no modo standalone
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
