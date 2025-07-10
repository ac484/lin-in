import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, provideAppCheck } from '@angular/fire/app-check';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getRemoteConfig, provideRemoteConfig } from '@angular/fire/remote-config';
import { getVertexAI, provideVertexAI } from '@angular/fire/vertexai';
import { environment } from './environments/environment';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: { darkModeSelector: '.p-dark' },
      },
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "lin-in", appId: "1:387803341154:web:8d341bbe9176f5e3a78c3b", storageBucket: "lin-in.firebasestorage.app", apiKey: "AIzaSyCX4rENtBHJAxypxNpx5YrFU-gHZl3L2-s", authDomain: "lin-in.firebaseapp.com", messagingSenderId: "387803341154", measurementId: "G-WSPHDVH8TC" })), provideAuth(() => getAuth()), provideAnalytics(() => getAnalytics()), ScreenTrackingService, UserTrackingService, provideAppCheck(() => {
  // TODO get a reCAPTCHA Enterprise here https://console.cloud.google.com/security/recaptcha?project=_
  const provider = new ReCaptchaEnterpriseProvider(environment.firebase.recaptchaEnterpriseSiteKey);
  return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: true });
}), provideFirestore(() => getFirestore()), provideFunctions(() => getFunctions()), provideMessaging(() => getMessaging()), providePerformance(() => getPerformance()), provideStorage(() => getStorage()), provideRemoteConfig(() => getRemoteConfig()), provideVertexAI(() => getVertexAI()), MessageService
  ],
};
