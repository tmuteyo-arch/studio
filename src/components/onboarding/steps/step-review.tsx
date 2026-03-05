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
import { ScrollArea } from '@/components/ui/scroll-area';
import TermsAndConditions from '../terms-and-conditions';

const DetailItem = ({ label, value }: { label: string; value: string | number | undefined | null | boolean; }) => {
    if (value === undefined || value === null || value === '') return null;

    let displayValue: string;
    if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
    } else {
        displayValue = String(value);
    }

    return (
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="font-semibold">{displayValue}</p>
        </div>
    );
};


export default function StepReview() {
  const { control, getValues, formState } = useFormContext<OnboardingFormData>();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const data = getValues();
  
  React.useEffect(() => {
    if (formState.isSubmitting) {
        setIsSubmitted(true);
    }
  }, [formState.isSubmitting]);
  
  const clientName = data.organisationLegalName || `${data.individualFirstName} ${data.individualSurname}`.trim();
  const isIndividual = ['Personal Account', 'Proprietorship / Sole Trader'].includes(data.clientType);
  const isCorporate = !isIndividual && !!data.clientType;


  if (isSubmitted) {
    return (
      <div className="text-center py-12 flex flex-col items-center justify-center h-full">
        <PartyPopper className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold">Application Submitted!</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          The application for <strong>{clientName}</strong> has been successfully submitted.
        </p>
      </div>
    );
  }

  return (
    <div>
      <CardHeader>
        <CardTitle>Review & Submit</CardTitle>
        <CardDescription>Review mandatory information before final submission.</CardDescription>
      </CardHeader>
      <div className="space-y-6 px-6">
        
        {isIndividual && (
          <div className="rounded-md border p-4 space-y-4">
            <h3 className="font-semibold">Applicant Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Account Type" value={data.clientType} />
              <DetailItem label="Full Name" value={`${data.individualFirstName} ${data.individualSurname}`} />
              <DetailItem label="Date of Birth" value={data.individualDateOfBirth ? format(new Date(data.individualDateOfBirth), 'MMMM d, yyyy') : '-'} />
              <DetailItem label="ID Number" value={data.individualIdNumber} />
              <DetailItem label="Address" value={data.individualAddress} />
              <DetailItem label="Mobile Number" value={data.individualMobileNumber} />
            </div>
          </div>
        )}

        {isCorporate && (
            <div className="rounded-md border p-4 space-y-4">
                <h3 className="font-semibold">Corporate Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Account Type" value={data.clientType} />
                    <DetailItem label="Organisation Legal Name" value={data.organisationLegalName} />
                    <DetailItem label="Cert. Number" value={data.certificateOfIncorporationNumber} />
                    <DetailItem label="Date of Inc." value={data.dateOfIncorporation ? format(new Date(data.dateOfIncorporation), 'MMMM d, yyyy') : '-'} />
                    <DetailItem label="Physical Address" value={data.physicalAddress} />
                    <DetailItem label="Business Phone" value={data.businessTelNumber} />
                    <DetailItem label="Business Email" value={data.email} />
                </div>
            </div>
        )}
        
        {data.signatories && data.signatories.length > 0 && (
             <div className="rounded-md border p-4 space-y-4">
                <h3 className="font-semibold">Signatories ({data.signatories.length})</h3>
                {data.signatories.map((signatory, index) => (
                    <div key={index} className="space-y-2 border-b pb-2 last:border-b-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Name" value={`${signatory.firstName} ${signatory.surname}`} />
                            <DetailItem label="ID Number" value={signatory.nationalIdNo} />
                        </div>
                    </div>
                ))}
             </div>
        )}

        <Separator />
        
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Terms & Conditions</h3>
            <ScrollArea className="h-32 w-full rounded-md border p-4">
                <TermsAndConditions />
            </ScrollArea>
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
                         I confirm that the information provided is true and correct and I agree to the terms.
                        </FormLabel>
                         <FormMessage />
                    </div>
                    </FormItem>
                )}
            />
            <FormField
            control={control}
            name="signature"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name (Digital Signature)</FormLabel>
                <FormControl>
                    <Input placeholder="Type your full name" {...field} value={field.value || ''} />
                </FormControl>
                 <FormMessage />
                </FormItem>
            )}
            />
        </div>
      </div>
    </div>
  );
}
