
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
  nationalIdNo: z.string().min(5, 'A valid National ID number is required.'),
  designation: z.string().min(2, 'Designation is required.'),
  signature: z.string().min(1, "A digital signature is required."),
});
export type Signatory = z.infer<typeof SignatorySchema>;

export const OnboardingFormSchema = z.object({
  clientType: z.string().min(1, { message: 'Please select an account type.' }),
  region: z.string().min(1, { message: 'Please select an operating region.' }),
  
  // Individual/Sole Trader Info
  individualSurname: z.string().optional(),
  individualFirstName: z.string().optional(),
  individualDateOfBirth: z.string().optional(),
  individualIdNumber: z.string().optional(),
  individualAddress: z.string().optional(),
  individualMobileNumber: z.string().optional(),

  // Corporate Info
  organisationLegalName: z.string().optional(),
  natureOfBusiness: z.string().optional(),
  physicalAddress: z.string().optional(),
  businessTelNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  dateOfIncorporation: z.string().optional().default(''),
  certificateOfIncorporationNumber: z.string().optional().default(''),

  // Mandate and Signatories
  resolutionDate: z.string().optional(),
  signingInstruction: z.string().optional(),
  signatories: z.array(SignatorySchema).default([]),

  // Documents
  document1Type: z.string().min(1, { message: 'Primary document type is required.' }),
  document2Type: z.string().min(1, { message: 'Secondary document type is required.' }),
  
  // Actual Document Data (Data URIs)
  capturedDocuments: z.array(z.object({
    type: z.string(),
    fileName: z.string(),
    url: z.string()
  })).optional().default([]),
  
  // Internal Checks
  fcbStatus: z.string().optional(),
  
  // Verification Signatures
  supervisorSignature: z.string().optional(),
  supervisorSignatureTimestamp: z.string().optional(),
  executiveSignature: z.string().optional(),
  executiveSignatureTimestamp: z.string().optional(),

  signature: z.string().min(3, { message: 'Please provide your full name as a digital signature.' }),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the Terms & Conditions.' }),
  }),
}).superRefine((data, ctx) => {
    const isPersonal = data.clientType === 'Personal Account';
    const isSoleTrader = data.clientType === 'Proprietorship / Sole Trader';
    const isCorporate = !isPersonal && !isSoleTrader && !!data.clientType;

    // Signatories check for non-personal accounts
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
            message: 'Organisation legal name is required.',
        });
      }
      if (!data.natureOfBusiness) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['natureOfBusiness'],
            message: 'Nature of business is required.',
        });
      }
       if (!data.dateOfIncorporation) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dateOfIncorporation'], message: 'Date of incorporation is required.' });
      }
      if (!data.certificateOfIncorporationNumber) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['certificateOfIncorporationNumber'], message: 'Certificate of incorporation number is required.' });
      }
    } else if (data.clientType) { // Personal or Sole Trader
      if (!data.individualFirstName) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualFirstName'], message: 'First name is required.' });
      if (!data.individualSurname) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualSurname'], message: 'Surname is required.' });
      if (!data.individualDateOfBirth) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualDateOfBirth'], message: 'Date of birth is required.' });
      if (!data.individualAddress) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualAddress'], message: 'Residential address is required.' });
      if (!data.individualIdNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualIdNumber'], message: 'National ID number is required.' });
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
    'Missing Mandatory Documents',
    'Incorrect Information Provided',
    'Poor Document Image Quality',
    'Expired Identification Documents',
    'Data Discrepancies Found',
    'Regulatory Compliance Failure',
    'Incomplete Form Data',
    'Other (See Internal Comments)',
];

export type Comment = {
  id: string;
  user: string;
  role: 'asl' | 'back-office' | 'supervisor' | 'management';
  timestamp: string;
  content: string;
};
