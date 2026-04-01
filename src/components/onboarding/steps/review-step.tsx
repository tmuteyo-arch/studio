'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PartyPopper, FileText, Eye, CheckCircle2, Globe, Hash, ShieldCheck } from 'lucide-react';
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
  const isPersonalOrIndividual = ['Individual Accounts', 'Minors'].includes(data.clientType);
  const isSoleTrader = data.clientType === 'Sole Trader';
  
  const isForeign = data.clientType === 'Individual Accounts' && 
    data.nationality && 
    !['zimbabwe', 'zimbabwean'].includes(data.nationality.toLowerCase().trim());
    
  const needsMandate = !isPersonalOrIndividual;
  const needsAgreements = ['Sole Trader', 'Private Limited (Pvt) Company', 'Private Business Corporate (PBC)', 'Public Limited company', 'Partnerships', 'Investment Group', 'Parastatal'].includes(data.clientType);
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
    <div className="pb-10">
      <CardHeader>
        <CardTitle>Review & Submit</CardTitle>
        <CardDescription>Review mandatory information before final submission.</CardDescription>
      </CardHeader>
      <div className="space-y-6 px-6">
        
        <div className="rounded-xl border p-6 bg-muted/10">
            <h3 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2 text-primary">
                <Hash className="h-4 w-4" />
                Account Type Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <DetailItem label="Account Type" value={data.clientType} />
                {!isPersonalOrIndividual && <DetailItem label="Relationship" value={data.relationshipType} />}
                <DetailItem label="Region" value={data.region} />
                <DetailItem label="TIN Number" value={data.tinNumber} />
            </div>
        </div>

        {(isPersonalOrIndividual || isSoleTrader) && (
          <div className="rounded-xl border p-6 space-y-6">
            <h3 className="font-black uppercase tracking-widest text-xs text-primary">Applicant Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DetailItem label="Full Name" value={`${data.individualFirstName} ${data.individualSurname}`} />
              <DetailItem label="Date of Birth" value={data.individualDateOfBirth ? format(new Date(data.individualDateOfBirth), 'MMMM d, yyyy') : '-'} />
              <DetailItem label="ID Number" value={data.individualIdNumber} />
              <DetailItem label="Nationality" value={data.nationality} />
              <DetailItem label="Gender" value={data.gender} />
              <DetailItem label="Marital Status" value={data.maritalStatus} />
              <DetailItem label="Address" value={data.individualAddress} />
              <DetailItem label="Mobile Number" value={data.individualMobileNumber} />
            </div>

            {isForeign && (
              <div className="mt-4 pt-6 border-t border-dashed">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Globe className="h-4 w-4" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Foreign Applicant Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <DetailItem label="Passport Number" value={data.passportNumber} />
                  <DetailItem label="Country of Origin" value={data.countryOfOrigin} />
                  <DetailItem label="Visa/Permit Number" value={data.visaPermitNumber} />
                  <DetailItem label="Permit Expiry" value={data.permitExpiryDate ? format(new Date(data.permitExpiryDate), 'MMMM d, yyyy') : '-'} />
                </div>
              </div>
            )}
          </div>
        )}

        {(!isPersonalOrIndividual && !isSoleTrader) && (
            <div className="rounded-xl border p-6 space-y-6">
                <h3 className="font-black uppercase tracking-widest text-xs text-primary">Entity Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
             <div className="rounded-xl border p-6 space-y-6">
                <h3 className="font-black uppercase tracking-widest text-xs text-primary">Signatories ({data.signatories.length})</h3>
                {data.signatories.map((signatory, index) => (
                    <div key={index} className="space-y-2 border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <DetailItem label="Name" value={`${signatory.firstName} ${signatory.surname}`} />
                            <DetailItem label="ID Number" value={signatory.nationalIdNo} />
                            <DetailItem label="Designation" value={signatory.designation} />
                        </div>
                    </div>
                ))}
             </div>
        )}

        {needsAgreements && (
            <div className="rounded-xl border p-6 space-y-6 bg-primary/5">
                <h3 className="font-black uppercase tracking-widest text-xs text-primary flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Legal Sign-off Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 border rounded-xl bg-background">
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">
                                {data.relationshipType === 'Agency' ? 'Agency Agreement' : 'Merchant Agreement'}
                            </p>
                            <p className="text-sm font-bold">{data.agreement1Accepted ? 'ACCEPTED' : 'PENDING'}</p>
                        </div>
                        {data.agreement1Signature && <Badge variant="success" className="font-black">SIGNED</Badge>}
                    </div>
                    {data.relationshipType === 'Merchant' && (
                        <div className="flex items-center justify-between p-4 border rounded-xl bg-background">
                            <div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">
                                    Non-Disclosure Agreement (NDA)
                                </p>
                                <p className="text-sm font-bold">{data.agreement2Accepted ? 'ACCEPTED' : 'PENDING'}</p>
                            </div>
                            {data.agreement2Signature && <Badge variant="success" className="font-black">SIGNED</Badge>}
                        </div>
                    )}
                </div>
            </div>
        )}

        <div className="rounded-xl border p-6 space-y-6">
            <h3 className="font-black uppercase tracking-widest text-xs text-primary flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Uploaded Documents ({capturedDocs.length})
            </h3>
            {capturedDocs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {capturedDocs.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors group">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-primary" />
                                <div className="max-w-[150px]">
                                    <p className="text-sm font-bold truncate uppercase tracking-tight">{doc.type}</p>
                                    <p className="text-[10px] text-muted-foreground truncate font-mono uppercase">{doc.fileName}</p>
                                </div>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary"><Eye className="h-4 w-4" /></Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden rounded-2xl border-none">
                                    <DialogHeader className="p-6 bg-background border-b"><DialogTitle className="font-black uppercase tracking-tight">{doc.type}</DialogTitle></DialogHeader>
                                    <div className="flex-1 bg-muted rounded-b-2xl overflow-hidden flex items-center justify-center h-full">
                                        {doc.url.includes('application/pdf') || doc.fileName.toLowerCase().endsWith('.pdf') ? (
                                            <iframe src={doc.url} className="w-full h-full border-none" />
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
                <p className="text-sm text-destructive font-bold p-4 bg-destructive/10 rounded-xl border border-destructive/20">No documents uploaded! Please go back and add documents.</p>
            )}
        </div>

        <Separator className="my-10" />
        
        <div className="space-y-6">
            <h3 className="font-black uppercase tracking-tight text-xl">Final Acknowledgement</h3>
            <ScrollArea className="h-40 w-full rounded-xl border p-6 bg-muted/5 text-sm leading-relaxed">
                <TermsAndConditions />
            </ScrollArea>
             <FormField
                control={control}
                name="agreedToTerms"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-6 bg-primary/5">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel className="font-bold text-sm cursor-pointer">
                         I confirm that all the information provided in this application is true and correct to the best of my knowledge, and I agree to be bound by the terms and conditions outlined above.
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
                <FormItem className="max-w-md pt-4">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name (Digital Signature)</FormLabel>
                <FormControl>
                    <Input placeholder="Type your full name here..." {...field} value={field.value || ''} className="h-12 text-lg font-bold border-primary/20 focus:ring-primary rounded-xl" />
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
