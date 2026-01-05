
export type DocumentRequirement = {
    document: string;
    details: string;
    comment: string;
};

const personalAccountRequirements: DocumentRequirement[] = [
    {
        document: 'Valid Identity Documents',
        details: 'Valid Passport, Driver’s License, or National ID.',
        comment: 'Submit certified copies. The bank will verify them against originals.',
    },
    {
        document: 'Proof of Residence',
        details: 'Utility bills (e.g., ZESA, TelOne) or a valid lease agreement.',
        comment: 'Must not be more than 3 months old. Submit original or certified copies.',
    },
    {
        document: 'Passport size photos',
        details: 'Recent color photographs.',
        comment: 'Required for client record.'
    },
];

const soleTraderRequirements: DocumentRequirement[] = [
    {
        document: 'National ID Card',
        details: 'Valid National ID for the proprietor.',
        comment: 'Must be a certified copy.'
    },
    {
        document: 'Proof of residence',
        details: 'Recent utility bill for the proprietor.',
        comment: 'Not older than 3 months.'
    },
    {
        document: 'Current tax clearance certificate',
        details: 'Valid IT F263 from the tax authority.',
        comment: 'Submit a valid and current tax clearance certificate.'
    },
    {
        document: 'Trading License',
        details: 'Valid license for the business (if applicable).',
        comment: 'Submit a copy of the trading license.'
    },
    {
        document: 'Passport-size photos',
        details: 'Recent color photographs of the proprietor.',
        comment: 'Required for client record.'
    },
];

const corporateAccountRequirements: DocumentRequirement[] = [
    {
        document: 'Certificate of Incorporation',
        details: 'Official certificate of company registration.',
        comment: 'Submit copy; to be verified against original and certified by the bank.',
    },
    {
        document: 'Memorandum and Articles of Association',
        details: "Company's constitution documents.",
        comment: 'Submit copy; to be verified against original and certified by the bank.',
    },
    {
        document: 'CR6/CR5',
        details: 'Documents showing the registered office address.',
        comment: 'Submit copy; physical address must match current location.',
    },
    {
        document: 'CR14',
        details: 'List of company directors.',
        comment: 'Submit copy; must be up to date for current directors.',
    },
    {
        document: 'Board Resolution',
        details: 'Stating the board has agreed to open the account and list of authorized signatories.',
        comment: 'Must be on company letterhead.',
    },
    {
        document: 'Tax Clearance Certificate',
        details: 'Valid certificate from the tax authority.',
        comment: 'Submit current copy.',
    },
    {
        document: 'Proof of operating address',
        details: 'Utility bill or lease agreement for the business address.',
        comment: 'Not older than 3 months.'
    },
    {
        document: 'Director & Signatory IDs',
        details: 'Passport or National ID for all directors and signatories.',
        comment: 'Submit certified copies for all individuals listed in CR14.',
    },
    {
        document: "Director & Signatory Proof of Residence",
        details: 'Utility bills for all directors and signatories.',
        comment: 'Submit originals; must not be older than 3 months.',
    },
];

const pbcAccountRequirements: DocumentRequirement[] = [
    {
        document: 'Certificate of Incorporation',
        details: 'Official certificate of company registration for the PBC.',
        comment: 'Submit copy; to be verified against original.',
    },
    {
        document: 'CR28',
        details: 'Certified copy of the CR28 form for Private Business Corporations.',
        comment: 'Submit a certified and up-to-date copy.',
    },
    {
        document: 'Board Resolution',
        details: 'Resolution authorizing account opening and listing signatories.',
        comment: 'Must be on company letterhead and signed.',
    },
    {
        document: 'Tax Clearance Certificate',
        details: 'A current and valid tax clearance certificate.',
        comment: 'The certificate must be certified.',
    },
    {
        document: "Signatories' ID & Proof of Residence",
        details: 'Certified ID copies and recent utility bills for all signatories.',
        comment: 'Proof of residence must not be more than 3 months old.',
    },
    {
        document: 'Passport-size photos',
        details: 'For all signatories.',
        comment: 'Submit recent photos.',
    }
];

const ngoRequirements: DocumentRequirement[] = [
    {
        document: 'Constitution',
        details: 'The official articles of association or founding document.',
        comment: 'Submit a certified copy.',
    },
    {
        document: 'Registration Certificate',
        details: 'Certificate from the relevant Government Ministry.',
        comment: 'Clearance should be sought with the concerned Ministry if not available.'
    },
    {
        document: 'Board Resolution',
        details: 'A letter from the board authorizing the opening of the account and listing signatories.',
        comment: 'Must be on official letterhead and signed by the board.',
    },
    {
        document: "Signatories' Documents",
        details: "Certified copies of ID’s and proof of residence for all account signatories.",
        comment: 'Proof of residence must not be more than 3 months old.',
    },
    {
        document: 'Passport size photos',
        details: 'Recent color photographs of all signatories.',
        comment: 'Submit recent photos.',
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


const requirementsMap: Record<string, DocumentRequirement[]> = {
    'Personal Account': personalAccountRequirements,
    'Proprietorship / Sole Trader': soleTraderRequirements,
    'Company (Private / Public Limited)': corporateAccountRequirements,
    'PBC Account': pbcAccountRequirements,
    'Partnership': partnershipRequirements,
    'Trust': ngoRequirements, // Using NGO as a base, can be refined
    'NGO / Non-Profit / Embassy': ngoRequirements,
    'Society / Association / Club': ngoRequirements,
    'Government / Local Authority': [], // Needs specific definition
    'Minors': [], // Needs specific definition
    'Professional Intermediaries': [], // Needs specific definition
};

export function getDocumentRequirements(accountType: string): DocumentRequirement[] {
    return requirementsMap[accountType] || [];
}
