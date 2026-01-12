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
  lastUpdated: any;
  submittedBy: string;
  fcbStatus: FcbStatus;
  details: {
    // Shared
    fullName: string; // Primary contact for corporate
    address: string;
    dateOfBirth: string;
    contactNumber: string;
    email: string;

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

export const initialApplications: Application[] = [
  {
    id: 'APP-001',
    clientName: 'United Capital Fertilizer',
    clientType: 'Company (Private / Public Limited)',
    status: 'Submitted',
    submittedDate: '2024-07-15',
    lastUpdated: '2024-07-15T10:00:00Z',
    submittedBy: 'Tashinga Muteyo',
    fcbStatus: 'Inclusive',
    details: {
      fullName: 'Tashinga Muteyo',
      address: '123 Industrial Rd, Harare',
      dateOfBirth: '2010-01-15',
      contactNumber: '+263 4 555 111',
      email: 'contact@ucf.co.zw'
    },
    directors: [],
    documents: [{ type: 'Certificate of Incorporation', fileName: 'cert.pdf', url: '#' }],
    history: [{ action: 'Submitted', user: 'Tashinga Muteyo', timestamp: '2024-07-15T10:00:00Z' }],
    comments: [],
  },
  {
    id: 'APP-002',
    clientName: 'Finbiz Services ta Sta Travel',
    clientType: 'Company (Private / Public Limited)',
    status: 'Pending Supervisor',
    submittedDate: '2024-07-14',
    lastUpdated: '2024-07-15T11:30:00Z',
    submittedBy: 'Tendai Moyo',
    fcbStatus: 'Good',
    details: {
      fullName: 'Tendai Moyo',
      address: '456 Travel Ave, Bulawayo',
      dateOfBirth: '2012-05-20',
      contactNumber: '+263 9 555 222',
      email: 'info@statravel.co.zw'
    },
    directors: [],
    documents: [{ type: 'CR14', fileName: 'cr14.pdf', url: '#' }, { type: 'Board Resolution', fileName: 'res.pdf', url: '#' }],
    history: [
      { action: 'Submitted', user: 'Tendai Moyo', timestamp: '2024-07-14T09:00:00Z' },
      { action: 'Pending Supervisor', user: 'Fadzai Zesa', timestamp: '2024-07-15T11:30:00Z', notes: 'FCB check is good. All documents in order.' }
    ],
    comments: [{ id: 'c1', user: 'Fadzai Zesa', role: 'back-office', timestamp: '2024-07-15T11:29:00Z', content: 'Looks good, sending for final approval.' }],
  },
  {
    id: 'APP-003',
    clientName: 'Dandemutande Investments',
    clientType: 'Company (Private / Public Limited)',
    status: 'Approved',
    submittedDate: '2024-07-12',
    lastUpdated: '2024-07-14T14:00:00Z',
    submittedBy: 'Tashinga Muteyo',
    fcbStatus: 'Good',
    details: {
      fullName: 'Tashinga Muteyo',
      address: '789 Tech Park, Harare',
      dateOfBirth: '2005-11-01',
      contactNumber: '+263 4 555 333',
      email: 'accounts@dandemutande.co.zw'
    },
    directors: [],
    documents: [{ type: 'Certificate of Incorporation', fileName: 'cert.pdf', url: '#' }],
    history: [
        { action: 'Submitted', user: 'Tashinga Muteyo', timestamp: '2024-07-12T10:00:00Z' },
        { action: 'Pending Supervisor', user: 'Fadzai Zesa', timestamp: '2024-07-13T12:00:00Z' },
        { action: 'Approved', user: 'Blessing Zulu', timestamp: '2024-07-14T14:00:00Z' }
    ],
    comments: [],
  },
  {
    id: 'APP-004',
    clientName: 'Bets Two Six Three',
    clientType: 'Company (Private / Public Limited)',
    status: 'Returned to ATL',
    submittedDate: '2024-07-15',
    lastUpdated: '2024-07-16T09:00:00Z',
    submittedBy: 'Tendai Moyo',
    fcbStatus: 'Inclusive',
    details: {
      fullName: 'Tendai Moyo',
      address: '101 Gaming Plaza, Gweru',
      dateOfBirth: '2022-02-10',
      contactNumber: '+263 54 555 444',
      email: 'support@bets263.com'
    },
    directors: [],
    documents: [{ type: 'CR14', fileName: 'cr14.pdf', url: '#' }],
    history: [
        { action: 'Submitted', user: 'Tendai Moyo', timestamp: '2024-07-15T16:00:00Z' },
        { action: 'Returned to ATL', user: 'Fadzai Zesa', timestamp: '2024-07-16T09:00:00Z', notes: 'Proof of address is unreadable. Please upload a clearer copy.' }
    ],
    comments: [],
  },
  {
    id: 'APP-005',
    clientName: 'Radaverse Solutons Pvt Ltd',
    clientType: 'Company (Private / Public Limited)',
    status: 'Submitted',
    submittedDate: '2024-07-16',
    lastUpdated: '2024-07-16T11:00:00Z',
    submittedBy: 'Tashinga Muteyo',
    fcbStatus: 'Inclusive',
    details: {
      fullName: 'Tashinga Muteyo',
      address: '202 Innovation Hub, Harare',
      dateOfBirth: '2023-01-20',
      contactNumber: '+263 4 555 555',
      email: 'hello@radaverse.io'
    },
    directors: [],
    documents: [{ type: 'Certificate of Incorporation', fileName: 'cert.pdf', url: '#' }],
    history: [{ action: 'Submitted', user: 'Tashinga Muteyo', timestamp: '2024-07-16T11:00:00Z' }],
    comments: [],
  },
  {
    id: 'APP-006',
    clientName: 'Instinct Risk Advisory',
    clientType: 'Company (Private / Public Limited)',
    status: 'Pending Supervisor',
    submittedDate: '2024-07-16',
    lastUpdated: '2024-07-16T12:30:00Z',
    submittedBy: 'Tendai Moyo',
    fcbStatus: 'PEP',
    details: {
      fullName: 'Tendai Moyo',
      address: '303 Finance Center, Harare',
      dateOfBirth: '2019-07-07',
      contactNumber: '+263 4 555 666',
      email: 'admin@instinctrisk.com'
    },
    directors: [],
    documents: [{ type: 'CR14', fileName: 'cr14.pdf', url: '#' }, { type: 'Board Resolution', fileName: 'res.pdf', url: '#' }],
    history: [
      { action: 'Submitted', user: 'Tendai Moyo', timestamp: '2024-07-16T11:45:00Z' },
      { action: 'Pending Supervisor', user: 'Fadzai Zesa', timestamp: '2024-07-16T12:30:00Z', notes: 'Applicant is a Politically Exposed Person (PEP). Requires supervisor review.' }
    ],
    comments: [],
  },
  {
    id: 'APP-007',
    clientName: 'Simbarashe Brian Muguti',
    clientType: 'Proprietorship / Sole Trader',
    status: 'Submitted',
    submittedDate: '2024-07-16',
    lastUpdated: '2024-07-16T13:00:00Z',
    submittedBy: 'Tashinga Muteyo',
    fcbStatus: 'Inclusive',
    details: {
      fullName: 'Simbarashe Brian Muguti',
      address: '77 Masvingo Rd, Harare',
      dateOfBirth: '1985-04-12',
      contactNumber: '+263 77 777 7777',
      email: 'sbmuguti@email.com'
    },
    directors: [],
    documents: [{ type: 'National ID Card', fileName: 'id.pdf', url: '#' }],
    history: [{ action: 'Submitted', user: 'Tashinga Muteyo', timestamp: '2024-07-16T13:00:00Z' }],
    comments: [],
  },
  {
    id: 'APP-008',
    clientName: 'Whitespace Minerals Pvt Ltd',
    clientType: 'Company (Private / Public Limited)',
    status: 'Rejected',
    submittedDate: '2024-07-10',
    lastUpdated: '2024-07-12T10:00:00Z',
    submittedBy: 'Tashinga Muteyo',
    fcbStatus: 'Adverse',
    details: {
      fullName: 'Tashinga Muteyo',
      address: '88 Mining Ave, Kwekwe',
      dateOfBirth: '2018-09-18',
      contactNumber: '+263 55 555 888',
      email: 'operations@whitespace.co.zw'
    },
    directors: [],
    documents: [],
    history: [
        { action: 'Submitted', user: 'Tashinga Muteyo', timestamp: '2024-07-10T15:00:00Z' },
        { action: 'Pending Supervisor', user: 'Fadzai Zesa', timestamp: '2024-07-11T16:00:00Z' },
        { action: 'Rejected', user: 'Blessing Zulu', timestamp: '2024-07-12T10:00:00Z', notes: 'Reason: Failed FCB Check - Adverse report found for one of the directors.' }
    ],
    comments: [],
  },
  {
    id: 'APP-009',
    clientName: 'Benson Masiyiwa',
    clientType: 'Proprietorship / Sole Trader',
    status: 'Approved',
    submittedDate: '2024-07-11',
    lastUpdated: '2024-07-13T11:00:00Z',
    submittedBy: 'Tendai Moyo',
    fcbStatus: 'Good',
    details: {
      fullName: 'Benson Masiyiwa',
      address: '99 Mutare Drive, Mutare',
      dateOfBirth: '1990-11-25',
      contactNumber: '+263 71 999 9999',
      email: 'benson.masiyiwa@email.com'
    },
    directors: [],
    documents: [{ type: 'National ID Card', fileName: 'id.pdf', url: '#' }, { type: 'Proof of Residence', fileName: 'por.pdf', url: '#' }],
    history: [
        { action: 'Submitted', user: 'Tendai Moyo', timestamp: '2024-07-11T09:30:00Z' },
        { action: 'Pending Supervisor', user: 'Fadzai Zesa', timestamp: '2024-07-12T10:30:00Z' },
        { action: 'Approved', user: 'Blessing Zulu', timestamp: '2024-07-13T11:00:00Z' }
    ],
    comments: [],
  }
];

export const applicationsAtom = atom<Application[]>(initialApplications);
