'use client';

import { atom } from 'jotai';
import type { OnboardingFormData, Signatory } from './types';

export type ApplicationStatus =
  | 'Submitted'
  | 'In Review'
  | 'Pending Supervisor'
  | 'Pending Executive Signature'
  | 'Signed'
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
  role: 'atl' | 'back-office' | 'supervisor' | 'retail-executive';
  timestamp: string;
  content: string;
};

export type Application = {
  id: string;
  clientName: string;
  clientType: 'Company (Private / Public Limited)' | 'Proprietorship / Sole Trader' | 'Personal Account' | 'Archived' | string;
  status: ApplicationStatus;
  submittedDate: string;
  lastUpdated: string;
  submittedBy: string;
  fcbStatus: FcbStatus;
  details: OnboardingFormData;
  signatories: Signatory[];
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
        clientType: 'Company (Private / Public Limited)',
        organisationLegalName: 'EcoVentures Inc.',
        tradeName: 'EcoVentures',
        physicalAddress: '123 Green Way, Harare',
        businessTelNumber: '+263 4 700 800',
        email: 'contact@ecoventures.co.zw',
        natureOfBusiness: 'Renewable energy solutions',
        dateOfIncorporation: '2020-01-15',
        countryOfIncorporation: 'Zimbabwe',
        certificateOfIncorporationNumber: 'CI-12345/2020',
        signatories: [],
        document1Type: 'Certificate of Incorporation',
        document2Type: 'CR14',
        agreedToTerms: true,
        signature: 'Tafadzwa Chihota',
    },
    signatories: [{
        surname: 'Doe',
        firstName: 'Jane',
        nationalIdNo: '12-345678-A-90',
        designation: 'CEO',
        signature: 'Jane Doe',
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
        clientType: 'Proprietorship / Sole Trader',
        individualFirstName: "Rudo",
        individualSurname: "Moyo",
        individualAddress: "789 Baobab Close, Mutare",
        individualDateOfBirth: "1992-08-12",
        signatories: [],
        document1Type: 'National ID Card',
        document2Type: 'Proof of residence',
        agreedToTerms: true,
        signature: 'Rudo Moyo',
    },
    signatories: [],
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
        clientType: 'Personal Account',
        individualFirstName: "Tendai",
        individualSurname: "Moyo",
        individualAddress: "111 Jacaranda Lane, Harare",
        individualDateOfBirth: "1990-11-25",
        signatories: [],
        document1Type: 'National ID Card',
        document2Type: 'Proof of Residence',
        agreedToTerms: true,
        signature: 'Tendai Moyo',
    },
    signatories: [],
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
    status: 'Signed',
    submittedDate: '2024-05-07',
    lastUpdated: '2024-05-14T18:00:00Z',
    submittedBy: 'Tendai Moyo',
    fcbStatus: 'Good',
     details: {
        clientType: 'Company (Private / Public Limited)',
        organisationLegalName: 'Agri-Innovate Ltd',
        signatories: [],
        document1Type: 'Certificate of Incorporation',
        document2Type: 'CR14',
        agreedToTerms: true,
        signature: 'David Chen',
        supervisorSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==',
        supervisorSignatureTimestamp: '2024-05-13T16:00:00Z',
        executiveSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==',
        executiveSignatureTimestamp: '2024-05-14T18:00:00Z'
    },
    signatories: [],
    documents: [
      { type: 'Certificate of Incorporation', fileName: 'cert_incorp_agri.pdf', url: '#' },
      { type: 'CR14', fileName: 'cr14_agri.pdf', url: '#' },
    ],
    history: [
      { action: 'Submitted', user: 'Tendai Moyo', timestamp: '2024-05-07T11:00:00Z' },
      { action: 'Pending Supervisor', user: 'Fadzai Zesa', timestamp: '2024-05-10T14:00:00Z' },
      { action: 'Pending Executive Signature', user: 'Blessing Zulu', timestamp: '2024-05-13T16:00:00Z', notes: 'Supervisor has signed.' },
      { action: 'Signed', user: 'Tafadzwa Chihota', timestamp: '2024-05-14T18:00:00Z', notes: 'Final signature from Retail Executive.' },
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
        clientType: 'Personal Account',
        individualFirstName: "Tashinga",
        individualSurname: "Muteyo",
        individualAddress: "222 Flame Lily Drive, Gweru",
        individualDateOfBirth: "1995-01-10",
        signatories: [],
        document1Type: 'National ID Card',
        document2Type: 'Proof of Residence',
        agreedToTerms: true,
        signature: 'Tashinga Muteyo',
    },
    signatories: [],
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
  {
    id: 'APP-006',
    clientName: 'YELLOWCOBB ENTERPRISES (PVT) LTD T/A SPAR RETAIL',
    clientType: 'Company (Private / Public Limited)',
    status: 'Submitted',
    submittedDate: '2024-05-15',
    lastUpdated: '2024-05-15T10:00:00Z',
    submittedBy: 'Tashinga Muteyo',
    fcbStatus: 'Inclusive',
    details: {
        clientType: 'Company (Private / Public Limited)',
        organisationLegalName: 'YELLOWCOBB ENTERPRISES (PVT) LTD T/A SPAR RETAIL',
        tradeName: 'SPAR RETAIL',
        physicalAddress: '100 Retail Park, Harare',
        businessTelNumber: '+263 4 111 222',
        email: 'contact@yellowcobb.co.zw',
        natureOfBusiness: 'Retail Supermarket',
        dateOfIncorporation: '2018-03-20',
        countryOfIncorporation: 'Zimbabwe',
        certificateOfIncorporationNumber: 'CI-67890/2018',
        signatories: [],
        document1Type: 'Certificate of Incorporation',
        document2Type: 'CR14',
        agreedToTerms: true,
        signature: 'Tashinga Muteyo',
    },
    signatories: [],
    documents: [
      { type: 'Certificate of Incorporation', fileName: 'cert_incorp.pdf', url: '#' },
      { type: 'CR14', fileName: 'cr14.pdf', url: '#' },
    ],
    history: [{ action: 'Submitted', user: 'Tashinga Muteyo', timestamp: '2024-05-15T10:00:00Z' }],
    comments: [],
  },
  {
    id: 'APP-007',
    clientName: 'ZB BANK LIMITED',
    clientType: 'Company (Private / Public Limited)',
    status: 'Pending Supervisor',
    submittedDate: '2024-05-14',
    lastUpdated: '2024-05-15T11:00:00Z',
    submittedBy: 'Tendai Moyo',
    fcbStatus: 'Good',
    details: {
        clientType: 'Company (Private / Public Limited)',
        organisationLegalName: 'ZB BANK LIMITED',
        tradeName: 'ZB Bank',
        physicalAddress: 'ZB Life Towers, Harare',
        businessTelNumber: '+263 4 757 788',
        email: 'info@zb.co.zw',
        natureOfBusiness: 'Financial Services',
        dateOfIncorporation: '1951-01-01',
        countryOfIncorporation: 'Zimbabwe',
        certificateOfIncorporationNumber: 'CI-OLD-001',
        signatories: [],
        document1Type: 'Certificate of Incorporation',
        document2Type: 'CR14',
        agreedToTerms: true,
        signature: 'Tendai Moyo',
    },
    signatories: [],
    documents: [
      { type: 'Certificate of Incorporation', fileName: 'zb_cert.pdf', url: '#' },
      { type: 'CR14', fileName: 'zb_cr14.pdf', url: '#' },
    ],
    history: [
        { action: 'Submitted', user: 'Tendai Moyo', timestamp: '2024-05-14T09:00:00Z' },
        { action: 'In Review', user: 'Fadzai Zesa', timestamp: '2024-05-15T10:00:00Z' },
        { action: 'Pending Supervisor', user: 'Fadzai Zesa', timestamp: '2024-05-15T11:00:00Z', notes: 'All documents in order. Ready for supervisor review.' },
    ],
    comments: [],
  },
  {
    id: 'APP-008',
    clientName: 'ZFC LIMITED',
    clientType: 'Company (Private / Public Limited)',
    status: 'Signed',
    submittedDate: '2024-05-13',
    lastUpdated: '2024-05-16T09:00:00Z',
    submittedBy: 'Tashinga Muteyo',
    fcbStatus: 'Good',
    details: {
        clientType: 'Company (Private / Public Limited)',
        organisationLegalName: 'ZFC LIMITED',
        signatories: [],
        document1Type: 'Certificate of Incorporation',
        document2Type: 'CR14',
        agreedToTerms: true,
        signature: 'Tashinga Muteyo',
        supervisorSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==',
        supervisorSignatureTimestamp: '2024-05-15T16:00:00Z',
        executiveSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==',
        executiveSignatureTimestamp: '2024-05-16T09:00:00Z'
    },
    signatories: [],
    documents: [
      { type: 'Certificate of Incorporation', fileName: 'zfc_cert.pdf', url: '#' },
      { type: 'CR14', fileName: 'zfc_cr14.pdf', url: '#' },
    ],
    history: [
      { action: 'Submitted', user: 'Tashinga Muteyo', timestamp: '2024-05-13T10:00:00Z' },
      { action: 'Pending Supervisor', user: 'Fadzai Zesa', timestamp: '2024-05-14T11:00:00Z' },
      { action: 'Pending Executive Signature', user: 'Blessing Zulu', timestamp: '2024-05-15T16:00:00Z' },
      { action: 'Signed', user: 'Tafadzwa Chihota', timestamp: '2024-05-16T09:00:00Z' },
    ],
    comments: [],
  },
  {
    id: 'APP-009',
    clientName: 'YVONNE YEKAI SAMAPUNDO',
    clientType: 'Personal Account',
    status: 'Rejected',
    submittedDate: '2024-05-15',
    lastUpdated: '2024-05-16T12:00:00Z',
    submittedBy: 'Tendai Moyo',
    fcbStatus: 'Adverse',
    details: {
        clientType: 'Personal Account',
        individualFirstName: "YVONNE YEKAI",
        individualSurname: "SAMAPUNDO",
        individualAddress: "456 Jacaranda Ave, Bulawayo",
        individualDateOfBirth: "1985-06-20",
        signatories: [],
        document1Type: 'National ID Card',
        document2Type: 'Proof of Residence',
        agreedToTerms: true,
        signature: 'YVONNE YEKAI SAMAPUNDO',
    },
    signatories: [],
    documents: [
      { type: 'National ID Card', fileName: 'yvonne_id.pdf', url: '#' },
      { type: 'Proof of Residence', fileName: 'yvonne_res.pdf', url: '#' },
    ],
    history: [
       { action: 'Submitted', user: 'Tendai Moyo', timestamp: '2024-05-15T14:00:00Z' },
       { action: 'Pending Supervisor', user: 'Fadzai Zesa', timestamp: '2024-05-16T10:00:00Z' },
       { action: 'Rejected', user: 'Blessing Zulu', timestamp: '2024-05-16T12:00:00Z', notes: 'Adverse mention on FCB report.' },
    ],
    comments: [],
  },
  {
    id: 'APP-010',
    clientName: 'ZIBUKO CAPITAL PVT LTD',
    clientType: 'Company (Private / Public Limited)',
    status: 'Returned to ATL',
    submittedDate: '2024-05-16',
    lastUpdated: '2024-05-16T15:00:00Z',
    submittedBy: 'Tashinga Muteyo',
    fcbStatus: 'Inclusive',
    details: {
        clientType: 'Company (Private / Public Limited)',
        organisationLegalName: 'ZIBUKO CAPITAL PVT LTD',
        tradeName: 'Zibuko Capital',
        physicalAddress: '789 Finance House, Harare',
        businessTelNumber: '+263 4 333 444',
        email: 'ops@zibuko.co.zw',
        natureOfBusiness: 'Investment & Capital Management',
        dateOfIncorporation: '2022-01-10',
        countryOfIncorporation: 'Zimbabwe',
        certificateOfIncorporationNumber: 'CI-54321/2022',
        signatories: [],
        document1Type: 'Certificate of Incorporation',
        document2Type: 'CR14',
        agreedToTerms: true,
        signature: 'Tashinga Muteyo',
    },
    signatories: [],
    documents: [
      { type: 'Certificate of Incorporation', fileName: 'zibuko_cert.pdf', url: '#' },
    ],
    history: [
        { action: 'Submitted', user: 'Tashinga Muteyo', timestamp: '2024-05-16T14:00:00Z' },
        { action: 'Returned to ATL', user: 'Fadzai Zesa', timestamp: '2024-05-16T15:00:00Z', notes: 'Missing CR14 document.' },
    ],
    comments: [
        {id: 'c4', user: 'Fadzai Zesa', role: 'back-office', timestamp: '2024-05-16T14:59:00Z', content: 'Please upload the CR14 form.'}
    ],
  }
];

export const applicationsAtom = atom<Application[]>(initialApplications);
export const activeUserAtom = atom<any>(null);
