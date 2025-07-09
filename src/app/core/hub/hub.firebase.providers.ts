// src/app/core/hub/hub.firebase.providers.ts
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environmentFirebase } from 'src/environments/environment.firebase';

export const HUB_FIREBASE_PROVIDERS = [
  provideFirebaseApp(() => initializeApp(environmentFirebase.firebase)),
  provideAuth(() => getAuth()),
  provideFirestore(() => getFirestore())
];
