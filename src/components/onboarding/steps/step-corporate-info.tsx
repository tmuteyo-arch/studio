'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { OnboardingFormData, businessTypes } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StepCorporateInfo() {
  const form = useFormContext<OnboardingFormData>();

  return (
    <div>
      <CardHeader>
        <CardTitle>Corporate Details</CardTitle>
        <CardDescription>
          Please provide the mandatory legal and operational details for the company.
        </CardDescription>
      </CardHeader>
      <div className="space-y-4 px-6">
        <FormField
          control={form.control}
          name="organisationLegalName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organisation’s Legal Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Rubieson Enterprises (Pvt) Ltd" {...field} value={field.value || ''}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="natureOfBusiness"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type of Business (Industry)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business industry..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="certificateOfIncorporationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificate of Incorporation Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 12345/2021" {...field} value={field.value || ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfIncorporation"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Date of Incorporation</FormLabel>
                <FormControl>
                    <Input type="date" {...field} value={field.value || ''}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

         <FormField
            control={form.control}
            name="physicalAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Physical Business Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Business Ave, Workington, Harare" {...field} value={field.value || ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="businessTelNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Telephone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+263 4 123 456" {...field} value={field.value || ''}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Official Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@company.com" {...field} value={field.value || ''}/>
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
