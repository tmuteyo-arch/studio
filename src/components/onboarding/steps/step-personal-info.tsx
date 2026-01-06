'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StepPersonalInfo() {
  const form = useFormContext<OnboardingFormData>();
  const clientType = form.watch('clientType');

  const isPersonal = ['Personal Account', 'Proprietorship / Sole Trader'].includes(clientType);

  return (
    <div>
      <CardHeader>
        <CardTitle>Applicant Information</CardTitle>
        <CardDescription>Please provide the applicant's primary details.</CardDescription>
      </CardHeader>
      <div className="space-y-4 px-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isPersonal ? 'Full Name' : 'Company Name'}</FormLabel>
              <FormControl>
                <Input placeholder={isPersonal ? 'John Doe' : 'Acme Inc.'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name={isPersonal ? 'dateOfBirth' : 'dateOfIncorporation'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isPersonal ? 'Date of Birth' : 'Date of Incorporation'}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isPersonal ? 'Home Address' : 'Business Address'}</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, Anytown" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isPersonal && (
          <FormField
            control={form.control}
            name="certificateOfIncorporationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incorporation Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 12345/2021" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}
