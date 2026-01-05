'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function StepCorporateInfo() {
  const form = useFormContext<OnboardingFormData>();
  const { watch } = form;
  
  const hasOtherAccounts = watch('hasOtherAccounts');
  const premisesStatus = watch('premisesStatus');
  const clientType = watch('clientType');
  const isCompany = clientType === 'Company (Private / Public Limited)';


  return (
    <div>
      <CardHeader>
        <CardTitle>Corporate Application Form</CardTitle>
        <CardDescription>Please complete all sections in block capitals where applicable.</CardDescription>
      </CardHeader>
      <div className="px-6">
        <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <h3 className="font-semibold text-lg">Customer Information</h3>
            </AccordionTrigger>
            <AccordionContent className="p-1">
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="organisationLegalName" render={({ field }) => ( <FormItem> <FormLabel>Organisation’s Legal Name</FormLabel> <FormControl><Input placeholder="e.g. Acme Inc." {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                  <FormField control={form.control} name="tradeName" render={({ field }) => ( <FormItem> <FormLabel>Trade Name (if different)</FormLabel> <FormControl><Input placeholder="e.g. Acme" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                <FormField control={form.control} name="physicalAddress" render={({ field }) => ( <FormItem> <FormLabel>Physical Address</FormLabel> <FormControl><Input placeholder="123 Business Rd, Capital City" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="postalAddress" render={({ field }) => ( <FormItem> <FormLabel>Postal Address</FormLabel> <FormControl><Input placeholder="P.O. Box 123, Capital City" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="webAddress" render={({ field }) => ( <FormItem> <FormLabel>Web Address</FormLabel> <FormControl><Input placeholder="https://www.acme.com" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField control={form.control} name="businessTelNumber" render={({ field }) => ( <FormItem> <FormLabel>Business Tel Number</FormLabel> <FormControl><Input placeholder="+263 4 123 456" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                  <FormField control={form.control} name="faxNumber" render={({ field }) => ( <FormItem> <FormLabel>Fax Number</FormLabel> <FormControl><Input placeholder="+263 4 123 457" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                  <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email Address</FormLabel> <FormControl><Input type="email" placeholder="contact@acme.com" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                <Separator />
                <FormField control={form.control} name="natureOfBusiness" render={({ field }) => ( <FormItem> <FormLabel>Nature of Business Activities</FormLabel> <FormControl><Input placeholder="e.g. Software Development" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="sourceOfWealth" render={({ field }) => ( <FormItem> <FormLabel>Source of Wealth</FormLabel> <FormControl><Input placeholder="e.g. Business operations" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="typeOfBusiness" render={({ field }) => ( <FormItem> <FormLabel>Type of Business</FormLabel> <FormControl><Input placeholder="e.g. Private Limited" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="noOfEmployees" render={({ field }) => ( <FormItem> <FormLabel>Number of Employees</FormLabel> <FormControl><Input type="number" placeholder="e.g. 25" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="economicSector" render={({ field }) => ( <FormItem> <FormLabel>Economic Sector</FormLabel> <FormControl><Input placeholder="e.g. Technology" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                <Separator />
                { isCompany && <FormField control={form.control} name="authorisedCapital" render={({ field }) => ( <FormItem> <FormLabel>Authorised Capital</FormLabel> <FormControl><Input placeholder="e.g. $100,000" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/> }
                <FormField control={form.control} name="taxPayerNumber" render={({ field }) => ( <FormItem> <FormLabel>BP/ Tax Payer’s Number</FormLabel> <FormControl><Input placeholder="Enter number" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="dateOfIncorporation" render={({ field }) => ( <FormItem> <FormLabel>Date of Incorporation/Registration</FormLabel> <FormControl><Input type="date" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="countryOfIncorporation" render={({ field }) => ( <FormItem> <FormLabel>Country of Incorporation</FormLabel> <FormControl><Input placeholder="e.g. Zimbabwe" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                <FormField control={form.control} name="certificateOfIncorporationNumber" render={({ field }) => ( <FormItem> <FormLabel>Certificate of Incorporation Number</FormLabel> <FormControl><Input placeholder="e.g. 12345/2021" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <h3 className="font-semibold text-lg">Account & Financial Details</h3>
            </AccordionTrigger>
            <AccordionContent className="p-1">
              <div className="space-y-4 pt-2">
                 <FormField
                    control={form.control}
                    name="hasOtherAccounts"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Does your organisation have any other existing account(s) with InnBucks?</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center space-x-4"
                            >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="Yes" /></FormControl>
                                <FormLabel className="font-normal">Yes</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="No" /></FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                {hasOtherAccounts === 'Yes' && (
                    <FormField control={form.control} name="otherAccountNumbers" render={({ field }) => ( <FormItem> <FormLabel>If yes, specify Account Number(s)</FormLabel> <FormControl><Textarea placeholder="Enter account numbers, separated by commas" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                )}
                <Separator />
                <p className="text-sm font-medium">Do you have any accounts with another bank?</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md">
                     <FormField control={form.control} name="otherBank1Name" render={({ field }) => ( <FormItem> <FormLabel>Bank 1 Name</FormLabel> <FormControl><Input placeholder="Bank Name" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                     <FormField control={form.control} name="otherBank1AccName" render={({ field }) => ( <FormItem> <FormLabel>Account Name</FormLabel> <FormControl><Input placeholder="Account Name" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                     <FormField control={form.control} name="otherBank1AccNumber" render={({ field }) => ( <FormItem> <FormLabel>Account Number</FormLabel> <FormControl><Input placeholder="Account Number" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
           <AccordionItem value="item-3">
            <AccordionTrigger>
              <h3 className="font-semibold text-lg">Service Registration</h3>
            </AccordionTrigger>
            <AccordionContent className="p-1">
               <div className="space-y-4 pt-2">
                 <FormField
                    control={form.control}
                    name="communicationPreference"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>How would you like us to communicate with you?</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center space-x-4"
                            >
                            {['Email', 'Fax', 'Letter', 'Telephone'].map(pref => (
                                <FormItem key={pref} className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value={pref} /></FormControl>
                                    <FormLabel className="font-normal">{pref}</FormLabel>
                                </FormItem>
                            ))}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <Separator/>
                 <FormItem>
                    <FormLabel>If you wish to have some of these services, please indicate below.</FormLabel>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                        <FormField control={form.control} name="requestedServices.internetBanking" render={({ field }) => ( <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Internet Banking</FormLabel> </FormItem> )}/>
                        <FormField control={form.control} name="requestedServices.standingOrder" render={({ field }) => ( <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Standing Order</FormLabel> </FormItem> )}/>
                        <FormField control={form.control} name="requestedServices.accountSweep" render={({ field }) => ( <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Account Sweep</FormLabel> </FormItem> )}/>
                        <FormField control={form.control} name="requestedServices.salaryServices" render={({ field }) => ( <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Salary Services</FormLabel> </FormItem> )}/>
                        <FormField control={form.control} name="requestedServices.posInfrastructure" render={({ field }) => ( <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">POS Infrastructure</FormLabel> </FormItem> )}/>
                     </div>
                </FormItem>
                <Separator/>
                <FormField
                    control={form.control}
                    name="premisesStatus"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Premises Status</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center space-x-4"
                            >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="Owned" /></FormControl>
                                <FormLabel className="font-normal">Owned</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="Rented" /></FormControl>
                                <FormLabel className="font-normal">Rented</FormLabel>
                            </FormItem>
                             <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="Other" /></FormControl>
                                <FormLabel className="font-normal">Other</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                {premisesStatus === 'Other' && (
                     <FormField control={form.control} name="premisesOtherDetails" render={({ field }) => ( <FormItem> <FormLabel>If Other, please specify</FormLabel> <FormControl><Input placeholder="Specify premises status" {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                )}
               </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
