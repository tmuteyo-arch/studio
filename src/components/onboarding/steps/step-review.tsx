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

interface StepReviewProps {
  next?: () => void;
}

const DetailItem = ({ label, value }: { label: string; value: string | undefined | null | boolean; }) => {
    if (value === undefined || value === null || value === '') return null;

    let displayValue: string;
    if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
    } else {
        displayValue = value;
    }

    return (
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="font-semibold">{displayValue}</p>
        </div>
    );
};


export default function StepReview({ next }: StepReviewProps) {
  const { control, getValues, formState } = useFormContext<OnboardingFormData>();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const data = getValues();
  
  React.useEffect(() => {
    if (formState.isSubmitting) {
        setIsSubmitted(true);
    }
  }, [formState.isSubmitting]);

  const isCorporate = ['Company (Private / Public Limited)', 'PBC Account', 'Partnership'].includes(data.clientType);

  if (isSubmitted) {
    return (
      <div className="text-center py-12 flex flex-col items-center justify-center h-full">
        <PartyPopper className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold">Application Submitted!</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          The application for <strong>{data.organisationLegalName || data.fullName}</strong> has been successfully submitted for validation. You will be returned to the dashboard.
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
           <h3 className="font-semibold">Application Details</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <DetailItem label="Account Type" value={data.clientType} />
             {isCorporate && <DetailItem label="Organisation Legal Name" value={data.organisationLegalName} />}
             <DetailItem label={isCorporate ? "Primary Contact Name" : "Full Name"} value={data.fullName} />
             <DetailItem label="Date of Birth" value={data.dateOfBirth ? format(new Date(data.dateOfBirth), 'MMMM d, yyyy') : '-'} />
             <DetailItem label="Address" value={data.address} />
             <DetailItem label="Documents Provided" value={data.document1Type && data.document2Type ? `${data.document1Type} & ${data.document2Type}`: '-'} />
           </div>
        </div>

        {isCorporate && (
            <div className="rounded-md border p-4 space-y-4">
                <h3 className="font-semibold">Corporate Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Trade Name" value={data.tradeName} />
                    <DetailItem label="Physical Address" value={data.physicalAddress} />
                    <DetailItem label="Postal Address" value={data.postalAddress} />
                    <DetailItem label="Web Address" value={data.webAddress} />
                    <DetailItem label="Business Tel. Number" value={data.businessTelNumber} />
                    <DetailItem label="Fax Number" value={data.faxNumber} />
                    <DetailItem label="Email" value={data.email} />
                    <DetailItem label="Nature of Business" value={data.natureOfBusiness} />
                    <DetailItem label="Source of Wealth" value={data.sourceOfWealth} />
                    <DetailItem label="Type of Business" value={data.typeOfBusiness} />
                    <DetailItem label="Number of Employees" value={data.noOfEmployees?.toString()} />
                    <DetailItem label="Economic Sector" value={data.economicSector} />
                    <DetailItem label="Authorised Capital" value={data.authorisedCapital} />
                    <DetailItem label="Tax Payer Number" value={data.taxPayerNumber} />
                    <DetailItem label="Date of Incorporation" value={data.dateOfIncorporation ? format(new Date(data.dateOfIncorporation), 'MMMM d, yyyy') : '-'} />
                    <DetailItem label="Country of Incorporation" value={data.countryOfIncorporation} />
                    <DetailItem label="Cert. of Incorporation Number" value={data.certificateOfIncorporationNumber} />
                    <DetailItem label="Other InnBucks Accounts?" value={data.hasOtherAccounts} />
                    <DetailItem label="Other Account Numbers" value={data.otherAccountNumbers} />
                    <DetailItem label="Communication Preference" value={data.communicationPreference} />
                    <DetailItem label="Premises Status" value={data.premisesStatus} />
                    <DetailItem label="Premises Details (Other)" value={data.premisesOtherDetails} />
                </div>
            </div>
        )}
        
        {isCorporate && data.directors && data.directors.length > 0 && (
             <div className="rounded-md border p-4 space-y-4">
                <h3 className="font-semibold">Directors</h3>
                {data.directors.map((director, index) => (
                    <div key={index} className="space-y-2 border-b pb-2 last:border-b-0">
                        <p className='font-medium'>Director {index + 1}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Full Name" value={director.fullName} />
                            <DetailItem label="ID Number" value={director.idNumber} />
                            <DetailItem label="Date of Birth" value={director.dateOfBirth ? format(new Date(director.dateOfBirth), 'MMMM d, yyyy') : '-'} />
                            <DetailItem label="Address" value={director.address} />
                            <DetailItem label="Designation" value={director.designation} />
                            <DetailItem label="Phone Number" value={director.phoneNumber} />
                            <DetailItem label="Gender" value={director.gender} />
                        </div>
                    </div>
                ))}
             </div>
        )}

        <Separator />
        
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Terms & Conditions</h3>
            <ScrollArea className="h-48 w-full rounded-md border p-4">
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
                         I have read, understood, and agree to the InnBucks MicroBank Terms and Conditions and Client Protection Principles. I confirm that the information provided is true and correct.
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
                <FormLabel>Digital Signature</FormLabel>
                <FormControl>
                    <Input placeholder="Type your full name to sign" {...field} />
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
