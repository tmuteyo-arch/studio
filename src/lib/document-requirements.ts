
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


const requirementsMap: Record<string, DocumentRequirement[]> = {
    'Personal Account': personalAccountRequirements,
    'Proprietorship / Sole Trader': soleTraderRequirements,
    // Add other account types here
};

export function getDocumentRequirements(accountType: string): DocumentRequirement[] {
    return requirementsMap[accountType] || personalAccountRequirements;
}
