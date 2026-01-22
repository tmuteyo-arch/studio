'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-foreground mt-6 mb-4 border-b pb-2">{children}</h3>
);

export default function StepIndividualInfo() {
  const form = useFormContext<OnboardingFormData>();

  return (
    <div>
      <CardHeader>
        <CardTitle>Personal Account Application</CardTitle>
        <CardDescription>Please complete all sections with the applicant's details.</CardDescription>
      </CardHeader>
      <div className="px-6 space-y-4">
        
        <SectionTitle>1. Account Specifications</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="branch" render={({ field }) => (
                <FormItem><FormLabel>Branch</FormLabel><FormControl><Input placeholder="e.g., Harare Main" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="referredBy" render={({ field }) => (
                <FormItem><FormLabel>Referred by</FormLabel><FormControl><Input placeholder="Staff or agent name" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="accountSpecType" render={({ field }) => (
                <FormItem>
                    <FormLabel>Type of Account</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select account type..." /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="Current">Current</SelectItem><SelectItem value="Savings">Savings</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="accountSpecCurrency" render={({ field }) => (
                <FormItem>
                    <FormLabel>Currency of Account</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select currency..." /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="Local Currency">Local Currency (ZWL)</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}/>
        </div>

        <SectionTitle>2. Personal Details</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="individualTitle" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select title" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Mr.">Mr.</SelectItem><SelectItem value="Mrs.">Mrs.</SelectItem><SelectItem value="Miss.">Miss.</SelectItem>
                            <SelectItem value="Dr.">Dr.</SelectItem><SelectItem value="Prof.">Prof.</SelectItem><SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                <FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="individualFirstName" render={({ field }) => (
                <FormItem><FormLabel>First Name(s)</FormLabel><FormControl><Input placeholder="e.g., John" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="individualSurname" render={({ field }) => (
                <FormItem><FormLabel>Surname</FormLabel><FormControl><Input placeholder="e.g., Doe" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="individualDateOfBirth" render={({ field }) => (
                <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="individualPlaceOfBirth" render={({ field }) => (
                <FormItem><FormLabel>Place of Birth</FormLabel><FormControl><Input placeholder="e.g., Harare" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="individualIdType" render={({ field }) => (
                <FormItem><FormLabel>Form of Identification</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select ID type" /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="National ID">National ID</SelectItem><SelectItem value="Passport">Passport</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                    </Select>
                <FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="individualIdNumber" render={({ field }) => (
                <FormItem><FormLabel>ID Number</FormLabel><FormControl><Input placeholder="ID document number" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="individualGender" render={({ field }) => (
                <FormItem><FormLabel>Gender</FormLabel>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center gap-4 pt-2">
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem>
                    </RadioGroup>
                <FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="individualMaritalStatus" render={({ field }) => (
                 <FormItem><FormLabel>Marital Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Divorced">Divorced</SelectItem><SelectItem value="Widowed">Widowed</SelectItem>
                        </SelectContent>
                    </Select>
                <FormMessage /></FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="individualAddress" render={({ field }) => (
            <FormItem><FormLabel>Home Address</FormLabel><FormControl><Input placeholder="123 Main St, Anytown" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="individualMobileNumber" render={({ field }) => (
                <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="+263 77 123 4567" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="individualInnbucksWalletAccount" render={({ field }) => (
                <FormItem><FormLabel>InnBucks Wallet Account No.</FormLabel><FormControl><Input placeholder="Wallet account number" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>

        <SectionTitle>3. Employment Status</SectionTitle>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="occupation" render={({ field }) => (
                <FormItem><FormLabel>Occupation</FormLabel><FormControl><Input placeholder="e.g., Accountant" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="employerName" render={({ field }) => (
                <FormItem><FormLabel>Employer's Name</FormLabel><FormControl><Input placeholder="Company name" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="employerAddress" render={({ field }) => (
            <FormItem><FormLabel>Employer's Address</FormLabel><FormControl><Input placeholder="Employer's physical address" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="employerTel" render={({ field }) => (
                <FormItem><FormLabel>Employer's Telephone No.</FormLabel><FormControl><Input placeholder="Business phone" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="dateOfEmployment" render={({ field }) => (
                <FormItem><FormLabel>Date of Employment</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="employerSector" render={({ field }) => (
             <FormItem><FormLabel>Employer's Sector</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="Financial Services">Financial Services</SelectItem><SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Mining">Mining</SelectItem><SelectItem value="Construction">Construction</SelectItem>
                        <SelectItem value="Agriculture">Agriculture</SelectItem><SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Security Services">Security Services</SelectItem><SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            <FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="grossMonthlyIncome" render={({ field }) => (
                <FormItem><FormLabel>Gross Monthly Salary</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="otherIncome" render={({ field }) => (
                <FormItem><FormLabel>Other Income</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
      </div>
    </div>
  );
}
