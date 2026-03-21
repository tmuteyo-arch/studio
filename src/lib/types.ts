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
  
  // Individual/Sole Trader Info (Technical identities)
  individualSurname: z.string().optional(),
  individualFirstName: z.string().optional(),
  individualDateOfBirth: z.string().optional(),
  individualIdNumber: z.string().optional(),
  individualAddress: z.string().optional(),
  individualMobileNumber: z.string().optional(),

  // Corporate Info (Entity classes)
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

  // Document Registry
  document1Type: z.string().optional(),
  document2Type: z.string().optional(),
  
  // Base64 document data
  capturedDocuments: z.array(z.object({
    type: z.string(),
    fileName: z.string(),
    url: z.string()
  })).optional().default([]),
  
  // Internal Registry IDs (Hidden from ASL until finalized)
  fcbStatus: z.string().optional(),
  brIdentity: z.string().optional(),
  activationCode: z.string().optional(),
  
  // Workflow Finalization Signatures
  supervisorSignature: z.string().optional(),
  supervisorSignatureTimestamp: z.string().optional(),
  executiveSignature: z.string().optional(),
  executiveSignatureTimestamp: z.string().optional(),

  // Dispatched Account Information
  accountNumber: z.string().optional(),
  accountOpeningDate: z.string().optional(),
  isDispatched: z.boolean().optional().default(false),

  signature: z.string().min(3, { message: 'Type your full name as a digital signature.' }),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the Terms & Conditions.' }),
  }),
}).superRefine((data, ctx) => {
    // Technical Logic
    const isPersonal = ['Individual Accounts', 'Minors'].includes(data.clientType);
    const isSoleTrader = data.clientType === 'Sole Trader';
    
    const isCorporate = [
      'Private Limited (Pvt) Company', 
      'Private Business Corporate (PBC)', 
      'Public Limited company',
      'Partnerships', 
      'Investment Group', 
      'Parastatal'
    ].includes(data.clientType);
    
    const isInstitution = [
      'NGO', 
      'Church', 
      'School', 
      'Society', 
      'Club/ Association',
      'Trust'
    ].includes(data.clientType);

    // Signatories requirement for legal entities and Sole Trader
    if (data.clientType && !isPersonal) {
      if (!data.signatories || data.signatories.length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['signatories'],
            message: 'At least one authorized signatory is mandatory for this account type.',
        });
      }
    }

    if (isCorporate || isInstitution) {
      if (!data.organisationLegalName) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['organisationLegalName'],
            message: 'Legal name is mandatory for corporate classes.',
        });
      }
      if (!data.physicalAddress) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['physicalAddress'],
            message: 'Verified operating address is mandatory.',
        });
      }
    } else if (isPersonal || isSoleTrader) {
      // Individual and Sole Trader follow the same mandatory fields for applicant details
      if (!data.individualFirstName) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualFirstName'], message: 'First name is mandatory.' });
      if (!data.individualSurname) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualSurname'], message: 'Surname is mandatory.' });
      if (!data.individualDateOfBirth) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualDateOfBirth'], message: 'Date of birth is mandatory.' });
      if (!data.individualIdNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualIdNumber'], message: 'Registry ID / National ID is mandatory.' });
    }
});

export type OnboardingFormData = z.infer<typeof OnboardingFormSchema>;

export type Step = {
  id: string;
  name: string;
  fields?: (keyof OnboardingFormData)[];
};

export const accountTypes = [
  'Individual Accounts',
  'Sole Trader',
  'Minors',
  'Private Limited (Pvt) Company',
  'Private Business Corporate (PBC)',
  'Public Limited company',
  'Partnerships',
  'Investment Group',
  'Parastatal',
  'Trust',
  'NGO',
  'Church',
  'School',
  'Society',
  'Club/ Association',
];

export const rejectionReasons = [
    'Regulatory Document Discrepancy',
    'Invalid ID Document Provided',
    'Registry Creation Error',
    'Data Mismatch in Mandate',
    'Expired Compliance Certificates',
    'Regulatory Verification Failed',
    'Incomplete Technical Fields',
    'Identity Verification Hit',
    'Other Regulatory Failure',
];
