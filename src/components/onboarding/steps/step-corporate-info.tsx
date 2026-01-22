'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-foreground mt-6 mb-4 border-b pb-2">{children}</h3>
);


export default function StepCorporateInfo() {
  const form = useFormContext<OnboardingFormData>();

  return (
    <div>
      <CardHeader>
        <CardTitle>Corporate Account Application</CardTitle>
        <CardDescription>
          Please provide the legal and operational details for the company.
        </CardDescription>
      </CardHeader>
      <div className="space-y-4 px-6">
        <SectionTitle>1. Business Identification</SectionTitle>
        <FormField
          control={form.control}
          name="organisationLegalName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organisation’s Legal Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Rubieson Enterprises (Pvt) Ltd" {...field} value={field.value || ''}/>
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
                <Input placeholder="e.g. Rubieson's" {...field} value={field.value || ''}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SectionTitle>2. Registration Details</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="certificateOfIncorporationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificate of Incorporation Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 12345/2021" {...field} value={field.value || ''}/>
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
                  <Input placeholder="e.g. Zimbabwe" {...field} value={field.value || ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="dateOfIncorporation"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Date of Incorporation/Registration</FormLabel>
                <FormControl>
                    <Input type="date" {...field} value={field.value || ''}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        <SectionTitle>3. Business Operations</SectionTitle>
         <FormField
            control={form.control}
            name="physicalAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Physical Business Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Business Ave, Workington, Harare" {...field} value={field.value || ''}/>
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
                  <Input placeholder="e.g., Retail, Manufacturing, etc." {...field} value={field.value || ''}/>
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
                    <FormLabel>Business Telephone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+263 4 123 456" {...field} value={field.value || ''}/>
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
                    <FormLabel>Official Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@company.com" {...field} value={field.value || ''}/>
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
