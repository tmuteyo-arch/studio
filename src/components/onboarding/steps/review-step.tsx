'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PartyPopper, FileText, Eye, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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


export default function ReviewStep() {
  const { control, getValues, formState } = useFormContext<OnboardingFormData>();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const data = getValues();
  
  React.useEffect(() => {
    if (formState.isSubmitting) {
        setIsSubmitted(true);
    }
  }, [formState.isSubmitting]);
  
  const clientName = data.organisationLegalName || `${data.individualFirstName} ${data.individualSurname}`.trim();
  const isPersonalOrIndividual = ['Individual Accounts', 'Minors', 'Sole Trader'].includes(data.clientType);
  const needsMandate = data.clientType !== 'Individual Accounts' && data.clientType !== 'Minors';
  const capturedDocs = data.capturedDocuments || [];


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
        
        {isPersonalOrIndividual && (
          <div className="rounded-md border p-4 space-y-4">
            <h3 className="font-semibold">Applicant Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Account Type" value={data.clientType} />
              <DetailItem label="Full Name" value={`${data.individualFirstName} ${data.individualSurname}`} />
              <DetailItem label="Date of Birth" value={data.individualDateOfBirth ? format(new Date(data.individualDateOfBirth), 'MMMM d, yyyy') : '-'} />
              <DetailItem label="ID Number" value={data.individualIdNumber} />
              <DetailItem label="Nationality" value={data.nationality} />
              <DetailItem label="Gender" value={data.gender} />
              <DetailItem label="Marital Status" value={data.maritalStatus} />
              <DetailItem label="Address" value={data.individualAddress} />
              <DetailItem label="Mobile Number" value={data.individualMobileNumber} />
            </div>
          </div>
        )}

        {!isPersonalOrIndividual && (
            <div className="rounded-md border p-4 space-y-4">
                <h3 className="font-semibold">Entity Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Account Type" value={data.clientType} />
                    <DetailItem label="Legal Name" value={data.organisationLegalName} />
                    <DetailItem label="Business Type" value={data.natureOfBusiness} />
                    <DetailItem label="Cert. Number" value={data.certificateOfIncorporationNumber} />
                    <DetailItem label="Date of Inc." value={data.dateOfIncorporation ? format(new Date(data.dateOfIncorporation), 'MMMM d, yyyy') : '-'} />
                    <DetailItem label="Physical Address" value={data.physicalAddress} />
                    <DetailItem label="Business Phone" value={data.businessTelNumber} />
                    <DetailItem label="Business Email" value={data.email} />
                </div>
            </div>
        )}
        
        {needsMandate && data.signatories && data.signatories.length > 0 && (
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

        <div className="rounded-md border p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Uploaded Documents ({capturedDocs.length})
            </h3>
            {capturedDocs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {capturedDocs.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-primary" />
                                <div className="max-w-[150px]">
                                    <p className="text-sm font-bold truncate">{doc.type}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{doc.fileName}</p>
                                </div>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl h-[80vh]">
                                    <DialogHeader><DialogTitle>{doc.type}</DialogTitle></DialogHeader>
                                    <div className="flex-1 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                                        {doc.url.includes('application/pdf') || doc.fileName.toLowerCase().endsWith('.pdf') ? (
                                            <iframe src={doc.url} className="w-full h-full" />
                                        ) : (
                                            <img src={doc.url} alt="Document" className="max-w-full max-h-full object-contain" />
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-destructive font-bold">No documents uploaded! Please go back and add documents.</p>
            )}
        </div>

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
