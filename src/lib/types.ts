import { z } from 'zod';
import { type FormState as RHFFormState } from 'react-hook-form';

export type FormState<TFieldValues extends Record<string, any>> = RHFFormState<TFieldValues>;

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
  
  // --- New Individual/Sole Trader Fields ---
  branch: z.string().optional(),
  accountSpecType: z.string().optional(),
  accountSpecCurrency: z.string().optional(),
  referredBy: z.string().optional(),
  
  individualTitle: z.string().optional(),
  individualSurname: z.string().optional(),
  individualFirstName: z.string().optional(),
  individualDateOfBirth: z.string().optional(),
  individualPlaceOfBirth: z.string().optional(),
  individualIdType: z.string().optional(),
  individualIdNumber: z.string().optional(),
  individualGender: z.string().optional(),
  individualMaritalStatus: z.string().optional(),
  individualAddress: z.string().optional(),
  individualMobileNumber: z.string().optional(),
  individualInnbucksWalletAccount: z.string().optional(),

  occupation: z.string().optional(),
  employerName: z.string().optional(),
  employerAddress: z.string().optional(),
  employerTel: z.string().optional(),
  employerSector: z.string().optional(),
  dateOfEmployment: z.string().optional(),

  grossMonthlyIncome: z.coerce.number().optional(),
  otherIncome: z.coerce.number().optional(),
  salaryRate: z.string().optional(),
  totalIncome: z.coerce.number().optional(),

  // Corporate only fields
  organisationLegalName: z.string().optional(),
  tradeName: z.string().optional(),
  physicalAddress: z.string().optional(),
  postalAddress: z.string().optional(),
  webAddress: z.string().optional(),
  businessTelNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  natureOfBusiness: z.string().optional(),
  dateOfIncorporation: z.string().optional().default(''),
  countryOfIncorporation: z.string().optional(),
  certificateOfIncorporationNumber: z.string().optional().default(''),
  sourceOfWealth: z.string().optional(),
  noOfEmployees: z.coerce.number().optional(),
  economicSector: z.string().optional(),
  authorisedCapital: z.string().optional(),
  taxPayerNumber: z.string().optional(),
  hasOtherAccounts: z.string().optional(),
  otherAccountNumbers: z.string().optional(),
  communicationPreference: z.string().optional(),
  premisesStatus: z.string().optional(),
  typeOfBusiness: z.string().optional(),

  // Mandate and Signatories
  resolutionDate: z.string().optional(),
  signingInstruction: z.string().optional(),
  signatories: z.array(SignatorySchema).min(1, "At least one signatory is required."),

  // Document Info
  document1Type: z.string().min(1, { message: 'Please upload at least one document.' }),
  document2Type: z.string().min(1, { message: 'Please upload at least two documents.' }),
  
  // FCB Status
  fcbStatus: z.string().optional(),
  
  // Agency Agreement Fields
  brNumber: z.string().optional(),
  walletAccount: z.string().optional(),
  supervisorSignature: z.string().optional(),
  supervisorSignatureTimestamp: z.string().optional(),
  executiveSignature: z.string().optional(),
  executiveSignatureTimestamp: z.string().optional(),

  signature: z.string().min(3, { message: 'Please provide your full name as a signature.' }),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms and conditions.' }),
  }),
}).superRefine((data, ctx) => {
    const isCorporate = !['Personal Account', 'Proprietorship / Sole Trader'].includes(data.clientType) && data.clientType;
    if (isCorporate) {
      if (!data.organisationLegalName) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['organisationLegalName'],
            message: 'Organization name is required for corporate accounts.',
        });
      }
       if (!data.dateOfIncorporation) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dateOfIncorporation'], message: 'Date of incorporation is required.' });
      }
      if (!data.certificateOfIncorporationNumber) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['certificateOfIncorporationNumber'], message: 'Certificate number is required.' });
      }
    } else if (data.clientType) { // Individual or Sole Trader
      if (!data.individualFirstName) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualFirstName'], message: 'First name is required.' });
      if (!data.individualSurname) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualSurname'], message: 'Surname is required.' });
      if (!data.individualDateOfBirth) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualDateOfBirth'], message: 'Date of birth is required.' });
      if (!data.individualAddress) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualAddress'], message: 'Address is required.' });
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
