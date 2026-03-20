'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zimRegions, OnboardingFormData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Calendar, User, LayoutDashboard, FileText, MapPin, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function StepAccountType() {
  const form = useFormContext<OnboardingFormData>();
  const clientType = form.watch('clientType');
  const region = form.watch('region');
  const [userName] = React.useState('CHIDO');

  return (
    <div className="flex flex-col h-full bg-[#0f172a] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      {/* System Header */}
      <header className="bg-[#4c1d95] p-5 flex items-center justify-between text-white border-b border-white/10 shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-2 rounded-lg shadow-inner">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-[0.1em] uppercase">BR.NET V4.2</h2>
            <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Banking Registry System</p>
          </div>
        </div>
        <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full">
            <User className="h-3.5 w-3.5 text-primary" />
            <span>{userName}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>{format(new Date(), 'dd-MMM-yyyy').toUpperCase()}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4">
        {/* Main Content Area */}
        <div className="md:col-span-3 p-10 flex flex-col items-center justify-center bg-black/10 relative">
          <div className="absolute top-6 left-8 flex items-center gap-2 text-primary/60 text-[10px] font-black uppercase tracking-[0.3em]">
            <LayoutDashboard className="h-4 w-4" />
            Selected Technical Context
          </div>

          <div className="w-full max-w-lg p-12 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-xl text-center shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-3">Active Originating Class</p>
            <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-6">{clientType || 'Not Selected'}</h4>
            
            <div className="flex items-center justify-center gap-3">
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] font-bold px-3 py-1 tracking-wider uppercase flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Validated
              </Badge>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold px-3 py-1 tracking-wider uppercase">Locked Context</Badge>
            </div>
            
            <p className="text-xs text-white/40 mt-10 leading-relaxed max-w-xs mx-auto font-medium italic">
              The account type has been locked from the dashboard selection. 
              Proceed to specify the operating region in the sidebar.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 border-l border-white/5 bg-white/[0.02] p-8 flex flex-col">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                OPERATING REGION
              </label>
              <p className="text-[11px] text-white/40 leading-relaxed font-medium">Select province where operations are based.</p>
            </div>
            
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 bg-black/40 border-white/10 text-white font-bold text-xs uppercase tracking-[0.1em] shadow-lg focus:ring-primary/50 transition-all">
                        <SelectValue placeholder="PICK REGION..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1e1b4b] border-white/10 text-white">
                      {zimRegions.map((r) => (
                        <SelectItem key={r} value={r} className="uppercase text-[10px] font-bold tracking-widest py-3">
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px] uppercase font-bold text-destructive mt-2" />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-auto">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 shadow-xl">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 border-b border-white/5 pb-2">Technical Context</p>
              <div className="space-y-4 font-mono text-[10px]">
                <div className="flex flex-col gap-1">
                  <span className="text-white/30 uppercase tracking-widest">Type:</span>
                  <span className="text-white font-bold leading-tight uppercase">{clientType || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-white/30 uppercase tracking-widest">Prov:</span>
                  <span className={region ? "text-primary font-bold uppercase" : "text-white/20 italic"}>
                    {region || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
