'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { OnboardingFormData, businessTypes } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function StepCorporateInfo({ disabled }: { disabled?: boolean }) {
  const form = useFormContext<OnboardingFormData>();
  const hasExistingAccounts = form.watch('hasExistingAccounts');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader className="px-6 pb-2">
        <CardTitle className="text-xl font-bold uppercase tracking-tight">Business Information</CardTitle>
        <CardDescription>
          Enter the mandatory legal entity details for this account.
        </CardDescription>
      </CardHeader>
      
      <div className="space-y-8 px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="organisationLegalName"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Organisation’s Legal Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter registered name" {...field} value={field.value || ''} disabled={disabled} className="h-12 border-primary/20 focus:ring-primary font-bold" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="certificateOfIncorporationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Certificate of Incorporation Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. CI-12345" {...field} value={field.value || ''} disabled={disabled} className="h-12 border-primary/20 focus:ring-primary font-mono" />
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
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Country of Incorporation</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Zimbabwe" {...field} value={field.value || ''} disabled={disabled} className="h-12 border-primary/20 focus:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfIncorporationRegistration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date of Incorporation / Registration</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ''} disabled={disabled} className="h-12 border-primary/20 focus:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tradeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trade Name</FormLabel>
                <FormControl>
                  <Input placeholder="Trading as..." {...field} value={field.value || ''} disabled={disabled} className="h-12 border-primary/20 focus:ring-primary font-bold" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="authorisedCapital"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Authorised Capital</FormLabel>
                <FormControl>
                  <Input placeholder="Enter amount" {...field} value={field.value || ''} disabled={disabled} className="h-12 border-primary/20 focus:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bpTaxPayerNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">BP / Tax Payer’s Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter BP number" {...field} value={field.value || ''} disabled={disabled} className="h-12 border-primary/20 focus:ring-primary font-mono" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tinNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">TIN Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter TIN" {...field} value={field.value || ''} disabled={disabled} className="h-12 border-primary/20 focus:ring-primary font-mono" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
          <FormField
            control={form.control}
            name="postalAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Postal Address</FormLabel>
                <FormControl>
                  <Input placeholder="P.O. Box..." {...field} value={field.value || ''} disabled={disabled} className="h-12 border-primary/20 focus:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="physicalAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Physical Address</FormLabel>
                <FormControl>
                  <Input placeholder="Street, Number, Suburb, City" {...field} value={field.value || ''} disabled={disabled} className="h-12 border-primary/20 focus:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessTelNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Business Tel Number</FormLabel>
                <FormControl>
                  <Input placeholder="+263..." {...field} value={field.value || ''} disabled={disabled} className="h-12 border-primary/20 focus:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="organisation@email.com" {...field} value={field.value || ''} disabled={disabled} className="h-12 border-primary/20 focus:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="webAddress"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Web Address (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.organisation.com" {...field} value={field.value || ''} disabled={disabled} className="h-12 border-primary/20 focus:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
          <FormField
            control={form.control}
            name="natureOfBusinessActivities"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nature of Business Activities</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Retail of consumer electronics" {...field} value={field.value || ''} disabled={disabled} className="h-12 border-primary/20 focus:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sourceOfWealth"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source of Wealth</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Retained earnings, Shareholder investment" {...field} value={field.value || ''} disabled={disabled} className="h-12 border-primary/20 focus:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="typeOfBusiness"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type of Business</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
                  <FormControl>
                    <SelectTrigger className="h-12 border-primary/20">
                      <SelectValue placeholder="Choose type..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type} className="font-bold py-3">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-6 border-t border-white/5 space-y-6 bg-muted/10 p-6 rounded-2xl">
          <FormField
            control={form.control}
            name="hasExistingAccounts"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-xs font-bold uppercase tracking-tight text-foreground">Does Your Organisation Have Any Other Existing Account(s) with InnBucks?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(v) => field.onChange(v === 'true')}
                    defaultValue={field.value ? 'true' : 'false'}
                    className="flex gap-6"
                    disabled={disabled}
                  >
                    <div className="flex items-center space-x-2 cursor-pointer">
                      <RadioGroupItem value="true" id="existing-yes" />
                      <Label htmlFor="existing-yes" className="font-bold cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2 cursor-pointer">
                      <RadioGroupItem value="false" id="existing-no" />
                      <Label htmlFor="existing-no" className="font-bold cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {hasExistingAccounts && (
            <FormField
              control={form.control}
              name="existingAccountsDetails"
              render={({ field }) => (
                <FormItem className="animate-in slide-in-from-top-2">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">If Yes, Please Specify:</FormLabel>
                  <FormControl>
                    <Textarea placeholder="List existing account numbers or names..." {...field} value={field.value || ''} disabled={disabled} className="min-h-[100px] border-primary/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
