'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingFormData } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StepDigitalSignature() {
  const form = useFormContext<OnboardingFormData>();
  const signature = form.watch('signature');

  return (
    <div>
      <CardHeader>
        <CardTitle>Digital Signature</CardTitle>
        <CardDescription>Please review the agreement and sign below.</CardDescription>
      </CardHeader>
      <div className="space-y-6 px-6">
        <ScrollArea className="h-48 w-full rounded-md border p-4">
          <h4 className="font-bold mb-2">Terms and Conditions</h4>
          <p className="text-sm text-muted-foreground space-y-2">
            By signing this document, you agree to be bound by its terms. You acknowledge that this electronic signature is the legal equivalent of your manual signature.
            <br/><br/>
            You consent to do business electronically with SwiftAccount and our partners. This includes receiving disclosures and notices electronically.
            <br/><br/>
            All information provided is accurate and complete to the best of your knowledge. You understand that providing false information can result in the rejection of your application and potential legal consequences.
          </p>
        </ScrollArea>
        
        <FormField
          control={form.control}
          name="agreedToTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I have read and agree to the terms and conditions.
                </FormLabel>
                 <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="signature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type your full name to sign</FormLabel>
              <FormControl>
                <Input placeholder="Your Full Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {signature && (
          <div>
            <FormLabel>Signature Preview</FormLabel>
            <div className="mt-2 rounded-md border bg-gray-50 p-4 h-24 flex items-center justify-start">
              <p className="text-3xl font-serif italic text-gray-800">{signature}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
