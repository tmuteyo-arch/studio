'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zimRegions, OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Calendar, User, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const categories = [
  {
    title: 'IDENTITIES',
    items: ['Individuals', 'Minors']
  },
  {
    title: 'ACCOUNT',
    items: ['Sole Trader', 'Partnership', 'Company (Private / Public Limited)', 'PBC Account', 'Merchant Corporate Business']
  },
  {
    title: 'WORKFLOW SETTING',
    items: ['Trust', 'NGO', 'Church', 'School', 'Society / Club', 'Government / Local Authority']
  }
];

export default function StepAccountType() {
  const form = useFormContext<OnboardingFormData>();
  const clientType = form.watch('clientType');
  const [userName, setUserName] = React.useState('CHIDO'); // Mock user

  return (
    <div className="flex flex-col h-full bg-[#1e1b4b] rounded-lg overflow-hidden border border-white/10 shadow-2xl">
      {/* Legacy System Header */}
      <header className="bg-[#4c1d95] p-4 flex items-center justify-between text-white border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-1.5 rounded">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-widest uppercase">BR.NET V4.2</h2>
            <p className="text-[10px] opacity-70 font-bold uppercase tracking-tighter">Banking Registry System</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 opacity-50" />
            <span className="text-primary">{userName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 opacity-50" />
            <span>{format(new Date(), 'dd-MMM-yyyy')}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-0">
        {/* Hierarchical Menu */}
        <div className="md:col-span-3 p-6 space-y-8 bg-black/20">
          <div className="space-y-1">
            <h3 className="text-primary text-xs font-black uppercase tracking-[0.3em] mb-4 border-b border-primary/20 pb-2">Product Hierarchy</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat.title} className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white/40 tracking-widest uppercase">{cat.title}</h4>
                  <div className="space-y-1">
                    {cat.items.map((item) => {
                      const isActive = clientType === item;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => form.setValue('clientType', item, { shouldValidate: true })}
                          className={`w-full text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded transition-all flex items-center justify-between group ${
                            isActive 
                              ? 'bg-primary text-primary-foreground shadow-lg' 
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{item}</span>
                          {isActive && <ChevronRight className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operating Context Sidebar */}
        <div className="md:col-span-1 border-l border-white/10 bg-white/5 p-6 flex flex-col gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-primary">Operating Region</label>
              <p className="text-[10px] text-white/40 leading-tight">Select province where operations are based.</p>
            </div>
            
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-black/40 border-white/10 text-white font-bold text-xs uppercase tracking-wider">
                        <SelectValue placeholder="PICK REGION..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1e1b4b] border-white/10 text-white">
                      {zimRegions.map((region) => (
                        <SelectItem key={region} value={region} className="uppercase text-[10px] font-bold tracking-widest">
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px] uppercase font-bold" />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="p-3 rounded bg-primary/10 border border-primary/20 space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-primary">Technical Context</p>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-white/40">TYPE:</span>
                <span className="text-white font-bold">{clientType || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-white/40">PROV:</span>
                <span className="text-white font-bold">{form.watch('region') || 'PENDING'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
