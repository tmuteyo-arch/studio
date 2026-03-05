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
        document: 'Agency Agreement',
        details: 'The signed agreement between the agent and InnBucks.',
        comment: 'Submit a signed and certified copy.',
    },
    {
        document: 'ADLA Declaration',
        details: 'Authorised Dealer with Limited Authority declaration.',
        comment: 'Submit a signed and certified copy.',
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
        document: 'CR6',
        details: 'Notice of Registered office and postal address.',
        comment: 'Submit copy; physical address must match current location.',
    },
     {
        document: 'CR2 / CR11',
        details: 'Confirmation of shareholding structure.',
        comment: 'Submit copy.',
    },
    {
        document: 'CR14',
        details: 'List of company directors.',
        comment: 'Submit copy; must be up to date for current directors.',
    },
    {
        document: 'Board Resolution',
        details: 'Stating the board has agreed to open the account and list of authorized signatories.',
        comment: 'This is a specific Innbucks form to be completed.',
    },
    {
        document: 'Agency Agreement',
        details: 'The signed agreement between the agent and InnBucks.',
        comment: 'Submit a signed and certified copy.',
    },
    {
        document: 'ADLA Declaration',
        details: 'Authorised Dealer with Limited Authority declaration.',
        comment: 'Submit a signed and certified copy.',
    },
    {
        document: 'Company Profile',
        details: 'A brief overview of the company.',
        comment: 'A summary of the business operations.'
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
     {
        document: 'Director & Signatory Photos',
        details: '1 recent passport size photo for each director and signatory.',
        comment: 'Required for client records.',
    },
    {
        document: 'Bank Statement',
        details: 'Bank statements from current bankers for the last 3 months.',
        comment: 'Submit copies.'
    }
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
        document: 'Agency Agreement',
        details: 'The signed agreement between the agent and InnBucks.',
        comment: 'Submit a signed and certified copy.',
    },
    {
        document: 'ADLA Declaration',
        details: 'Authorised Dealer with Limited Authority declaration.',
        comment: 'Submit a signed and certified copy.',
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

const clubsAndSocietiesRequirements: DocumentRequirement[] = [
    { document: 'Constitution', details: 'Certified true copy of bye-laws/rules.', comment: 'Must be verified with Registrar of Companies if applicable.' },
    { document: 'Proof of Office', details: 'Utility bill or lease for the place of business.', comment: 'Not older than 3 months.' },
    { document: 'List of Executive Committee', details: 'IDs for all persons in control.', comment: 'Verify identity for all committee members.' },
    { document: 'Resolution to Open Account', details: 'Certified true copy of the resolution.', comment: 'Must authorize account opening and operation.' },
];

const trustRequirements: DocumentRequirement[] = [
    { document: 'Trust Deed', details: 'Original or certified copy of the trust deed.', comment: 'Or probate copy of a will creating the trust.' },
    { document: 'Certificate of Registration', details: 'Certified true copy of trust registration.', comment: '' },
    { document: 'Board Resolution', details: 'Resolution from Trustees to open account.', comment: '' },
    { document: 'Identification of Trustees/Founder', details: 'IDs for trustees, founder, beneficiaries.', comment: 'Verify identity for all involved parties.' },
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