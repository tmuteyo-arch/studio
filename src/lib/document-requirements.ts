
export type DocumentRequirement = {
    document: string;
    details: string;
    comment: string;
};

const personalAccountRequirements: DocumentRequirement[] = [
    {
        document: 'Valid Identity Document',
        details: 'Valid Passport, Driver’s License, or Plastic/Metal ID.',
        comment: 'Submit copies. The bank will verify them against originals and certify them.',
    },
    {
        document: 'Proof of Residence',
        details: 'Utility bills (ZESA/TelOne/Water) or a signed letter from an employer on a letterhead.',
        comment: 'Must not be more than 3 months old. Submit original bills.',
    },
    {
        document: 'Passport Size Photos',
        details: 'Recent color photographs.',
        comment: 'Submit recent photos.',
    },
];

const soleTraderRequirements: DocumentRequirement[] = [
    ...personalAccountRequirements,
    {
        document: 'Tax Clearance Certificate',
        details: 'Valid certificate from the tax authority.',
        comment: 'Submit a valid and current tax clearance certificate.',
    },
    {
        document: 'Trading License',
        details: 'Valid license for the business.',
        comment: 'Submit a copy of the trading license.',
    },
];

const corporateAccountRequirements: DocumentRequirement[] = [
    {
        document: 'Board Resolution',
        details: 'Stating agreement to open an account and list of authorized signatories.',
        comment: 'Must be on company letterhead.',
    },
    {
        document: 'Certificate of Incorporation',
        details: 'Official certificate of company registration.',
        comment: 'Submit copy which will be verified against original and certified by the bank.',
    },
    {
        document: 'Memorandum and Articles of Association',
        details: 'Company\'s constitution documents.',
        comment: 'Submit copy which will be verified against original and certified by the bank.',
    },
     {
        document: 'Zimra Tax Clearance Certificate',
        details: 'Or a Certificate of Exemption from paying tax from Zimra.',
        comment: 'Submit copy which will be verified against original and certified by the bank.',
    },
    {
        document: 'CR6/CR5',
        details: 'Documents showing the registered office address.',
        comment: 'Physical Address must tally with current location. Submit verified copy.',
    },
    {
        document: 'CR14',
        details: 'List of company directors.',
        comment: 'Must be up to date. Submit verified copy.',
    },
    {
        document: 'CR 11',
        details: 'Showing the current shareholding structure.',
        comment: 'Submit a verified copy.',
    },
    {
        document: 'Valid Identity Documents',
        details: 'For all directors and signatories (Passport, Driver’s License, ID).',
        comment: 'Submit copies. The bank will verify them against originals and certify them.',
    },
    {
        document: 'Proof of Residence',
        details: 'For all directors and signatories (e.g., utility bill).',
        comment: 'Must not be more than 3 months old. Submit original bills.',
    },
    {
        document: 'Passport size photos',
        details: 'For all directors and signatories.',
        comment: 'Submit recent photos.',
    },
    {
        document: 'Bank Statement',
        details: 'Bank statements for the last 3 months.',
        comment: 'Required to show financial history.',
    }
];

const ngoRequirements: DocumentRequirement[] = [
    {
        document: 'Constitution or Founding Document',
        details: 'The official articles of association or constitution.',
        comment: 'Submit a certified copy.',
    },
    {
        document: 'Board Resolution Letter',
        details: 'A letter from the board authorizing the opening of the account.',
        comment: 'Must be on official letterhead and signed by the board.',
    },
    {
        document: "Signatories' Documents",
        details: "Certified copies of IDs and proof of residence for all account signatories.",
        comment: 'Proof of residence must not be more than 3 months old.',
    },
    {
        document: 'Passport Size Photos',
        details: 'Recent color photographs of all signatories.',
        comment: 'Submit recent photos.',
    },
    {
        document: 'Registration Certificate',
        details: 'Official registration with the relevant authorities.',
        comment: 'Provide government approval or registration certificate.',
    },
];


const requirementsMap: Record<string, DocumentRequirement[]> = {
    'Personal Account': personalAccountRequirements,
    'Proprietorship / Sole Trader': soleTraderRequirements,
    'Company (Private / Public Limited)': corporateAccountRequirements,
    'NGO / Non-Profit / Embassy': ngoRequirements,
    'Society / Association / Club': ngoRequirements,
    'Trust': ngoRequirements,
};

export function getDocumentRequirements(accountType: string): DocumentRequirement[] {
    return requirementsMap[accountType] || personalAccountRequirements;
}
