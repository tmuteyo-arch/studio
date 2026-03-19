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
    { document: 'Company Profile', details: '', comment: '' },
    { document: 'Declaration of Source of Income', details: '', comment: '' },
    { document: 'Proof of Residence', details: 'For all signatories and directors', comment: '' },
    { document: 'Passport size photos', details: 'For all signatories and directors', comment: '' },
    { document: 'Board Resolution letter', details: '', comment: '' },
    { document: 'Minutes of the last meeting held', details: '', comment: '' },
    { document: 'Certified Tax Clearance', details: 'Current', comment: '' },
    { document: 'Stamped Bank Statement', details: '3 months', comment: '' },
    { document: 'Certified National Identification', details: 'For all signatories and directors', comment: '' },
    { document: 'CR28', details: 'Certified copy', comment: '' },
];

const institutionRequirements: DocumentRequirement[] = [
    {
        document: 'Constitution / Founding Documents',
        details: 'The official founding document/articles.',
        comment: 'Submit a certified copy.',
    },
    {
        document: 'Board / Committee Resolution',
        details: 'Letter authorizing account opening.',
        comment: 'Must list all authorized signatories.',
    },
    {
        document: 'Signatory IDs',
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

const requirementsMap: Record<string, DocumentRequirement[]> = {
    'Individual Accounts': personalAccountRequirements,
    'Sole traders': soleTraderRequirements,
    'Private Limited (Pvt) Company': corporateAccountRequirements,
    'Private Business Corporate (PBC)': pbcAccountRequirements,
    'Public Limited company': corporateAccountRequirements,
    'Partnerships': corporateAccountRequirements,
    'Investment Group': corporateAccountRequirements,
    'Parastatal': corporateAccountRequirements,
    'NGO': institutionRequirements,
    'Church': institutionRequirements,
    'School': institutionRequirements,
    'Society': institutionRequirements,
    'Club/ Association': institutionRequirements,
};

export function getDocumentRequirements(accountType: string): DocumentRequirement[] {
    return requirementsMap[accountType] || [];
}
