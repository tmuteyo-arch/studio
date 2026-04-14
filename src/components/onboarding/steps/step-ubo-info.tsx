'use client';

import * as React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Users, PieChart, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function StepUboInfo({ disabled }: { disabled?: boolean }) {
  const form = useFormContext<OnboardingFormData>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'beneficialOwners',
  });

  const totalOwnership = fields.reduce((sum, _, index) => {
    const val = form.watch(`beneficialOwners.${index}.percentage`);
    return sum + (Number(val) || 0);
  }, 0);

  const isComplete = Math.abs(totalOwnership - 100) < 0.01;

  const addNewUbo = () => {
    append({
      fullName: '',
      idNumber: '',
      percentage: 0,
      position: '',
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader className="px-6 pb-2">
        <CardTitle className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Ultimate Beneficial Ownership (UBO)
        </CardTitle>
        <CardDescription>
          Regulatory Requirement: Declare all individuals who own or control 10% or more of the entity.
        </CardDescription>
      </CardHeader>

      <div className="px-6 space-y-8 py-6">
        <Alert className={isComplete ? "bg-green-500/10 border-green-500/20" : "bg-primary/5 border-primary/20"}>
          <PieChart className="h-4 w-4" />
          <AlertTitle className="text-[10px] font-black uppercase tracking-widest">Ownership Allocation</AlertTitle>
          <AlertDescription className="flex items-center justify-between mt-2">
            <span className="text-sm font-bold">Total Disclosed: {totalOwnership}%</span>
            {isComplete ? (
              <Badge variant="success" className="font-black">100% DISCLOSED</Badge>
            ) : (
              <Badge variant="outline" className="font-black border-primary/30 text-primary">AWAITING 100%</Badge>
            )}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-6 border rounded-xl bg-card shadow-sm relative group animate-in zoom-in-95">
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name={`beneficialOwners.${index}.fullName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter legal name" {...field} disabled={disabled} className="h-12 border-primary/20 font-bold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`beneficialOwners.${index}.idNumber`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID / Passport Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Registry ID" {...field} disabled={disabled} className="h-12 border-primary/20 font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`beneficialOwners.${index}.position`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Position / Role</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Managing Director" {...field} disabled={disabled} className="h-12 border-primary/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`beneficialOwners.${index}.percentage`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ownership Percentage (%)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={disabled} 
                            className="h-12 border-primary/20 font-black pr-10 text-xl" 
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}

          {!disabled && (
            <Button
              type="button"
              variant="outline"
              className="w-full h-16 border-dashed border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all text-primary font-black uppercase tracking-widest rounded-xl"
              onClick={addNewUbo}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Beneficial Owner
            </Button>
          )}
        </div>

        {isComplete && (
          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <ShieldCheck className="h-5 w-5 text-green-500" />
            <p className="text-xs font-bold text-green-600 uppercase tracking-tight">Full disclosure achieved. Regulatory compliance verified for UBO capturing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
