'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zimRegions, OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, MapPin, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StepAccountType() {
  const form = useFormContext<OnboardingFormData>();
  const clientType = form.watch('clientType');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader className="px-6 pb-2">
        <CardTitle className="flex items-center gap-2 text-xl font-bold uppercase tracking-tight">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          Technical Application Context
        </CardTitle>
        <CardDescription>
          Confirm the registry category and specify the mandatory operating region for this record.
        </CardDescription>
      </CardHeader>
      
      <div className="px-6 space-y-8 py-6">
        {/* Selected Context Display (Locked) */}
        <div className="p-6 rounded-xl bg-muted/30 border border-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Registry technical context</p>
            <h3 className="text-2xl font-black tracking-tighter text-foreground uppercase">{clientType || 'Not Selected'}</h3>
          </div>
          <Badge variant="success" className="h-8 px-4 flex items-center gap-2 uppercase tracking-wider text-[10px] font-bold border-green-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" /> Selection Locked
          </Badge>
        </div>

        {/* Operating Region Selection */}
        <div className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <FormLabel className="text-xs font-bold uppercase tracking-[0.1em] flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Operating Registry Province
            </FormLabel>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Specify the province where the applicant's operations are primarily based. 
              This selection is mandatory for regional regulatory reporting.
            </p>
          </div>
          
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-background shadow-sm border-primary/20 focus:ring-primary">
                      <SelectValue placeholder="Choose a province..." />
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
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-6 border-t border-dashed border-muted">
            <p className="text-[10px] text-muted-foreground italic flex items-center gap-2 leading-relaxed">
                <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                Category selection is automatically verified based on your dashboard selection.
            </p>
        </div>
      </div>
    </div>
  );
}
