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

export const genderOptions = ['Male', 'Female', 'Other'] as const;
export const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed', 'Other'] as const;

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
  relationshipType: z.enum(['Agency', 'Merchant']).default('Agency'),
  region: z.string().min(1, { message: 'Please select an operating region.' }),
  tinNumber: z.string().optional().default(''),
  
  // Individual/Sole Trader Info
  individualSurname: z.string().optional(),
  individualFirstName: z.string().optional(),
  individualDateOfBirth: z.string().optional(),
  individualIdNumber: z.string().optional(),
  individualAddress: z.string().optional(),
  individualMobileNumber: z.string().optional(),
  nationality: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),

  // Foreign Applicant Fields (Individual only)
  passportNumber: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  visaPermitNumber: z.string().optional(),
  permitExpiryDate: z.string().optional(),

  // Corporate Info - Standardized
  organisationLegalName: z.string().optional(),
  certificateOfIncorporationNumber: z.string().optional(),
  countryOfIncorporation: z.string().optional(),
  dateOfIncorporationRegistration: z.string().optional(),
  tradeName: z.string().optional(),
  authorisedCapital: z.string().optional(),
  bpTaxPayerNumber: z.string().optional(),
  // tinNumber is already defined above
  postalAddress: z.string().optional(),
  physicalAddress: z.string().optional(),
  businessTelNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  webAddress: z.string().optional(),
  natureOfBusinessActivities: z.string().optional(),
  sourceOfWealth: z.string().optional(),
  typeOfBusiness: z.string().optional(),
  
  hasExistingAccounts: z.boolean().default(false),
  existingAccountsDetails: z.string().optional(),

  // Mandate and Signatories
  resolutionDate: z.string().optional(),
  signingInstruction: z.string().optional(),
  signatories: z.array(SignatorySchema).default([]),

  // Agreements State
  agreement1Method: z.enum(['digital', 'physical']).default('digital'),
  agreement1Accepted: z.boolean().default(false),
  agreement1Signature: z.string().optional(),
  agreement1Pages: z.array(z.string()).default([]),

  agreement2Method: z.enum(['digital', 'physical']).default('digital'),
  agreement2Accepted: z.boolean().default(false),
  agreement2Signature: z.string().optional(),
  agreement2Pages: z.array(z.string()).default([]),

  adlaMethod: z.enum(['digital', 'physical']).default('digital'),
  adlaAccepted: z.boolean().default(false),
  adlaSignature: z.string().optional(),
  adlaPages: z.array(z.string()).default([]),

  // Document Registry
  document1Type: z.string().optional(),
  document2Type: z.string().optional(),
  
  capturedDocuments: z.array(z.object({
    type: z.string(),
    fileName: z.string(),
    url: z.string(),
    pages: z.array(z.string()).optional()
  })).optional().default([]),
  
  fcbStatus: z.string().optional(),
  brIdentity: z.string().optional(),
  activationCode: z.string().optional(),
  
  supervisorSignature: z.string().optional(),
  supervisorSignatureTimestamp: z.string().optional(),
  executiveSignature: z.string().optional(),
  executiveSignatureTimestamp: z.string().optional(),

  accountNumber: z.string().optional(),
  accountOpeningDate: z.string().optional(),
  isDispatched: z.boolean().optional().default(false),

  signature: z.string().min(3, { message: 'Type your full name as a digital signature.' }),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the Terms & Conditions.' }),
  }),
}).superRefine((data, ctx) => {
    // TIN Number is required for all
    if (!data.tinNumber || data.tinNumber.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tinNumber'],
        message: 'TIN Number is mandatory for all account types.',
      });
    }

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

    if (data.clientType && !isPersonal) {
      if (!data.signatories || data.signatories.length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['signatories'],
            message: 'At least one authorized signatory is mandatory for this account type.',
        });
      }
    }

    // Agreements validation for Corporate/SoleTrader
    if (isCorporate || isSoleTrader) {
      // Agreement 1 (Agency/Merchant)
      if (data.agreement1Method === 'digital') {
        if (!data.agreement1Accepted || !data.agreement1Signature) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['agreement1Accepted'], message: 'Sign the agreement digitally.' });
        }
      } else {
        if (!data.agreement1Pages || data.agreement1Pages.length === 0) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['agreement1Pages'], message: 'Upload/Scan physical agreement pages.' });
        }
      }

      // ADLA
      if (data.adlaMethod === 'digital') {
        if (!data.adlaAccepted || !data.adlaSignature) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['adlaAccepted'], message: 'Sign the ADLA digitally.' });
        }
      } else {
        if (!data.adlaPages || data.adlaPages.length === 0) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['adlaPages'], message: 'Upload/Scan ADLA pages.' });
        }
      }
      
      // NDA (Merchant only)
      if (data.relationshipType === 'Merchant') {
        if (data.agreement2Method === 'digital') {
          if (!data.agreement2Accepted || !data.agreement2Signature) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['agreement2Accepted'], message: 'Sign the NDA digitally.' });
          }
        } else {
          if (!data.agreement2Pages || data.agreement2Pages.length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['agreement2Pages'], message: 'Upload/Scan NDA pages.' });
          }
        }
      }
    }

    // Note: Institutional accounts (Other category) no longer require agreements or ADLA.

    if (isCorporate || isInstitution) {
      if (!data.organisationLegalName) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['organisationLegalName'],
            message: 'Organisation’s Legal Name is mandatory.',
        });
      }
      if (!data.physicalAddress) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['physicalAddress'],
            message: 'Physical Address is mandatory.',
        });
      }
      if (!data.natureOfBusinessActivities) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['natureOfBusinessActivities'],
            message: 'Nature of Business Activities is mandatory.',
        });
      }
    } else if (isPersonal || isSoleTrader) {
      if (!data.individualFirstName) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualFirstName'], message: 'First name is mandatory.' });
      if (!data.individualSurname) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualSurname'], message: 'Surname is mandatory.' });
      if (!data.individualDateOfBirth) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualDateOfBirth'], message: 'Date of birth is mandatory.' });
      if (!data.individualIdNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['individualIdNumber'], message: 'Registry ID / National ID is mandatory.' });
      if (!data.nationality) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['nationality'], message: 'Nationality is mandatory.' });
      if (!data.gender) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['gender'], message: 'Gender is mandatory.' });
      if (!data.maritalStatus) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['maritalStatus'], message: 'Marital status is mandatory.' });

      // Foreign fields logic for Individual only
      if (data.clientType === 'Individual Accounts' && data.nationality) {
        const isForeign = !['zimbabwe', 'zimbabwean'].includes(data.nationality.toLowerCase().trim());
        if (isForeign) {
          if (!data.passportNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['passportNumber'], message: 'Passport number is mandatory for foreign applicants.' });
          if (!data.countryOfOrigin) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['countryOfOrigin'], message: 'Country of origin is mandatory.' });
          if (!data.visaPermitNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['visaPermitNumber'], message: 'Visa or Permit number is mandatory.' });
          if (!data.permitExpiryDate) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['permitExpiryDate'], message: 'Permit expiry date is mandatory.' });
        }
      }
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
