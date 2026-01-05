'use client';

import { useEffect, useState } from 'react';
import type {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FirestoreError,
} from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export function useDoc<T extends DocumentData>(
  docRefCreator: (firestore: ReturnType<typeof useFirestore>['firestore']) => DocumentReference<T> | null
) {
  const { firestore } = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!firestore) return;

    const docRef = docRefCreator(firestore);
     if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<T>) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err: FirestoreError) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, docRefCreator]);

  return { data, loading, error };
}
