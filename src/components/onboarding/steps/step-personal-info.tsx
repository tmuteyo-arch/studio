'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StepPersonalInfo() {
  const form = useFormContext<OnboardingFormData>();
  const clientType = form.watch('clientType');

  const isPersonal = ['Personal Account', 'Proprietorship / Sole Trader'].includes(clientType);
  const isCorporate = !isPersonal && clientType;

  return (
    <div>
      <CardHeader>
        <CardTitle>Applicant Information</CardTitle>
        <CardDescription>
            { isCorporate 
              ? "Provide the legal name of the organization and the details for the primary contact person."
              : "Please provide the applicant's primary details."
            }
        </CardDescription>
      </CardHeader>
      <div className="space-y-4 px-6">
        {isCorporate && (
            <FormField
            control={form.control}
            name={'organisationLegalName'}
            render={({ field }) => (
                <FormItem>
                <FormLabel>Organisation's Legal Name</FormLabel>
                <FormControl>
                    <Input placeholder={'e.g., Acme Inc.'} {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        )}
        
        <div className={isCorporate ? "pt-4 border-t" : ""}>
            {isCorporate && <p className="text-sm font-medium text-muted-foreground mb-4">Primary Contact Person Details</p>}
            <div className='space-y-4'>
                <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{isCorporate ? 'Contact Full Name' : 'Full Name'}</FormLabel>
                    <FormControl>
                        <Input placeholder={isCorporate ? 'e.g., John Doe' : 'e.g., Jane Doe'} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormField
                    control={form.control}
                    name={'dateOfBirth'}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{isCorporate ? 'Contact Person\'s Date of Birth' : 'Date of Birth'}</FormLabel>
                        <FormControl>
                        <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{isCorporate ? 'Contact Person\'s Home Address' : 'Home Address'}</FormLabel>
                    <FormControl>
                        <Input placeholder="123 Main St, Anytown" {...field} />
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
