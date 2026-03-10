export type DocumentRequirement = {
    document: string;
    details: string;
    comment: string;
};

const personalAccountRequirements: DocumentRequirement[] = [
    {
        document: 'Valid Identity Document',
        details: 'Passport / Driver’s License / Plastic or Metal ID',
        comment: 'Copies submitted and verified against originals.',
    },
    {
        document: 'Proof of Residence',
        details: 'Utility Bill (ZESA/TelOne/Water) OR Employer letter signed by HR on company letterhead.',
        comment: 'Must not be older than 3 months.',
    },
    {
        document: 'Passport Size Photos',
        details: 'Recent color photographs.',
        comment: 'Recent photos required.'
    },
];

const soleTraderRequirements: DocumentRequirement[] = [
    {
        document: 'Certified Copy of National ID',
        details: 'Valid National ID for the proprietor.',
        comment: 'Must be a certified copy.'
    },
    {
        document: 'Proof of Residence',
        details: 'Recent utility bill for the proprietor.',
        comment: 'Not older than 3 months.'
    },
    {
        document: 'Current Tax Clearance Certificate',
        details: 'Valid ZIMRA tax clearance.',
        comment: 'Submit a valid and current certificate.'
    },
    {
        document: 'Verification with Registrar of Companies',
        details: 'Confirmation of business name uniqueness.',
        comment: 'Confirming that no other organization or person is operating under the same business name.'
    },
    {
        document: 'Operating and Business Licence',
        details: 'Valid license for the business operations.',
        comment: 'Submit a copy of the trading/operating license.'
    },
    {
        document: 'Passport Size Photos',
        details: 'Recent color photographs of the proprietor.',
        comment: 'Required for client record.'
    },
];

const corporateAccountRequirements: DocumentRequirement[] = [
    {
        document: 'Board Resolution Letter',
        details: 'Written on company letterhead.',
        comment: 'Must state that the board has agreed to open a bank account and list the authorized signatories.',
    },
    {
        document: 'Certificate of Incorporation',
        details: 'Official certificate of company registration.',
        comment: 'Submit copy; the bank will verify it against the original and certify it.',
    },
    {
        document: 'Memorandum and Articles of Association',
        details: "Company's constitution documents.",
        comment: 'Submit copy; the bank will verify it against the original and certify it.',
    },
    {
        document: 'ZIMRA Tax Clearance Certificate',
        details: 'Valid Tax Clearance / Tax Exemption Certificate.',
        comment: 'Submit a certified copy verified against the original.',
    },
    {
        document: 'CR5 / CR6 Forms',
        details: 'Notice of Registered office and postal address.',
        comment: 'Submit certified copies. The physical address must match the current operating location.',
    },
    {
        document: 'CR14 Form',
        details: 'List of company directors.',
        comment: 'Submit a certified copy. Must be up to date, especially if there have been changes in directors.',
    },
    {
        document: 'CR11',
        details: 'Current shareholding structure.',
        comment: 'Showing the current shareholding structure.',
    },
    {
        document: 'Valid Identity Documents',
        details: 'Passport / Driver’s License / Plastic or Metal National ID.',
        comment: 'Submit copies for all directors and authorized signatories. Originals required for verification.',
    },
    {
        document: 'Proof of Residence',
        details: 'Utility bills (ZESA / TelOne / Water) OR Employer letter on letterhead.',
        comment: 'Must be original and not older than 3 months for all directors and signatories.',
    },
    {
        document: 'Passport Size Photos',
        details: 'Recent photos for all directors and signatories.',
        comment: 'Required for client records.',
    },
    {
        document: 'Bank Statements',
        details: 'Last 3 months bank statements.',
        comment: 'Submit copies of recent statements.'
    }
];

const pbcAccountRequirements: DocumentRequirement[] = [
    {
        document: 'Certified Copy of CR28',
        details: 'Official registration form for PBCs.',
        comment: 'Submit a certified and up-to-date copy.',
    },
    {
        document: 'Company Profile',
        details: 'A brief overview of the PBC.',
        comment: 'A summary of the business operations.'
    },
    {
        document: 'Declaration of Source of Income',
        details: 'Signed declaration of wealth/income.',
        comment: 'Mandatory for compliance.'
    },
    {
        document: 'Board Resolution Letter',
        details: 'Resolution authorizing account opening.',
        comment: 'Must list authorized signatories.',
    },
    {
        document: 'Minutes of the Last Meeting Held',
        details: 'Official minutes from the most recent meeting.',
        comment: 'Required for validation.',
    },
    {
        document: 'Certified Current Tax Clearance',
        details: 'Valid ZIMRA certificate.',
        comment: 'Must be current and certified.',
    },
    {
        document: 'Stamped Bank Statement',
        details: 'Last 3 months bank statements.',
        comment: 'Must be officially stamped by the bank.'
    },
    {
        document: 'Certified National IDs',
        details: 'IDs for all directors and signatories.',
        comment: 'Submit certified copies.',
    },
    {
        document: 'Proof of Residence',
        details: 'Recent utility bills for all directors and signatories.',
        comment: 'Not older than 3 months.',
    },
    {
        document: 'Passport Size Photos',
        details: 'Recent photos for all directors and signatories.',
        comment: 'Required for records.',
    }
];

const ngoRequirements: DocumentRequirement[] = [
    {
        document: 'Constitution',
        details: 'The official founding document/articles.',
        comment: 'Submit a certified copy.',
    },
    {
        document: 'Board Resolution Letter',
        details: 'Letter authorizing account opening.',
        comment: 'Must list all authorized signatories.',
    },
    {
        document: 'Certified copies of IDs',
        details: 'Valid IDs for all signatories.',
        comment: 'Copies must be certified.',
    },
    {
        document: 'Proof of Residence',
        details: 'Recent utility bills for all signatories.',
        comment: 'Must be recent (within 3 months).',
    },
    {
        document: 'Passport Size Photos',
        details: 'Recent color photographs of all signatories.',
        comment: 'Submit recent photos.',
    },
];

const trustRequirements: DocumentRequirement[] = [
    {
        document: 'Board Resolution Letter',
        details: 'Resolution from Trustees to open account.',
        comment: 'Must be on company letterhead stating approval and listing authorized signatories.',
    },
    {
        document: 'Trust Deed',
        details: 'Official legal deed of the trust.',
        comment: 'Submit a copy verified against the original and certified by the bank.',
    },
    {
        document: 'Trustees’ Certified IDs',
        details: 'Copies for all trustees and signatories.',
        comment: 'Originals required for verification.',
    },
    {
        document: 'Proof of Residence',
        details: 'Utility bills (ZESA/TelOne/Water) OR employer letter signed by HR.',
        comment: 'Must not be older than 3 months.',
    },
    {
        document: 'Passport Size Photos',
        details: 'Recent photos for all trustees and signatories.',
        comment: 'Submit recent color photos.',
    },
];

const partnershipRequirements: DocumentRequirement[] = [
    {
        document: 'Partnership Agreement',
        details: 'The legal agreement defining the partnership.',
        comment: 'Submit a signed and dated copy.'
    },
    {
        document: 'Proof of operating address',
        details: 'A recent utility bill or lease agreement for the business address.',
        comment: 'Not older than 3 months.'
    },
    {
        document: "Partners' & Signatories' IDs",
        details: 'National ID or Passport for all partners and authorized signatories.',
        comment: 'Submit certified copies.'
    },
    {
        document: 'Board Resolution',
        details: 'Resolution or letter of authority to open an account.',
        comment: 'Signed by all partners.'
    },
     {
        document: 'Tax Clearance Certificate',
        details: 'Current tax clearance certificate.',
        comment: 'Submit a valid certificate.'
    },
];

const clubsAndSocietiesRequirements: DocumentRequirement[] = [
    { document: 'Constitution', details: 'Certified true copy of bye-laws/rules.', comment: 'Must be verified with Registrar of Companies if applicable.' },
    { document: 'Proof of Office', details: 'Utility bill or lease for the place of business.', comment: 'Not older than 3 months.' },
    { document: 'List of Executive Committee', details: 'IDs for all persons in control.', comment: 'Verify identity for all committee members.' },
    { document: 'Resolution to Open Account', details: 'Certified true copy of the resolution.', comment: 'Must authorize account opening and operation.' },
];

const professionalIntermediariesRequirements: DocumentRequirement[] = [
    { document: 'License/Registration Certificate', details: 'Copy of license from relevant authority.', comment: 'e.g., for Law Practitioners, Accountants.' },
    { document: 'Intermediary Identification', details: 'Proof of residence and IDs for office bearers/directors.', comment: 'Verify the identity of the intermediary firm.' },
    { document: 'Undertaking of Client Verification', details: 'An undertaking that the intermediary has verified their own clients.', comment: '' },
];

const governmentRequirements: DocumentRequirement[] = [
    { document: 'Statute or Law', details: 'Copy of the statute or law that created the body.', comment: '' },
    { document: 'Resolution or Mandate', details: 'Resolution authorizing account opening and signatories.', comment: '' },
    { document: 'Signatory IDs and Proof of Residence', details: 'ID and recent utility bill for all signatories.', comment: '' },
];

const minorsRequirements: DocumentRequirement[] = [
    { document: 'Minor\'s Birth Certificate', details: 'Original and certified copy.', comment: '' },
    { document: 'Guardian\'s ID and Proof of Residence', details: 'Positive ID and recent utility bill for the guardian.', comment: '' },
    { document: 'Legal Guardian Appointment Order', details: 'If guardian is not a parent, provide court order.', comment: '' },
];


const requirementsMap: Record<string, DocumentRequirement[]> = {
    'Personal Account': personalAccountRequirements,
    'Proprietorship / Sole Trader': soleTraderRequirements,
    'Company (Private / Public Limited)': corporateAccountRequirements,
    'PBC Account': pbcAccountRequirements,
    'Partnership': partnershipRequirements,
    'Trust': trustRequirements,
    'NGO / Non-Profit / Embassy': ngoRequirements,
    'Society / Association / Club': clubsAndSocietiesRequirements,
    'Government / Local Authority': governmentRequirements,
    'Minors': minorsRequirements,
    'Professional Intermediaries': professionalIntermediariesRequirements,
};

export function getDocumentRequirements(accountType: string): DocumentRequirement[] {
    return requirementsMap[accountType] || [];
}
