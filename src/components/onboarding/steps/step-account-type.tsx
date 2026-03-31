'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zimRegions, OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, CheckCircle2, Hash, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function StepAccountType() {
  const form = useFormContext<OnboardingFormData>();
  const clientType = form.watch('clientType');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader className="px-6 pb-2">
        <CardTitle className="text-xl font-bold uppercase tracking-tight">
          Product Settings
        </CardTitle>
        <CardDescription>
          Provide the relationship type and operating details.
        </CardDescription>
      </CardHeader>
      
      <div className="px-6 space-y-8 py-6">
        {/* Selected Context Display */}
        <div className="p-6 rounded-xl bg-muted/30 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Entity Type</p>
            <h3 className="text-xl font-black text-foreground uppercase">{clientType || 'None'}</h3>
          </div>
          <Badge variant="success" className="h-8 px-4 flex items-center gap-2 uppercase tracking-wider text-[10px] font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" /> Selection Locked
          </Badge>
        </div>

        <div className="space-y-6">
            <div className="space-y-1.5">
                <FormLabel className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                Relationship Type
                </FormLabel>
                <p className="text-xs text-muted-foreground leading-relaxed">
                Choose the intended relationship with InnBucks.
                </p>
            </div>
            
            <FormField
                control={form.control}
                name="relationshipType"
                render={({ field }) => (
                <FormItem className="space-y-3">
                    <FormControl>
                    <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-xl hover:bg-muted/50 cursor-pointer transition-all flex-1">
                            <FormControl>
                                <RadioGroupItem value="Agency" />
                            </FormControl>
                            <Label className="font-bold cursor-pointer">Agency Agreement</Label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-xl hover:bg-muted/50 cursor-pointer transition-all flex-1">
                            <FormControl>
                                <RadioGroupItem value="Merchant" />
                            </FormControl>
                            <Label className="font-bold cursor-pointer">Merchant Services</Label>
                        </FormItem>
                    </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* Operating Region Selection */}
            <div className="space-y-4">
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

            {/* TIN Number Input */}
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-primary" />
                    TIN Number
                    </FormLabel>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                    Taxpayer Identification Number.
                    </p>
                </div>
                
                <FormField
                    control={form.control}
                    name="tinNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Input 
                                placeholder="Enter TIN Number..." 
                                className="h-12 bg-background border-primary/20 font-mono font-bold" 
                                {...field} 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
        </div>
      </div>
    </div>
  );
}
