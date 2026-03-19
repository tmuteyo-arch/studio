'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { zimRegions, OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StepAccountType() {
  const form = useFormContext<OnboardingFormData>();

  return (
    <div>
      <CardHeader>
        <CardTitle>Application Context</CardTitle>
        <CardDescription>Confirm the account category and operating region.</CardDescription>
      </CardHeader>
      <div className="space-y-6 px-6">
        <FormField
          control={form.control}
          name="clientType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an account type..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Personal Accounts</SelectLabel>
                    <SelectItem value="Individual Accounts">Individual Accounts</SelectItem>
                    <SelectItem value="Sole traders">Sole traders</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Corporate Banking</SelectLabel>
                    <SelectItem value="Private Limited (Pvt) Company">Private Limited (Pvt) Company</SelectItem>
                    <SelectItem value="Private Business Corporate (PBC)">Private Business Corporate (PBC)</SelectItem>
                    <SelectItem value="Public Limited company">Public Limited company</SelectItem>
                    <SelectItem value="Partnerships">Partnerships</SelectItem>
                    <SelectItem value="Investment Group">Investment Group</SelectItem>
                    <SelectItem value="Parastatal">Parastatal</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Institutions</SelectLabel>
                    <SelectItem value="NGO">NGO</SelectItem>
                    <SelectItem value="Church">Church</SelectItem>
                    <SelectItem value="School">School</SelectItem>
                    <SelectItem value="Society">Society</SelectItem>
                    <SelectItem value="Club/ Association">Club/ Association</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operating Region (Zimbabwe)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a region..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {zimRegions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
