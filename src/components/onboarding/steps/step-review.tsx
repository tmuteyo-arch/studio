'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PartyPopper } from 'lucide-react';
import { format } from 'date-fns';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface StepReviewProps {
  next?: () => void;
}

const DetailItem = ({ label, value }: { label: string; value: string | undefined | null; }) => (
    <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="font-semibold">{value || '-'}</p>
    </div>
);


export default function StepReview({ next }: StepReviewProps) {
  const { control, getValues, formState } = useFormContext<OnboardingFormData>();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const data = getValues();
  
  React.useEffect(() => {
    if (formState.isSubmitting) {
        setIsSubmitted(true);
    }
  }, [formState.isSubmitting]);

  if (isSubmitted) {
    return (
      <div className="text-center py-12 flex flex-col items-center justify-center h-full">
        <PartyPopper className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold">Application Submitted!</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          The application for <strong>{data.fullName}</strong> has been successfully submitted for validation. You will be returned to the dashboard.
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
      <div className="space-y-6 px-6">
        <div className="rounded-md border p-4 space-y-4">
           <DetailItem label="Account Type" value={data.clientType} />
           <DetailItem label="Full Name" value={data.fullName} />
           <DetailItem label="Date of Birth" value={data.dateOfBirth ? format(new Date(data.dateOfBirth), 'MMMM d, yyyy') : '-'} />
           <DetailItem label="Address" value={data.address} />
           <DetailItem label="Documents Provided" value={data.document1Type && data.document2Type ? `${data.document1Type} & ${data.document2Type}`: '-'} />
        </div>

        <Separator />
        
        <div className="space-y-4">
            <FormField
            control={control}
            name="signature"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Digital Signature</FormLabel>
                <FormControl>
                    <Input placeholder="Type your full name to sign" {...field} />
                </FormControl>
                 <FormMessage />
                </FormItem>
            )}
            />
             <FormField
                control={control}
                name="agreedToTerms"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>
                         I confirm that the information provided is true and correct.
                        </FormLabel>
                    </div>
                    </FormItem>
                )}
            />
        </div>
      </div>
    </div>
  );
}
