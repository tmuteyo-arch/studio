
'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zimRegions, OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function StepAccountType() {
  const form = useFormContext<OnboardingFormData>();
  const clientType = form.watch('clientType');

  return (
    <div>
      <CardHeader>
        <CardTitle>Application Context</CardTitle>
        <CardDescription>You are originating a record for a <strong>{clientType}</strong>. Please select the operating region.</CardDescription>
      </CardHeader>
      <div className="space-y-6 px-6">
        {/* Read-only display of the pre-selected account type */}
        <div className="p-4 border rounded-md bg-muted/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Product Category</p>
                <p className="text-sm font-semibold">Originating Record Type</p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black px-4 py-1.5 uppercase tracking-wider text-[11px]">
                {clientType}
            </Badge>
        </div>

        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Operating Region (Zimbabwe)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select province/region..." />
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
