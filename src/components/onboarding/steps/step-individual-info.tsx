'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { OnboardingFormData, genderOptions, maritalStatusOptions } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Globe } from 'lucide-react';

export default function StepIndividualInfo({ disabled }: { disabled?: boolean }) {
  const form = useFormContext<OnboardingFormData>();
  const clientType = form.watch('clientType');
  const nationality = form.watch('nationality') || '';

  const isForeign = clientType === 'Individual Accounts' && 
    nationality.trim() !== '' && 
    !['zimbabwe', 'zimbabwean'].includes(nationality.toLowerCase().trim());

  return (
    <div className="animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle>Individual Info</CardTitle>
        <CardDescription>Enter details.</CardDescription>
      </CardHeader>
      <div className="px-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="individualFirstName" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="e.g. John" {...field} value={field.value || ''} disabled={disabled} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="individualSurname" render={({ field }) => (
                <FormItem><FormLabel>Surname</FormLabel><FormControl><Input placeholder="e.g. Doe" {...field} value={field.value || ''} disabled={disabled} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="individualDateOfBirth" render={({ field }) => (
                <FormItem><FormLabel>Birth Date</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} disabled={disabled} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="individualIdNumber" render={({ field }) => (
                <FormItem><FormLabel>ID Number</FormLabel><FormControl><Input placeholder="ID" {...field} value={field.value || ''} disabled={disabled} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="nationality" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Zimbabwean" {...field} value={field.value || ''} disabled={disabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                        <SelectContent>{genderOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="maritalStatus" render={({ field }) => (
                <FormItem>
                    <FormLabel>Marital Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                        <SelectContent>{maritalStatusOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}/>
        </div>

        {/* Foreign Applicant Conditional Section */}
        {isForeign && (
          <div className="space-y-6 pt-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 text-primary">
              <Globe className="h-4 w-4" />
              <h4 className="text-xs font-black uppercase tracking-widest">Foreign Applicant Details</h4>
            </div>
            <Separator className="opacity-50" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="passportNumber" render={({ field }) => (
                  <FormItem><FormLabel>Passport Number</FormLabel><FormControl><Input placeholder="Enter passport number" {...field} value={field.value || ''} disabled={disabled} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="countryOfOrigin" render={({ field }) => (
                  <FormItem><FormLabel>Country of Origin</FormLabel><FormControl><Input placeholder="e.g. South Africa" {...field} value={field.value || ''} disabled={disabled} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="visaPermitNumber" render={({ field }) => (
                  <FormItem><FormLabel>Visa / Permit Number</FormLabel><FormControl><Input placeholder="Enter number" {...field} value={field.value || ''} disabled={disabled} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="permitExpiryDate" render={({ field }) => (
                  <FormItem><FormLabel>Permit Expiry Date</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} disabled={disabled} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
          </div>
        )}

        <FormField control={form.control} name="individualAddress" render={({ field }) => (
            <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Street, City" {...field} value={field.value || ''} disabled={disabled} /></FormControl><FormMessage /></FormItem>
        )}/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="individualMobileNumber" render={({ field }) => (
                <FormItem><FormLabel>Mobile</FormLabel><FormControl><Input placeholder="+263..." {...field} value={field.value || ''} disabled={disabled} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
      </div>
    </div>
  );
}
