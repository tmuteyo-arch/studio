import { z } from 'zod';

export const OnboardingFormSchema = z.object({
  clientType: z.string().min(1, { message: 'Please select an account type.' }),
  
  // Personal Info
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  dateOfBirth: z.string().refine((dob) => new Date(dob).toString() !== 'Invalid Date', {
    message: 'Please enter a valid date of birth.',
  }),
  address: z.string().min(10, { message: 'Address must be at least 10 characters.' }),
  
  // Corporate Info - NEW
  organisationLegalName: z.string().optional(),
  postalAddress: z.string().optional(),
  physicalAddress: z.string().optional(),
  webAddress: z.string().url().optional().or(z.literal('')),
  natureOfBusiness: z.string().optional(),
  sourceOfWealth: z.string().optional(),
  businessTelNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  noOfEmployees: z.coerce.number().optional(),
  economicSector: z.string().optional(),
  dateOfIncorporation: z.string().optional(),
  tradeName: z.string().optional(),
  certificateOfIncorporationNumber: z.string().optional(),
  countryOfIncorporation: z.string().optional(),

  // Document Info
  document1Type: z.string().min(1, { message: 'Please select a document type.' }),
  document2Type: z.string().min(1, { message: 'Please select a document type.' }),
  
  // Signature
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
  isDynamic?: boolean;
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