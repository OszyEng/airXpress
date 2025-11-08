import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';

fetch('/assets/color.json')
  .then(res => res.ok ? res.json() : Promise.reject('no-color-json'))
  .then((cfg: any) => {
    if (cfg && cfg.primary) {
      document.documentElement.style.setProperty('--ax-primary', cfg.primary);
    }
    if (cfg && cfg.onPrimary) {
      document.documentElement.style.setProperty('--ax-on-primary', cfg.onPrimary);
    }
  })
  .catch(() => {
  })
  .finally(() => {
    bootstrapApplication(AppComponent, {
      providers: [provideRouter(routes), provideHttpClient()]
    }).catch(err => console.error(err));
  });