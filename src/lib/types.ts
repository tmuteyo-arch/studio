import { z } from 'zod';

const DirectorSchema = z.object({
  fullName: z.string().min(2, 'Director name is required.'),
  idNumber: z.string().min(5, 'A valid ID number is required.'),
  dateOfBirth: z.string().refine((dob) => new Date(dob).toString() !== 'Invalid Date', {
    message: 'Please enter a valid date of birth.',
  }),
  address: z.string().min(10, 'Address is required.'),
  designation: z.string().min(2, 'Designation is required.'),
  phoneNumber: z.string().min(5, 'A valid phone number is required.'),
  gender: z.string().min(1, 'Please select a gender.'),
});

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

  // Directors
  directors: z.array(DirectorSchema).optional(),

  // Document Info
  document1Type: z.string().min(1, { message: 'Please select a document type.' }),
  document2Type: z.string().min(1, { message: 'Please select a document type.' }),
  
  signature: z.string().min(3, { message: 'Please provide your full name as a signature.' }),
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions.',
  }),
});

export type OnboardingFormData = z.infer<typeof OnboardingFormSchema>;
export type DirectorFormData = z.infer<typeof DirectorSchema>;

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

export const rejectionReasons = [
    'Missing Documentation',
    'Incorrect Information',
    'Document(s) Unreadable or Poor Quality',
    'Document(s) Expired',
    'Information Mismatch Across Documents',
    'Failed FCB Check',
    'Incomplete Application Form',
    'Suspected Fraudulent Activity',
    'Client Does Not Meet Policy Requirements',
    'Other (See Comments)',
];
