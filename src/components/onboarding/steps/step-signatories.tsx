'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, RotateCcw, Eraser } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import SignatureCanvas from 'react-signature-canvas';
import React, { useEffect, useState } from 'react';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-foreground mt-6 mb-4 border-b pb-2">{children}</h3>
);

const SignatureField = ({ control, name }: { control: any; name: string }) => {
  const sigPadRef = React.useRef<SignatureCanvas | null>(null);
  const { watch, setValue } = useFormContext();
  const signatureValue = watch(name);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      render={({ field }) => (
        <FormItem>
          <FormLabel>Digital Signature</FormLabel>
          <FormControl>
            <div>
              {field.value ? (
                <div className="flex items-center gap-4">
                  <div className="border rounded-md p-2 bg-white shadow-sm">
                    <img src={field.value} alt="Signature" className="h-16 w-auto" />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setValue(name, '', { shouldValidate: true })}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Re-sign
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                    <div className="w-full h-40 border rounded-md bg-white overflow-hidden">
                        {mounted && (
                          <SignatureCanvas
                              ref={sigPadRef}
                              penColor="black"
                              canvasProps={{ className: 'w-full h-full' }}
                              onEnd={handleEndStroke}
                          />
                        )}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="self-start text-muted-foreground">
                        <Eraser className="mr-2 h-4 w-4" /> Clear Canvas
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

  const clientName = form.getValues('organisationLegalName') || `${form.getValues('individualFirstName')} ${form.getValues('individualSurname')}`.trim() || '[Client Name]';

  return (
    <div>
      <CardHeader>
        <CardTitle>Account Mandate & Signatories</CardTitle>
        <CardDescription>Specify the account mandate and add all authorized signatories for this entity.</CardDescription>
      </CardHeader>
      <div className="space-y-4 px-6">
        
        <SectionTitle>Board Resolution / Mandate</SectionTitle>
        <div className="p-4 border rounded-md space-y-4 bg-muted/20">
            <FormField
                control={form.control}
                name="resolutionDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Date of Resolution</FormLabel>
                    <div className='flex flex-wrap items-center gap-2'>
                        <span className='text-sm text-muted-foreground'>Resolution passed at the board of Directors/Management held on:</span>
                        <FormControl>
                            <Input type="date" {...field} className="w-auto" value={field.value || ''} />
                        </FormControl>
                    </div>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <p className='text-sm text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-4'>
                "Resolved that an account be opened in the name of <strong>{clientName}</strong> with InnBucks MicroBank Limited in accordance with the services requested and subject to the provisions of the Microfinance Act."
            </p>
        </div>

        <SectionTitle>Authorized Signatories</SectionTitle>
        <Accordion type="multiple" defaultValue={['item-0']} className="w-full">
          {fields.map((field, index) => (
            <AccordionItem value={`item-${index}`} key={field.id} className="border rounded-md px-4 mb-2 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex justify-between w-full items-center pr-4">
                  <span className="font-semibold">Signatory {index + 1}: {form.watch(`signatories.${index}.firstName`)} {form.watch(`signatories.${index}.surname`)}</span>
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
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
                            <FormItem><FormLabel>Other Names</FormLabel><FormControl><Input placeholder="Optional" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`signatories.${index}.nationalIdNo`} render={({ field }) => (
                            <FormItem><FormLabel>National ID/Passport No.</FormLabel><FormControl><Input placeholder="Enter ID number" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name={`signatories.${index}.designation`} render={({ field }) => (
                            <FormItem><FormLabel>Designation/Job Title</FormLabel><FormControl><Input placeholder="e.g. Director, Secretary" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                    <SignatureField control={form.control} name={`signatories.${index}.signature`} />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {fields.length < 6 && (
            <Button type="button" variant="outline" className="w-full border-dashed" onClick={addNewSignatory}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Authorized Signatory
            </Button>
        )}
        <FormField
            control={form.control}
            name="signingInstruction"
            render={({ field }) => (
                <FormItem className="mt-6">
                <FormLabel>Signing Instructions</FormLabel>
                <FormControl>
                    <Textarea placeholder="e.g., Any two signatories to sign jointly." {...field} value={field.value || ''} />
                </FormControl>
                <FormDescription>Define how signatures should be combined for valid transactions.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
        />
      </div>
    </div>
  );
}
