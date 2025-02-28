import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { auth0TokenInterceptor } from './app/core/auth0Token/auth0-token.interceptor';
import { AppConfigService } from './app/app-config.service';
import { AuthClientConfig, AuthModule, provideAuth0 } from '@auth0/auth0-angular';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { StoreModule } from '@ngrx/store';
import { sessionReducer } from './app/core/session/session.reducer';
import { EffectsModule } from '@ngrx/effects';
import { SessionEffects } from './app/core/session/session.effects';
import { metaReducers } from './app/app.reducer';

function initializeAppConfig(appConfig: AppConfigService, authConfig: AuthClientConfig): () => Promise<void> {
  return async () => {
    await appConfig.loadConfig();
    authConfig.set({
      domain: appConfig.auth0Domain,
      clientId: appConfig.auth0ClientId,
      authorizationParams: {
        redirect_uri: 'https://arpitamazumdar-easyglobal.github.io/github-pages/login',
        audience: appConfig.audience,
        scope: 'openid profile email',
      },
    });
  };
}
export function rehydrateState() {
  const storedState = localStorage.getItem('appState');
  if (storedState) {
    // Clear localStorage after retrieving state
    localStorage.removeItem('appState');
    return JSON.parse(storedState);
  }
  return undefined;
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
    provideAnimations(),
    provideAuth0({
      domain: '',
      clientId: '',
      authorizationParams: {
        redirect_uri: 'https://arpitamazumdar-easyglobal.github.io/github-pages/',
        audience: 'https://easyglobal/',
        scope: 'openid profile email',
      },
    }),
    importProvidersFrom(ToastrModule.forRoot()),
    importProvidersFrom(StoreModule.forRoot({ session: sessionReducer }, {
      metaReducers,
      initialState: rehydrateState(),
    })), // Register session reducer
    importProvidersFrom(EffectsModule.forRoot([SessionEffects])),
    AppConfigService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: auth0TokenInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppConfig,
      deps: [AppConfigService, AuthClientConfig],
      multi: true,
    },
  ],
}).catch(err => console.error(err));
