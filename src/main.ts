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
import { PokemonService } from './app/core/services/pokemon.service';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // ← habilita HttpClient no modo standalone
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
  .then((appRef) => {
    // Smoke-test: busca Pikachu
    const poke = appRef.injector.get(PokemonService);
    poke.get(25).subscribe((data) => console.log('Pikachu:', data));
  })
  .catch((err) => console.error(err));
