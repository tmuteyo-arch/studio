import { z } from 'zod';
import { type FormState as RHFFormState } from 'react-hook-form';

export type FormState<TFieldValues extends Record<string, any>> = RHFFormState<TFieldValues>;

export const zimRegions = [
  'Bulawayo',
  'Harare',
  'Manicaland',
  'Mashonaland Central',
  'Mashonaland East',
  'Mashonaland West',
  'Masvingo',
  'Matabeleland North',
  'Matabeleland South',
  'Midlands',
] as const;

export const businessTypes = [
  'Agriculture',
  'Mining',
  'Manufacturing',
  'Retail',
  'Wholesale',
  'Services',
  'Construction',
  'Transport & Logistics',
  'Technology / ICT',
  'Financial Services',
  'Tourism & Hospitality',
  'Other',
] as const;

const SignatorySchema = z.object({
  surname: z.string().min(1, "Last name is required."),
  firstName: z.string().min(1, "First name is required."),
  otherName: z.string().optional(),
  nationalIdNo: z.string().min(5, 'A valid ID number is needed.'),
  designation: z.string().min(2, 'Job title is required.'),
  signature: z.string().min(1, "A signature is needed."),
});
export type Signatory = z.infer<typeof SignatorySchema>;

export const OnboardingFormSchema = z.object({
  clientType: z.string().min(1, { message: 'Please pick an account type.' }),
  region: z.string().min(1, { message: 'Please pick a region.' }),
  
  // Person/Sole Trader
  individualSurname: z.string().optional(),
  individualFirstName: z.string().optional(),
  individualDateOfBirth: z.string().optional(),
  individualIdNumber: z.string().optional(),
  individualAddress: z.string().optional(),
  individualMobileNumber: z.string().optional(),

  // Company
  organisationLegalName: z.string().optional(),
  natureOfBusiness: z.string().optional(),
  physicalAddress: z.string().optional(),
  businessTelNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  dateOfIncorporation: z.string().optional().default(''),
  certificateOfIncorporationNumber: z.string().optional().default(''),

  // Permissions and People Signing
  resolutionDate: z.string().optional(),
  signingInstruction: z.string().optional(),
  signatories: z.array(SignatorySchema).default([]),

  // Photos and Files
  document1Type: z.string().min(1, { message: 'Please add at least one document.' }),
  document2Type: z.string().min(1, { message: 'Please add at least two documents.' }),
  
  // Checks
  fcbStatus: z.string().optional(),
  
  // Signature Fields
  supervisorSignature: z.string().optional(),
  supervisorSignatureTimestamp: z.string().optional(),
  executiveSignature: z.string().optional(),
  executiveSignatureTimestamp: z.string().optional(),

  signature: z.string().min(3, { message: 'Please write your full name here.' }),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must check the box to agree to the terms.' }),
  }),
}).superRefine((data, ctx) => {
    const isPersonal = data.clientType === 'Personal Account';
    const isSoleTrader = data.clientType === 'Proprietorship / Sole Trader';
    const isCorporate = !isPersonal && !isSoleTrader && !!data.clientType;

    // People Signing check
    if (!!data.clientType && !isPersonal) {
      if (!data.signatories || data.signatories.length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['signatories'],
            message: 'At least one person needs to sign.',
        });
      }
    }

    if (isCorporate) {
      if (!data.organisationLegalName) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['organisationLegalName'],
            message: 'Company name is required.',
        });
      }
      if (!data.natureOfBusiness) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['natureOfBusiness'],
            message: 'What kind of business is this?',
        });
      }
       if (!data.dateOfIncorporation) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dateOfIncorporation'], message: 'Start date is required.' });
      }
      if (!data.certificateOfIncorporationNumber) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['certificateOfIncorporationNumber'], message: 'Registration number is required.' });
      }
    } else if (data.clientType) { // Person or Sole Trader
      if (!data.individualFirstName) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualFirstName'], message: 'First name is required.' });
      if (!data.individualSurname) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualSurname'], message: 'Last name is required.' });
      if (!data.individualDateOfBirth) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualDateOfBirth'], message: 'Date of birth is required.' });
      if (!data.individualAddress) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualAddress'], message: 'Address is required.' });
      if (!data.individualIdNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualIdNumber'], message: 'ID Number is required.' });
    }
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

export const rejectionReasons = [
    'Missing Documents',
    'Wrong Information',
    'Bad Photo Quality',
    'Documents Expired',
    'Details Do Not Match',
    'Failed Safety Check',
    'Incomplete Form',
    'Other (See Comments)',
];

export type Comment = {
  id: string;
  user: string;
  role: 'atl' | 'back-office' | 'supervisor';
  timestamp: string;
  content: string;
};
