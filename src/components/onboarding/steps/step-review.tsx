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


export default function StepReview({ next }: StepReviewProps) {
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
  const isCorporate = !isIndividual;


  if (isSubmitted) {
    return (
      <div className="text-center py-12 flex flex-col items-center justify-center h-full">
        <PartyPopper className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold">Application Submitted!</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          The application for <strong>{clientName}</strong> has been successfully submitted for validation. You will be returned to the dashboard.
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
        
        {isIndividual && (
          <div className="rounded-md border p-4 space-y-4">
            <h3 className="font-semibold">Applicant Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailItem label="Account Type" value={data.clientType} />
              <DetailItem label="Branch" value={data.branch} />
              <DetailItem label="Referred By" value={data.referredBy} />
              <DetailItem label="Title" value={data.individualTitle} />
              <DetailItem label="First Name" value={data.individualFirstName} />
              <DetailItem label="Surname" value={data.individualSurname} />
              <DetailItem label="Date of Birth" value={data.individualDateOfBirth ? format(new Date(data.individualDateOfBirth), 'MMMM d, yyyy') : '-'} />
              <DetailItem label="Place of Birth" value={data.individualPlaceOfBirth} />
              <DetailItem label="Gender" value={data.individualGender} />
              <DetailItem label="Marital Status" value={data.individualMaritalStatus} />
              <DetailItem label="ID Type" value={data.individualIdType} />
              <DetailItem label="ID Number" value={data.individualIdNumber} />
              <DetailItem label="Address" value={data.individualAddress} />
              <DetailItem label="Mobile Number" value={data.individualMobileNumber} />
              <DetailItem label="InnBucks Wallet No." value={data.individualInnbucksWalletAccount} />
            </div>
            <Separator />
            <h3 className="font-semibold pt-2">Employment Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailItem label="Occupation" value={data.occupation} />
              <DetailItem label="Employer" value={data.employerName} />
              <DetailItem label="Employer Sector" value={data.employerSector} />
              <DetailItem label="Employment Date" value={data.dateOfEmployment ? format(new Date(data.dateOfEmployment), 'MMMM d, yyyy') : '-'} />
              <DetailItem label="Gross Monthly Income" value={data.grossMonthlyIncome} />
              <DetailItem label="Other Income" value={data.otherIncome} />
            </div>
          </div>
        )}

        {isCorporate && (
          <>
            <div className="rounded-md border p-4 space-y-4">
              <h3 className="font-semibold">Application Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Account Type" value={data.clientType} />
                <DetailItem label="Organisation Legal Name" value={data.organisationLegalName} />
                <DetailItem label="Primary Contact Name" value={data.fullName} />
                <DetailItem label="Contact Date of Birth" value={data.dateOfBirth ? format(new Date(data.dateOfBirth), 'MMMM d, yyyy') : '-'} />
                <DetailItem label="Contact Address" value={data.address} />
              </div>
            </div>

            <div className="rounded-md border p-4 space-y-4">
                <h3 className="font-semibold">Corporate Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Cert. of Incorporation Number" value={data.certificateOfIncorporationNumber} />
                    <DetailItem label="Date of Incorporation" value={data.dateOfIncorporation ? format(new Date(data.dateOfIncorporation), 'MMMM d, yyyy') : '-'} />
                    <DetailItem label="Country of Incorporation" value={data.countryOfIncorporation} />
                </div>
            </div>
          </>
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
         <div className="rounded-md border p-4 space-y-4">
            <h3 className="font-semibold">Documents</h3>
            <DetailItem label="Documents Provided" value={data.document1Type && data.document2Type ? `${data.document1Type} & ${data.document2Type}`: '-'} />
         </div>


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
