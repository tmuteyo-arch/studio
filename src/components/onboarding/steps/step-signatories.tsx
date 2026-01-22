'use client';

import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, RotateCcw, Eraser } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import SignatureCanvas from 'react-signature-canvas';
import React from 'react';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-foreground mt-6 mb-4 border-b pb-2">{children}</h3>
);

// A self-contained component for the signature pad logic
const SignatureField = ({ control, name }: { control: any; name: string }) => {
  const sigPadRef = React.useRef<SignatureCanvas | null>(null);
  const { watch, setValue } = useFormContext();
  const signatureValue = watch(name);

  const handleClear = () => {
    sigPadRef.current?.clear();
    setValue(name, '', { shouldValidate: true });
  };
  
  const handleEndStroke = () => {
    if (sigPadRef.current) {
        if (sigPadRef.current.isEmpty()) {
            setValue(name, '', { shouldValidate: true, shouldDirty: true });
        } else {
            const dataUrl = sigPadRef.current.toDataURL();
            setValue(name, dataUrl, { shouldValidate: true, shouldDirty: true });
        }
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Signature</FormLabel>
          <FormControl>
            <div>
              {field.value ? (
                <div className="flex items-center gap-4">
                  <div className="border rounded-md p-2 bg-white">
                    <img src={field.value} alt="Signature" className="h-16 w-auto" />
                  </div>
                  <Button type="button" variant="outline" size="icon" onClick={() => setValue(name, '', { shouldValidate: true })}>
                    <RotateCcw className="h-4 w-4" />
                    <span className="sr-only">Redo Signature</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                    <div className="w-full h-40 border rounded-md bg-white">
                        <SignatureCanvas
                            ref={sigPadRef}
                            penColor="black"
                            canvasProps={{ className: 'w-full h-full' }}
                            onEnd={handleEndStroke}
                        />
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handleClear} className="self-start">
                        <Eraser className="mr-2 h-4 w-4" /> Clear
                    </Button>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};


export default function StepSignatories() {
  const form = useFormContext<OnboardingFormData>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'signatories',
  });

  const addNewSignatory = () => {
    append({
      surname: '',
      firstName: '',
      otherName: '',
      nationalIdNo: '',
      designation: '',
      signature: '',
    });
  };

  const clientName = form.getValues('organisationLegalName') || `${form.getValues('individualFirstName')} ${form.getValues('individualSurname')}`.trim() || '[Applicant Name]';

  return (
    <div>
      <CardHeader>
        <CardTitle>Account Mandate & Signatories</CardTitle>
        <CardDescription>Provide the resolution details and add all authorized signatories for this account.</CardDescription>
      </CardHeader>
      <div className="space-y-4 px-6">
        
        <SectionTitle>Account Mandate</SectionTitle>
        <div className="p-4 border rounded-md space-y-4 bg-muted/20">
            <FormField
                control={form.control}
                name="resolutionDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Resolution Date</FormLabel>
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-muted-foreground'>...resolution passed at the board of Directors/Management... held on the</span>
                        <FormControl>
                            <Input type="date" {...field} className="w-auto" value={field.value || ''} />
                        </FormControl>
                    </div>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <p className='text-sm text-muted-foreground'>
                That a transaction / account be opened in the name of <strong>{clientName}</strong> with InnBucks in accordance with the services requested for and in line with the terms and subject to the provisions of the Microfinance Act, Rules of the institution pursuant to this application.
            </p>
        </div>

        <SectionTitle>Authorised Signatories</SectionTitle>
        <Accordion type="multiple" defaultValue={['item-0']} className="w-full">
          {fields.map((field, index) => (
            <AccordionItem value={`item-${index}`} key={field.id}>
              <AccordionTrigger>
                <div className="flex justify-between w-full items-center pr-4">
                  <span>Signatory {index + 1}: {form.watch(`signatories.${index}.firstName`)} {form.watch(`signatories.${index}.surname`)}</span>
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent accordion from toggling
                      remove(index);
                    }}
                   >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name={`signatories.${index}.surname`} render={({ field }) => (
                            <FormItem><FormLabel>Surname</FormLabel><FormControl><Input placeholder="e.g. Doe" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name={`signatories.${index}.firstName`} render={({ field }) => (
                            <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="e.g. John" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name={`signatories.${index}.otherName`} render={({ field }) => (
                            <FormItem><FormLabel>Other Name</FormLabel><FormControl><Input placeholder="Optional" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`signatories.${index}.nationalIdNo`} render={({ field }) => (
                            <FormItem><FormLabel>National ID No.</FormLabel><FormControl><Input placeholder="ID document number" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name={`signatories.${index}.designation`} render={({ field }) => (
                            <FormItem><FormLabel>Designation</FormLabel><FormControl><Input placeholder="e.g. CEO, Director" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                    <SignatureField control={form.control} name={`signatories.${index}.signature`} />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {fields.length < 6 && (
            <Button type="button" variant="outline" className="w-full" onClick={addNewSignatory}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Signatory
            </Button>
        )}
        <FormField
            control={form.control}
            name="signingInstruction"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Signing Instructions</FormLabel>
                <FormControl>
                    <Textarea placeholder="e.g., Any two signatories to sign." {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
      </div>
    </div>
  );
}