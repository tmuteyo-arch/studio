'use client';

import { firebaseConfig } from './config';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { useUser } from './auth/use-user';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useAuth as useFirebaseAuth, useFirebaseApp, useFirestore } from './provider';

let firebaseApp: FirebaseApp | null = null;

function initializeFirebase() {
  if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApp();
    }
  }
  return firebaseApp;
}

// Initialize on first load
initializeFirebase();

export function useFirebase() {
  const auth = firebaseApp ? getAuth(firebaseApp) : null;
  const firestore = firebaseApp ? getFirestore(firebaseApp) : null;
  return { firebaseApp, auth, firestore };
}

export {
  useUser,
  useCollection,
  useDoc,
  useFirebaseAuth as useAuth,
  useFirebaseApp,
  useFirestore,
};
