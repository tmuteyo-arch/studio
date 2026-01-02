import { z } from 'zod';

export const OnboardingFormSchema = z.object({
  clientType: z.string().min(1, { message: 'Please select an account type.' }),
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  dateOfBirth: z.string().refine((dob) => new Date(dob).toString() !== 'Invalid Date', {
    message: 'Please enter a valid date of birth.',
  }),
  address: z.string().min(10, { message: 'Address must be at least 10 characters.' }),
  document1Type: z.string().min(1, { message: 'Please select a document type.' }),
  document2Type: z.string().min(1, { message: 'Please select a document type.' }),
  signature: z.string().min(2, { message: 'Please provide your full name as signature.' }),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions.',
  }),
});

export type OnboardingFormData = z.infer<typeof OnboardingFormSchema>;

export type Step = {
  id: string;
  name: string;
  fields?: (keyof OnboardingFormData)[];
};

export const accountTypes = [
  'Personal Account',
  'Proprietorship / Sole Trader',
  'Partnership',
  'Company (Private / Public Limited)',
  'PBC Account',
  'Trust',
  'NGO / Non-Profit / Embassy',
  'Society / Association / Club',
  'Government / Local Authority',
  'Minors',
  'Professional Intermediaries',
];
