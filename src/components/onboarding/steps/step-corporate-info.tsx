'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StepCorporateInfo() {
  const form = useFormContext<OnboardingFormData>();

  return (
    <div>
      <CardHeader>
        <CardTitle>Corporate Details</CardTitle>
        <CardDescription>
          Please provide the legal name and incorporation details for the company.
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
                <Input placeholder="e.g. Rubieson Enterprises" {...field} />
              </FormControl>
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
                  <Input placeholder="e.g. 12345/2021" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="countryOfIncorporation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country of Incorporation</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Zimbabwe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="dateOfIncorporation"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Date of Incorporation/Registration</FormLabel>
                <FormControl>
                    <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
      </div>
    </div>
  );
}
