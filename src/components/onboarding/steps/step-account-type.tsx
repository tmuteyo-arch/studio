'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zimRegions, OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StepAccountType() {
  const form = useFormContext<OnboardingFormData>();
  const clientType = form.watch('clientType');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader className="px-6 pb-2">
        <CardTitle className="text-xl font-bold uppercase tracking-tight">
          Settings
        </CardTitle>
        <CardDescription>
          Choose the region.
        </CardDescription>
      </CardHeader>
      
      <div className="px-6 space-y-8 py-6">
        {/* Selected Context Display */}
        <div className="p-6 rounded-xl bg-muted/30 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type</p>
            <h3 className="text-xl font-black text-foreground uppercase">{clientType || 'None'}</h3>
          </div>
          <Badge variant="success" className="h-8 px-4 flex items-center gap-2 uppercase tracking-wider text-[10px] font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" /> Locked
          </Badge>
        </div>

        {/* Operating Region Selection */}
        <div className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <FormLabel className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Region
            </FormLabel>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pick the province.
            </p>
          </div>
          
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-background border-primary/20">
                      <SelectValue placeholder="Choose province..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[300px]">
                    {zimRegions.map((r) => (
                      <SelectItem key={r} value={r} className="py-3 font-semibold">
                        {r}
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
    </div>
  );
}