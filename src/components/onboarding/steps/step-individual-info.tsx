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
        <CardTitle>Individual Info</CardTitle>
        <CardDescription>Enter details.</CardDescription>
      </CardHeader>
      <div className="px-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="individualFirstName" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="e.g. John" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="individualSurname" render={({ field }) => (
                <FormItem><FormLabel>Surname</FormLabel><FormControl><Input placeholder="e.g. Doe" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="individualDateOfBirth" render={({ field }) => (
                <FormItem><FormLabel>Birth Date</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="individualIdNumber" render={({ field }) => (
                <FormItem><FormLabel>ID Number</FormLabel><FormControl><Input placeholder="ID" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>

        <FormField control={form.control} name="individualAddress" render={({ field }) => (
            <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Street, City" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
        )}/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="individualMobileNumber" render={({ field }) => (
                <FormItem><FormLabel>Mobile</FormLabel><FormControl><Input placeholder="+263..." {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
      </div>
    </div>
  );
}
