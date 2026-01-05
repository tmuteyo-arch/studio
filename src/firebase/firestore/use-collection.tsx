'use client';

import { useEffect, useState } from 'react';
import type {
  FirestoreError,
  Query,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export function useCollection<T extends DocumentData>(
  queryCreator: (firestore: ReturnType<typeof useFirestore>['firestore']) => Query<T> | null
) {
  const { firestore } = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!firestore) return;
    
    const query = queryCreator(firestore);
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const data: T[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
        setData(data);
        setLoading(false);
      },
      (err: FirestoreError) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, queryCreator]);

  return { data, loading, error };
}
