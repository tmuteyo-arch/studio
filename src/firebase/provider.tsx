'use client';

import { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

interface FirebaseContextValue {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  firebaseApp: null,
  auth: null,
  firestore: null,
});

export function FirebaseProvider({
  children,
  firebaseApp,
}: {
  children: React.ReactNode;
  firebaseApp: FirebaseApp | null;
}) {
  // Lazily get auth and firestore instances
  const auth = firebaseApp ? getAuth(firebaseApp) : null;
  const firestore = firebaseApp ? getFirestore(firebaseApp) : null;

  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, firestore }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebaseApp = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebaseApp must be used within a FirebaseProvider');
    }
    return context?.firebaseApp;
};
export const useAuth = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a FirebaseProvider');
    }
    return context;
};
export const useFirestore = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirestore must be used within a FirebaseProvider');
    }
    return context;
};
