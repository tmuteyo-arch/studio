
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
  surname: z.string().min(1, "Surname is required."),
  firstName: z.string().min(1, "First name is required."),
  otherName: z.string().optional(),
  nationalIdNo: z.string().min(5, 'A valid ID number is required.'),
  designation: z.string().min(2, 'Designation is required.'),
  signature: z.string().min(1, "A signature is required."),
});
export type Signatory = z.infer<typeof SignatorySchema>;

export const OnboardingFormSchema = z.object({
  clientType: z.string().min(1, { message: 'Please select an account type.' }),
  region: z.string().min(1, { message: 'Please select a region.' }),
  
  // Simplified Individual/Sole Trader Fields
  individualSurname: z.string().optional(),
  individualFirstName: z.string().optional(),
  individualDateOfBirth: z.string().optional(),
  individualIdNumber: z.string().optional(),
  individualAddress: z.string().optional(),
  individualMobileNumber: z.string().optional(),

  // Simplified Corporate Fields
  organisationLegalName: z.string().optional(),
  natureOfBusiness: z.string().optional(),
  physicalAddress: z.string().optional(),
  businessTelNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  dateOfIncorporation: z.string().optional().default(''),
  certificateOfIncorporationNumber: z.string().optional().default(''),

  // Mandate and Signatories (Optional for Individual accounts)
  resolutionDate: z.string().optional(),
  signingInstruction: z.string().optional(),
  signatories: z.array(SignatorySchema).default([]),

  // Document Info
  document1Type: z.string().min(1, { message: 'Please upload at least one document.' }),
  document2Type: z.string().min(1, { message: 'Please upload at least two documents.' }),
  
  // FCB Status
  fcbStatus: z.string().optional(),
  
  // Agency Agreement Fields
  supervisorSignature: z.string().optional(),
  supervisorSignatureTimestamp: z.string().optional(),
  executiveSignature: z.string().optional(),
  executiveSignatureTimestamp: z.string().optional(),

  signature: z.string().min(3, { message: 'Please provide your full name as a signature.' }),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms and conditions.' }),
  }),
}).superRefine((data, ctx) => {
    const isPersonal = data.clientType === 'Personal Account';
    const isSoleTrader = data.clientType === 'Proprietorship / Sole Trader';
    const isCorporate = !isPersonal && !isSoleTrader && !!data.clientType;

    // Signatories check for anything except basic Personal account
    if (!!data.clientType && !isPersonal) {
      if (!data.signatories || data.signatories.length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['signatories'],
            message: 'At least one authorized signatory is required.',
        });
      }
    }

    if (isCorporate) {
      if (!data.organisationLegalName) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['organisationLegalName'],
            message: 'Organization name is required for corporate accounts.',
        });
      }
      if (!data.natureOfBusiness) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['natureOfBusiness'],
            message: 'Type of business is required.',
        });
      }
       if (!data.dateOfIncorporation) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dateOfIncorporation'], message: 'Date of incorporation is required.' });
      }
      if (!data.certificateOfIncorporationNumber) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['certificateOfIncorporationNumber'], message: 'Certificate number is required.' });
      }
    } else if (data.clientType) { // Personal or Sole Trader
      if (!data.individualFirstName) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualFirstName'], message: 'First name is required.' });
      if (!data.individualSurname) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualSurname'], message: 'Surname is required.' });
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

export type Comment = {
  id: string;
  user: string;
  role: 'atl' | 'back-office' | 'supervisor';
  timestamp: string;
  content: string;
};
