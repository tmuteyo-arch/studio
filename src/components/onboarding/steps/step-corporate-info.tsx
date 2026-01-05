'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function StepCorporateInfo() {
  const form = useFormContext<OnboardingFormData>();

  return (
    <div>
      <CardHeader>
        <CardTitle>Corporate Information</CardTitle>
        <CardDescription>Please provide the organisation's details.</CardDescription>
      </CardHeader>
      <div className="space-y-4 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="organisationLegalName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Organisation’s Legal Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. Acme Inc." {...field} />
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
                <FormLabel>Trade Name (if different)</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. Acme" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="physicalAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Physical Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Business Rd, Capital City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="postalAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Address</FormLabel>
              <FormControl>
                <Input placeholder="P.O. Box 123, Capital City" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="businessTelNumber"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Business Tel Number</FormLabel>
                <FormControl>
                    <Input placeholder="+263 4 123 456" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input type="email" placeholder="contact@acme.com" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="webAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Web Address</FormLabel>
              <FormControl>
                <Input placeholder="https://www.acme.com" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="dateOfIncorporation"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Date of Incorporation/Registration</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} />
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
                    <FormLabel>Country of Incorporation</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. Zimbabwe" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="certificateOfIncorporationNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certificate of Incorporation Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 12345/2021" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="natureOfBusiness"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nature of Business Activities</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Software Development" {...field} value={field.value ?? ''} />
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
              <FormLabel>Source of Wealth</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the primary source of the company's funds..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="noOfEmployees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Employees</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 25" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="economicSector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Economic Sector</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Technology" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
