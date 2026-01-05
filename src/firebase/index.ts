'use client';

import { firebaseConfig } from './config';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { useUser } from './auth/use-user';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useAuth as useFirebaseAuth, useFirebaseApp, useFirestore } from './provider';

let firebaseApp: FirebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

export function useFirebase() {
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
