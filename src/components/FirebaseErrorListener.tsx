'use client';

import * as React from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  React.useEffect(() => {
    errorEmitter.on('permission-error', (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Security Permission Denied',
        description: error.message || 'You do not have permission to perform this action.',
      });
    });
  }, [toast]);

  return null;
}
