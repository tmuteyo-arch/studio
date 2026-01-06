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
  
  // Account Specifications
  accountCurrency: z.object({
    usd: z.boolean().optional(),
    zar: z.boolean().optional(),
    gbp: z.boolean().optional(),
    eur: z.boolean().optional(),
    bwp: z.boolean().optional(),
  }).optional(),

  // Corporate Info - Based on detailed form
  organisationLegalName: z.string().optional(),
  tradeName: z.string().optional(),
  physicalAddress: z.string().optional(),
  postalAddress: z.string().optional(),
  webAddress: z.string().url().optional().or(z.literal('')),
  socials: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    skype: z.string().optional(),
    linkedin: z.string().optional(),
    other: z.string().optional(),
  }).optional(),
  businessTelNumber: z.string().optional(),
  faxNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  natureOfBusiness: z.string().optional(),
  sourceOfWealth: z.string().optional(),
  typeOfBusiness: z.string().optional(),
  noOfEmployees: z.coerce.number().optional(),
  economicSector: z.string().optional(),
  authorisedCapital: z.string().optional(),
  taxPayerNumber: z.string().optional(),
  dateOfIncorporation: z.string().optional(),
  countryOfIncorporation: z.string().optional(),
  certificateOfIncorporationNumber: z.string().optional(),
  hasOtherAccounts: z.enum(['Yes', 'No']).optional(),
  otherAccountNumbers: z.string().optional(),
  accountTypeTick: z.object({
    transactional: z.boolean().optional(),
    savings: z.boolean().optional(),
    termDeposit: z.boolean().optional(),
    mMarket: z.boolean().optional(),
    loan: z.boolean().optional(),
  }).optional(),
  communicationPreference: z.enum(['Email', 'Fax', 'Letter', 'Telephone']).optional(),
  requestedServices: z.object({
    internetBanking: z.boolean().optional(),
    standingOrder: z.boolean().optional(),
    accountSweep: z.boolean().optional(),
    salaryServices: z.boolean().optional(),
    posInfrastructure: z.boolean().optional(),
  }).optional(),
  premisesStatus: z.enum(['Owned', 'Rented', 'Other']).optional(),
  premisesOtherDetails: z.string().optional(),
  otherBank1Name: z.string().optional(),
  otherBank1AccName: z.string().optional(),
  otherBank1AccNumber: z.string().optional(),
  
  // Directors
  directors: z.array(DirectorSchema).optional(),

  // Document Info
  document1Type: z.string().min(1, { message: 'Please select a document type.' }),
  document2Type: z.string().min(1, { message: 'Please select a document type.' }),
  
  signature: z.string().min(3, { message: 'Please provide your full name as a signature.' }),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms and conditions.' }),
  }),
}).superRefine((data, ctx) => {
    const isCorporate = ['Company (Private / Public Limited)', 'PBC Account', 'Partnership'].includes(data.clientType);
    if (isCorporate) {
        if (!data.organisationLegalName) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['organisationLegalName'],
                message: 'Organisation legal name is required.',
            });
        }
        if (!data.physicalAddress) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['physicalAddress'],
                message: 'Physical address is required.',
            });
        }
         if (!data.businessTelNumber) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['businessTelNumber'],
                message: 'Business phone number is required.',
            });
        }
         if (!data.email) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['email'],
                message: 'A valid email is required.',
            });
        }
        if (!data.dateOfIncorporation) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['dateOfIncorporation'],
                message: 'Date of incorporation is required.',
            });
        }
         if (!data.certificateOfIncorporationNumber) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['certificateOfIncorporationNumber'],
                message: 'Certificate of Incorporation number is required.',
            });
        }
    }
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
