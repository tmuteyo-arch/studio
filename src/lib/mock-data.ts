'use client';

import { atom } from 'jotai';

export type ApplicationStatus =
  | 'Submitted'
  | 'In Review'
  | 'Pending Supervisor'
  | 'Approved'
  | 'Rejected'
  | 'Returned to ATL'
  | 'Archived';
  
export type FcbStatus = 'Inclusive' | 'Good' | 'Adverse' | 'PEP' | 'Prior Adverse';

export type Document = {
  type: string;
  fileName: string;
  url: string;
}

export type HistoryLog = {
    action: string;
    user: string;
    timestamp: string;
    notes?: string;
}

export type Comment = {
  id: string;
  user: string;
  role: 'atl' | 'back-office' | 'supervisor';
  timestamp: string;
  content: string;
};

export type Director = {
    fullName: string;
    idNumber: string;
    dateOfBirth: string;
    address: string;
    designation: string;
    phoneNumber: string;
    gender: string;
}

export type Application = {
  id: string;
  clientName: string;
  clientType: 'Company (Private / Public Limited)' | 'Proprietorship / Sole Trader' | 'Personal Account' | 'Archived' | string;
  status: ApplicationStatus;
  submittedDate: string;
  lastUpdated: string;
  submittedBy: string;
  fcbStatus: FcbStatus;
  details: {
    // Shared
    fullName: string; // Primary contact for corporate
    address: string;
    dateOfBirth: string;
    contactNumber?: string;
    email?: string;

    // Corporate only
    organisationLegalName?: string | null;
    tradeName?: string | null;
    physicalAddress?: string | null;
    postalAddress?: string | null;
    webAddress?: string | null;
    socials?: {
        facebook?: string;
        twitter?: string;
        skype?: string;
        linkedin?: string;
        other?: string;
    } | null;
    faxNumber?: string | null;
    natureOfBusiness?: string | null;
    sourceOfWealth?: string | null;
    typeOfBusiness?: string | null;
    noOfEmployees?: number | null;
    economicSector?: string | null;
    authorisedCapital?: string | null;
    taxPayerNumber?: string | null;
    dateOfIncorporation?: string | null;
    countryOfIncorporation?: string | null;
    certificateOfIncorporationNumber?: string | null;
    accountCurrency?: {
        usd?: boolean;
        zar?: boolean;
        gbp?: boolean;
        eur?: boolean;
        bwp?: boolean;
    } | null;
    hasOtherAccounts?: 'Yes' | 'No' | null;
    otherAccountNumbers?: string | null;
    accountTypeTick?: {
        transactional?: boolean;
        savings?: boolean;
        termDeposit?: boolean;
        mMarket?: boolean;
        loan?: boolean;
    } | null;
    communicationPreference?: 'Email' | 'Fax' | 'Letter' | 'Telephone' | null;
    requestedServices?: {
        internetBanking?: boolean;
        standingOrder?: boolean;
        accountSweep?: boolean;
        salaryServices?: boolean;
        posInfrastructure?: boolean;
    } | null;
    premisesStatus?: 'Owned' | 'Rented' | 'Other' | null;
    premisesOtherDetails?: string | null;
    otherBank1Name?: string | null;
    otherBank1AccName?: string | null;
    otherBank1AccNumber?: string | null;
  };
  directors: Director[];
  documents: Document[];
  history: HistoryLog[];
  comments: Comment[];
};

const initialApplications: Application[] = [
    {
    id: 'APP-001',
    clientName: 'EcoVentures Inc.',
    clientType: 'Company (Private / Public Limited)',
    status: 'Submitted',
    submittedDate: '2024-05-10',
    lastUpdated: '2024-05-10T10:00:00Z',
    submittedBy: 'Tashinga Muteyo',
    fcbStatus: 'Inclusive',
    details: {
        fullName: "Tafadzwa Chihota",
        address: "456 Oak Avenue, Bulawayo",
        dateOfBirth: "1985-02-20",
        organisationLegalName: 'EcoVentures Inc.',
        tradeName: 'EcoVentures',
        physicalAddress: '123 Green Way, Harare',
        postalAddress: 'P.O. Box 500, Harare',
        webAddress: 'http://ecoventures.co.zw',
        businessTelNumber: '+263 4 700 800',
        email: 'contact@ecoventures.co.zw',
        natureOfBusiness: 'Renewable energy solutions',
        sourceOfWealth: 'Business profits',
        typeOfBusiness: 'Private Limited',
        noOfEmployees: 45,
        economicSector: 'Energy',
        dateOfIncorporation: '2020-01-15',
        countryOfIncorporation: 'Zimbabwe',
        certificateOfIncorporationNumber: 'CI-12345/2020'
    },
    directors: [{
        fullName: 'Jane Doe',
        idNumber: '12-345678-A-90',
        dateOfBirth: '1980-05-15',
        address: '101 Pine St, Harare',
        designation: 'CEO',
        phoneNumber: '+263771234567',
        gender: 'Female'
    }],
    documents: [
      { type: 'Certificate of Incorporation', fileName: 'cert_incorp.pdf', url: '#' },
      { type: 'CR14', fileName: 'cr14.pdf', url: '#' },
      { type: 'Proof of operating address', fileName: 'proof_of_address.pdf', url: '#' },
    ],
    history: [{ action: 'Submitted', user: 'Tashinga Muteyo', timestamp: '2024-05-10T10:00:00Z' }],
    comments: [],
    },
    {
    id: 'APP-002',
    clientName: 'Zim-Artisan Goods',
    clientType: 'Proprietorship / Sole Trader',
    status: 'Returned to ATL',
    submittedDate: '2024-05-09',
    lastUpdated: '2024-05-11T14:30:00Z',
    submittedBy: 'Tashinga Muteyo',
    fcbStatus: 'Good',
     details: {
        fullName: "Rudo Moyo",
        address: "789 Baobab Close, Mutare",
        dateOfBirth: "1992-08-12",
    },
    directors: [],
    documents: [{ type: 'National ID Card', fileName: 'national_id.pdf', url: '#' }],
    history: [
      { action: 'Submitted', user: 'Tashinga Muteyo', timestamp: '2024-05-09T09:00:00Z' },
      { action: 'Returned to ATL', user: 'Fadzai Zesa', timestamp: '2024-05-11T14:30:00Z', notes: "Missing proof of residence. Please upload a recent utility bill." },
    ],
    comments: [{ id: 'c1', user: 'Fadzai Zesa', role: 'back-office', timestamp: '2024-05-11T14:29:00Z', content: 'Missing proof of residence. Returning to ATL.' }],
  },
  {
    id: 'APP-003',
    clientName: 'Tendai Moyo',
    clientType: 'Personal Account',
    status: 'Pending Supervisor',
    submittedDate: '2024-05-08',
    lastUpdated: '2024-05-12T11:00:00Z',
    submittedBy: 'Tendai Moyo',
    fcbStatus: 'PEP',
    details: {
        fullName: "Tendai Moyo",
        address: "111 Jacaranda Lane, Harare",
        dateOfBirth: "1990-11-25",
    },
    directors: [],
    documents: [
      { type: 'National ID Card', fileName: 'national_id.pdf', url: '#' },
      { type: 'Proof of Residence', fileName: 'proof_of_res.pdf', url: '#' },
    ],
    history: [
        { action: 'Submitted', user: 'Tendai Moyo', timestamp: '2024-05-08T15:00:00Z' },
        { action: 'In Review', user: 'Fadzai Zesa', timestamp: '2024-05-10T12:00:00Z' },
        { action: 'Pending Supervisor', user: 'Fadzai Zesa', timestamp: '2024-05-12T11:00:00Z', notes: 'FCB check returned a PEP status. Requires supervisor review.' },
    ],
    comments: [
        {id: 'c2', user: 'Fadzai Zesa', role: 'back-office', timestamp: '2024-05-12T10:59:00Z', content: 'Applicant is a Politically Exposed Person. Escalating to supervisor.'}
    ],
  },
   {
    id: 'APP-004',
    clientName: 'Agri-Innovate Ltd',
    clientType: 'Company (Private / Public Limited)',
    status: 'Approved',
    submittedDate: '2024-05-07',
    lastUpdated: '2024-05-13T16:00:00Z',
    submittedBy: 'Tendai Moyo',
    fcbStatus: 'Good',
     details: {
        fullName: "David Chen",
        address: "Agri-Innovate Farm, Mazowe",
        dateOfBirth: "1975-03-30",
        organisationLegalName: 'Agri-Innovate Ltd',
    },
    directors: [],
    documents: [
      { type: 'Certificate of Incorporation', fileName: 'cert_incorp_agri.pdf', url: '#' },
      { type: 'CR14', fileName: 'cr14_agri.pdf', url: '#' },
    ],
    history: [
      { action: 'Submitted', user: 'Tendai Moyo', timestamp: '2024-05-07T11:00:00Z' },
      { action: 'Pending Supervisor', user: 'Fadzai Zesa', timestamp: '2024-05-10T14:00:00Z' },
      { action: 'Approved', user: 'Blessing Zulu', timestamp: '2024-05-13T16:00:00Z' },
    ],
    comments: [],
  },
  {
    id: 'APP-005',
    clientName: 'Tashinga Muteyo',
    clientType: 'Personal Account',
    status: 'Rejected',
    submittedDate: '2024-05-12',
    lastUpdated: '2024-05-14T09:20:00Z',
    submittedBy: 'Tashinga Muteyo',
    fcbStatus: 'Adverse',
    details: {
        fullName: "Tashinga Muteyo",
        address: "222 Flame Lily Drive, Gweru",
        dateOfBirth: "1995-01-10",
    },
    directors: [],
    documents: [
      { type: 'National ID Card', fileName: 'id_tashinga.pdf', url: '#' },
      { type: 'Proof of Residence', fileName: 'res_tashinga.pdf', url: '#' },
    ],
    history: [
       { action: 'Submitted', user: 'Tashinga Muteyo', timestamp: '2024-05-12T13:00:00Z' },
       { action: 'Pending Supervisor', user: 'Fadzai Zesa', timestamp: '2024-05-13T10:00:00Z' },
       { action: 'Rejected', user: 'Blessing Zulu', timestamp: '2024-05-14T09:20:00Z', notes: 'FCB check returned adverse information related to previous defaults.' },
    ],
    comments: [
        {id: 'c3', user: 'Blessing Zulu', role: 'supervisor', timestamp: '2024-05-14T09:19:00Z', content: 'Adverse FCB status. Cannot proceed.'}
    ],
  },
];

export const applicationsAtom = atom<Application[]>(initialApplications);
export const activeUserAtom = atom<any>(null);