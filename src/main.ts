import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core'; // Adicione esta linha
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    importProvidersFrom(HttpClientModule),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
