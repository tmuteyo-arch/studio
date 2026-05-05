'use client';

import React, { ReactNode, useMemo } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

export const FirebaseClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { firebaseApp, firestore, auth, storage } = useMemo(() => initializeFirebase(), []);

  if (!firebaseApp || !firestore || !auth || !storage) return <>{children}</>;

  return (
    <FirebaseProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth} storage={storage}>
      {children}
    </FirebaseProvider>
  );
};
