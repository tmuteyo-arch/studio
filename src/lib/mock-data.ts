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
    id: 'APP-EXEC-001',
    clientName: 'ZEROED INVESTMENTS',
    clientType: 'Company (Private / Public Limited)',
    status: 'Pending Executive Signature',
    submittedDate: '2024-05-18',
    lastUpdated: '2024-05-20T10:00:00Z',
    submittedBy: 'Tashinga Muteyo',
    fcbStatus: 'Good',
    details: {
        clientType: 'Company (Private / Public Limited)',
        organisationLegalName: 'ZEROED INVESTMENTS',
        tradeName: 'Zeroed',
        physicalAddress: '55 Industrial Loop, Harare',
        businessTelNumber: '+263 4 999 000',
        email: 'admin@zeroed.co.zw',
        natureOfBusiness: 'Waste Management & Recycling',
        dateOfIncorporation: '2015-06-10',
        countryOfIncorporation: 'Zimbabwe',
        certificateOfIncorporationNumber: 'CI-99887/2015',
        signatories: [],
        document1Type: 'Certificate of Incorporation',
        document2Type: 'CR14',
        agreedToTerms: true,
        signature: 'Tashinga Muteyo',
        supervisorSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==',
        supervisorSignatureTimestamp: '2024-05-20T09:00:00Z'
    },
    signatories: [{
        surname: 'Chikore',
        firstName: 'Sam',
        nationalIdNo: '63-123456-X-42',
        designation: 'Managing Director',
        signature: 'Sam Chikore',
    }],
    documents: [
      { type: 'Certificate of Incorporation', fileName: 'zeroed_cert.pdf', url: '#' },
      { type: 'CR14', fileName: 'zeroed_cr14.pdf', url: '#' },
    ],
    history: [
        { action: 'Submitted', user: 'Tashinga Muteyo', timestamp: '2024-05-18T14:00:00Z' },
        { action: 'Pending Supervisor', user: 'Fadzai Zesa', timestamp: '2024-05-19T11:00:00Z' },
        { action: 'Agreement Signed by Supervisor', user: 'Blessing Zulu', timestamp: '2024-05-20T09:00:00Z', notes: 'Verified and signed. Forwarding to Executive.' },
    ],
    comments: [],
  },
  {
    id: 'APP-EXEC-002',
    clientName: 'ZANEXPRESS INVESTMENTS',
    clientType: 'Company (Private / Public Limited)',
    status: 'Pending Executive Signature',
    submittedDate: '2024-05-19',
    lastUpdated: '2024-05-20T11:30:00Z',
    submittedBy: 'Tendai Moyo',
    fcbStatus: 'Inclusive',
    details: {
        clientType: 'Company (Private / Public Limited)',
        organisationLegalName: 'ZANEXPRESS INVESTMENTS',
        tradeName: 'ZanExpress',
        physicalAddress: '12 Logistics Hub, Bulawayo',
        businessTelNumber: '+263 9 444 555',
        email: 'logistics@zanexpress.com',
        natureOfBusiness: 'Courier & Freight Services',
        dateOfIncorporation: '2019-11-05',
        countryOfIncorporation: 'Zimbabwe',
        certificateOfIncorporationNumber: 'CI-44556/2019',
        signatories: [],
        document1Type: 'Certificate of Incorporation',
        document2Type: 'CR14',
        agreedToTerms: true,
        signature: 'Tendai Moyo',
        supervisorSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==',
        supervisorSignatureTimestamp: '2024-05-20T11:00:00Z'
    },
    signatories: [{
        surname: 'Sibanda',
        firstName: 'Zibusiso',
        nationalIdNo: '08-987654-Y-12',
        designation: 'Operations Director',
        signature: 'Zibusiso Sibanda',
    }],
    documents: [
      { type: 'Certificate of Incorporation', fileName: 'zan_cert.pdf', url: '#' },
      { type: 'CR14', fileName: 'zan_cr14.pdf', url: '#' },
    ],
    history: [
        { action: 'Submitted', user: 'Tendai Moyo', timestamp: '2024-05-19T09:00:00Z' },
        { action: 'Pending Supervisor', user: 'Fadzai Zesa', timestamp: '2024-05-19T16:00:00Z' },
        { action: 'Agreement Signed by Supervisor', user: 'Blessing Zulu', timestamp: '2024-05-20T11:00:00Z' },
    ],
    comments: [],
  },
  {
    id: 'APP-EXEC-003',
    clientName: 'YEDUAI',
    clientType: 'Company (Private / Public Limited)',
    status: 'Pending Executive Signature',
    submittedDate: '2024-05-20',
    lastUpdated: '2024-05-20T14:00:00Z',
    submittedBy: 'Tashinga Muteyo',
    fcbStatus: 'Good',
    details: {
        clientType: 'Company (Private / Public Limited)',
        organisationLegalName: 'YEDUAI',
        tradeName: 'Yedu AI Solutions',
        physicalAddress: 'Tech Tower, Level 4, Harare',
        businessTelNumber: '+263 77 000 111',
        email: 'hello@yeduai.com',
        natureOfBusiness: 'Software Development & AI',
        dateOfIncorporation: '2023-02-14',
        countryOfIncorporation: 'Zimbabwe',
        certificateOfIncorporationNumber: 'CI-11223/2023',
        signatories: [],
        document1Type: 'Certificate of Incorporation',
        document2Type: 'CR14',
        agreedToTerms: true,
        signature: 'Tashinga Muteyo',
        supervisorSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==',
        supervisorSignatureTimestamp: '2024-05-20T13:30:00Z'
    },
    signatories: [{
        surname: 'Muteyo',
        firstName: 'Tashinga',
        nationalIdNo: '12-654321-B-01',
        designation: 'CEO',
        signature: 'Tashinga Muteyo',
    }],
    documents: [
      { type: 'Certificate of Incorporation', fileName: 'yedu_cert.pdf', url: '#' },
      { type: 'CR14', fileName: 'yedu_cr14.pdf', url: '#' },
    ],
    history: [
        { action: 'Submitted', user: 'Tashinga Muteyo', timestamp: '2024-05-20T10:00:00Z' },
        { action: 'Pending Supervisor', user: 'Fadzai Zesa', timestamp: '2024-05-20T11:00:00Z' },
        { action: 'Agreement Signed by Supervisor', user: 'Blessing Zulu', timestamp: '2024-05-20T13:30:00Z' },
    ],
    comments: [],
  }
];

export const applicationsAtom = atom<Application[]>(initialApplications);
export const activeUserAtom = atom<any>(null);
