'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { OnboardingFormData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PartyPopper } from 'lucide-react';
import { format } from 'date-fns';

export default function StepReview() {
  const { getValues } = useFormContext<OnboardingFormData>();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const data = getValues();

  const handleSubmit = () => {
    // In a real app, this would submit the data to a backend.
    console.log('Application Submitted:', data);
    setIsSubmitted(true);
  };
  
  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <PartyPopper className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold">Application Submitted!</h2>
        <p className="text-muted-foreground mt-2">
          Welcome to SwiftAccount! Your account is being set up. You'll receive a confirmation email shortly.
        </p>
      </div>
    );
  }

  return (
    <div>
      <CardHeader>
        <CardTitle>Review & Submit</CardTitle>
        <CardDescription>Please review your information carefully before submitting.</CardDescription>
      </CardHeader>
      <div className="space-y-4 px-6">
        <div className="rounded-md border p-4 space-y-4">
           <div>
            <p className="text-sm font-medium text-muted-foreground">Full Name</p>
            <p className="font-semibold">{data.fullName}</p>
          </div>
           <div>
            <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
            <p className="font-semibold">{format(new Date(data.dateOfBirth), 'MMMM d, yyyy')}</p>
          </div>
           <div>
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p className="font-semibold">{data.address}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Documents Provided</p>
            <p className="font-semibold">{data.document1Type} & {data.document2Type}</p>
          </div>
           <div>
            <p className="text-sm font-medium text-muted-foreground">Digital Signature</p>
            <p className="font-semibold font-serif italic">{data.signature}</p>
          </div>
        </div>
        
        <Button onClick={handleSubmit} className="w-full">
          Submit Application
        </Button>
      </div>
    </div>
  );
}
