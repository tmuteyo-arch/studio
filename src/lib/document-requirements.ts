
export type DocumentRequirement = {
    document: string;
    details: string;
    comment: string;
};

const personalAccountRequirements: DocumentRequirement[] = [
    {
        document: 'Valid Identity Documents',
        details: 'Valid Passport, Driver’s License, or National ID.',
        comment: 'Submit copies. The bank will verify them against originals and certify them.',
    },
    {
        document: 'Proof of Residence',
        details: 'Utility bills (ZESA/TelOne/Water) or a signed letter from an employer on a letterhead.',
        comment: 'Must not be more than 3 months old. Submit original bills.',
    },
    {
        document: 'Passport size photos',
        details: 'Recent color photographs.',
        comment: 'Submit recent photos.',
    },
];

const soleTraderRequirements: DocumentRequirement[] = [
    {
        document: 'Proof of residence',
        details: 'Recent utility bill or equivalent.',
        comment: 'Submit original bills, not older than 3 months.'
    },
    {
        document: 'Current tax clearance certificate',
        details: 'Valid certificate from the tax authority.',
        comment: 'Submit a valid and current tax clearance certificate.'
    },
    {
        document: 'Completed application form',
        details: 'The official bank application form, fully completed.',
        comment: 'Ensure all sections are filled.'
    },
    {
        document: 'Registrar of Companies Verification',
        details: 'Proof that no other entity operates under the same name.',
        comment: 'To be verified by the bank.'
    },
    {
        document: 'National ID Card',
        details: 'Valid National ID card.',
        comment: 'Must be a certified copy.'
    },
    {
        document: 'Passport-size photos',
        details: 'Recent color photographs.',
        comment: 'Submit recent photos.'
    },
    {
        document: 'Trading License',
        details: 'Valid license for the business.',
        comment: 'Submit a copy of the trading license.'
    }
];

const corporateAccountRequirements: DocumentRequirement[] = [
    {
        document: 'Board Resolution',
        details: 'Stating the board has agreed to open the account and list of authorized signatories.',
        comment: 'Must be on company letterhead.',
    },
    {
        document: 'Certificate of Incorporation',
        details: 'Official certificate of company registration.',
        comment: 'Submit copy; verified against original and certified by the bank.',
    },
    {
        document: 'Memorandum and Articles of Association',
        details: "Company's constitution documents.",
        comment: 'Submit copy; verified against original and certified by the bank.',
    },
     {
        document: 'Tax Clearance Certificate',
        details: 'Valid certificate from the tax authority.',
        comment: 'Submit copy; verified against original and certified by the bank.',
    },
    {
        document: 'CR6/CR5',
        details: 'Documents showing the registered office address.',
        comment: 'Submit copy; verified against original and certified by the bank. Physical address must match current location.',
    },
    {
        document: 'CR14',
        details: 'List of company directors.',
        comment: 'Submit copy; verified against original and certified by the bank. Must be up to date for current directors.',
    },
    {
        document: 'CR11',
        details: 'Showing current shareholding structure.',
        comment: 'Submit a verified copy.',
    },
    {
        document: 'National ID Card',
        details: 'Passport, Driver’s License, or National ID for all directors and signatories.',
        comment: 'Submit copies; bank will verify against originals and certify.',
    },
    {
        document: 'Proof of Residence',
        details: 'Utility bills (ZESA/TelOne/Water) or employer letter for all directors and signatories.',
        comment: 'Submit originals; must not be older than 3 months.',
    },
    {
        document: 'Passport-size photos',
        details: 'Recent photos for all directors and signatories.',
        comment: 'Submit recent photos.',
    },
    {
        document: 'Bank Statement',
        details: 'Bank statements for the last 3 months.',
        comment: 'Required to show financial history.',
    }
];

const pbcAccountRequirements: DocumentRequirement[] = [
    {
        document: 'Company profile',
        details: 'A summary of the business.',
        comment: 'Provide a complete company profile document.',
    },
    {
        document: 'Declaration of source of income',
        details: 'A document declaring the source of the company\'s income.',
        comment: 'Must be signed by the directors.',
    },
    {
        document: 'Proof of residence',
        details: 'For all signatories and directors.',
        comment: 'Submit recent utility bills or equivalent.',
    },
    {
        document: 'Passport-size photos',
        details: 'For all signatories and directors.',
        comment: 'Submit recent photos.',
    },
    {
        document: 'Board Resolution',
        details: 'Minutes of the last meeting held authorizing account opening.',
        comment: 'Must be on company letterhead and signed.',
    },
    {
        document: 'Tax Clearance Certificate',
        details: 'A current and valid tax clearance certificate.',
        comment: 'The certificate must be certified.',
    },
    {
        document: 'Bank Statement',
        details: 'Bank statements for the last 3 months.',
        comment: 'Must be officially stamped by the bank.',
    },
    {
        document: 'National ID Card',
        details: 'For all signatories and directors.',
        comment: 'Submit certified copies of National IDs.',
    },
    {
        document: 'CR28',
        details: 'Certified copy of the CR28 form.',
        comment: 'Submit a certified and up-to-date copy.',
    },
];

const ngoRequirements: DocumentRequirement[] = [
    {
        document: 'Constitution',
        details: 'The official articles of association or founding document.',
        comment: 'Submit a certified copy.',
    },
    {
        document: 'Board Resolution',
        details: 'A letter from the board authorizing the opening of the account.',
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
        document: 'National ID Card',
        details: 'For all partners and authorized signatories.',
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
