'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PartyPopper } from 'lucide-react';
import { format } from 'date-fns';

interface StepReviewProps {
  next?: () => void;
}

export default function StepReview({ next }: StepReviewProps) {
  const { getValues, formState } = useFormContext<OnboardingFormData>();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const data = getValues();
  
  // The parent form's onSubmit will trigger this when the submit button is clicked.
  React.useEffect(() => {
    if (formState.isSubmitSuccessful) {
      setIsSubmitted(true);
    }
  }, [formState.isSubmitSuccessful]);

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <PartyPopper className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold">Application Submitted!</h2>
        <p className="text-muted-foreground mt-2">
          Your application for {data.fullName} has been submitted for validation.
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
            <p className="text-sm font-medium text-muted-foreground">Account Type</p>
            <p className="font-semibold">{data.clientType || '-'}</p>
          </div>
           <div>
            <p className="text-sm font-medium text-muted-foreground">Full Name</p>
            <p className="font-semibold">{data.fullName || '-'}</p>
          </div>
           <div>
            <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
            <p className="font-semibold">{data.dateOfBirth ? format(new Date(data.dateOfBirth), 'MMMM d, yyyy') : '-'}</p>
          </div>
           <div>
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p className="font-semibold">{data.address || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Documents Provided</p>
            <p className="font-semibold">{data.document1Type && data.document2Type ? `${data.document1Type} & ${data.document2Type}`: '-'}</p>
          </div>
           <div>
            <p className="text-sm font-medium text-muted-foreground">Digital Signature</p>
            <p className="font-serif italic">{data.signature || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
