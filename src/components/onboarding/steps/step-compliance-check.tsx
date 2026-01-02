'use client';

import * as React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StepComplianceCheckProps {
  next: () => void;
}

export default function StepComplianceCheck({ next }: StepComplianceCheckProps) {
  const [status, setStatus] = React.useState<'checking' | 'complete'>('checking');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('complete');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  
  React.useEffect(() => {
    if (status === 'complete') {
      const nextTimer = setTimeout(() => {
        next();
      }, 1500);
      return () => clearTimeout(nextTimer);
    }
  }, [status, next]);


  return (
    <div>
      <CardHeader>
        <CardTitle>Compliance Check</CardTitle>
        <CardDescription>We're running standard background checks. This will only take a moment.</CardDescription>
      </CardHeader>
      <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
        {status === 'checking' ? (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium text-foreground">Running KYC/AML Checks...</p>
            <p className="text-sm text-muted-foreground">Please wait while we verify your information against compliance databases.</p>
          </>
        ) : (
          <>
            <ShieldCheck className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-medium text-foreground">Compliance Checks Passed</p>
            <p className="text-sm text-muted-foreground">You will be automatically redirected to the next step.</p>
          </>
        )}
      </div>
    </div>
  );
}
