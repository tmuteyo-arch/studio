'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StepIndividualInfo() {
  const form = useFormContext<OnboardingFormData>();

  return (
    <div>
      <CardHeader>
        <CardTitle>Applicant Details</CardTitle>
        <CardDescription>Please provide the mandatory information for the individual applicant.</CardDescription>
      </CardHeader>
      <div className="px-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="individualFirstName" render={({ field }) => (
                <FormItem><FormLabel>First Name(s)</FormLabel><FormControl><Input placeholder="e.g., John" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="individualSurname" render={({ field }) => (
                <FormItem><FormLabel>Surname</FormLabel><FormControl><Input placeholder="e.g., Doe" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="individualDateOfBirth" render={({ field }) => (
                <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="individualIdNumber" render={({ field }) => (
                <FormItem><FormLabel>ID / Passport Number</FormLabel><FormControl><Input placeholder="ID document number" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>

        <FormField control={form.control} name="individualAddress" render={({ field }) => (
            <FormItem><FormLabel>Residential Address</FormLabel><FormControl><Input placeholder="123 Main St, Anytown" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
        )}/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="individualMobileNumber" render={({ field }) => (
                <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="+263 77 123 4567" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
      </div>
    </div>
  );
}
