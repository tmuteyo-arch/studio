'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function StepCorporateInfo() {
  const form = useFormContext<OnboardingFormData>();
  const { watch } = form;

  const clientType = watch('clientType');
  const isCompany = clientType === 'Company (Private / Public Limited)';

  return (
    <div>
      <CardHeader>
        <CardTitle>Application to open a Corporate Account</CardTitle>
        <CardDescription>Please complete all sections in block capitals where applicable.</CardDescription>
      </CardHeader>
      <div className="px-6">
        <Accordion type="single" collapsible defaultValue={'item-1'} className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <h3 className="font-semibold text-lg">Organisation Details</h3>
            </AccordionTrigger>
            <AccordionContent className="p-1">
              <div className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="organisationLegalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organisation’s Legal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="RUBIESON ENTERPRISES" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isCompany && (
                    <FormField
                      control={form.control}
                      name="authorisedCapital"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Authorised Capital</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. $100,000" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="taxPayerNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BP/ Tax Payer’s Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter number" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="noOfEmployees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Employees</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 25"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                          />
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
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
