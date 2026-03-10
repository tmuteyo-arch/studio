
'use client';

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
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
  role: 'atl' | 'back-office' | 'supervisor' | 'retail-executive' | 'customer';
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
  region: string;
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
    clientName: 'A.J Madondo investments',
    clientType: 'Company (Private / Public Limited)',
    status: 'Pending Supervisor',
    submittedDate: '2024-05-15',
    lastUpdated: '2024-05-20T10:00:00Z',
    submittedBy: 'CHIDO',
    region: 'Harare',
    fcbStatus: 'Good',
    details: {
        clientType: 'Company (Private / Public Limited)',
        region: 'Harare',
        organisationLegalName: 'A.J Madondo investments',
        natureOfBusiness: 'Financial Services',
        physicalAddress: 'Suite 4, Madondo Plaza, Harare',
        businessTelNumber: '+263 4 555 666',
        email: 'info@ajinvestments.co.zw',
        dateOfIncorporation: '2015-03-10',
        certificateOfIncorporationNumber: 'CI-99887/2015',
        signatories: [],
        document1Type: 'Certificate of Incorporation',
        document2Type: 'CR14',
        agreedToTerms: true,
        signature: 'CHIDO ATL',
    },
    signatories: [{
        surname: 'Madondo',
        firstName: 'A.J',
        nationalIdNo: '63-123456-X-42',
        designation: 'Managing Director',
        signature: 'A.J Madondo',
    }],
    documents: [
      { type: 'Certificate of Incorporation', fileName: 'cert_incorp.pdf', url: '#' },
      { type: 'CR14', fileName: 'cr14.pdf', url: '#' },
    ],
    history: [
        { action: 'Submitted', user: 'CHIDO', timestamp: '2024-05-15T09:00:00Z' },
        { action: 'Pending Supervisor', user: 'TASHINGA', timestamp: '2024-05-20T10:00:00Z', notes: 'Documents verified. Escalating for final sign-off.' }
    ],
    comments: [],
    },
    {
    id: 'APP-002',
    clientName: 'Beloved T Garadzimba',
    clientType: 'Personal Account',
    status: 'Submitted',
    submittedDate: '2024-05-21',
    lastUpdated: '2024-05-21T08:00:00Z',
    submittedBy: 'Customer',
    region: 'Manicaland',
    fcbStatus: 'Inclusive',
    details: {
        clientType: 'Personal Account',
        region: 'Manicaland',
        individualFirstName: 'Beloved T',
        individualSurname: 'Garadzimba',
        individualAddress: '789 Baobab Ave, Mutare',
        individualDateOfBirth: '1990-05-12',
        individualIdNumber: '12-345678-A-90',
        individualMobileNumber: '+263 77 123 4567',
        signatories: [],
        document1Type: 'National ID Card',
        document2Type: 'Proof of Residence',
        agreedToTerms: true,
        signature: 'Beloved Garadzimba',
    },
    signatories: [],
    documents: [],
    history: [{ action: 'Self-Submitted by Customer', user: 'Customer', timestamp: '2024-05-21T08:00:00Z' }],
    comments: [],
    },
    {
    id: 'APP-003',
    clientName: 'Baby brad and Brie',
    clientType: 'Company (Private / Public Limited)',
    status: 'In Review',
    submittedDate: '2024-05-19',
    lastUpdated: '2024-05-22T09:30:00Z',
    submittedBy: 'COLLETOR',
    region: 'Bulawayo',
    fcbStatus: 'Inclusive',
    details: {
        clientType: 'Company (Private / Public Limited)',
        region: 'Bulawayo',
        organisationLegalName: 'Baby brad and Brie',
        natureOfBusiness: 'Retail',
        physicalAddress: 'Shop 12, Ascot Center, Bulawayo',
        businessTelNumber: '+263 9 444 555',
        email: 'hello@babybb.co.zw',
        dateOfIncorporation: '2022-11-05',
        certificateOfIncorporationNumber: 'CI-44556/2022',
        signatories: [],
        document1Type: 'Certificate of Incorporation',
        document2Type: 'CR14',
        agreedToTerms: true,
        signature: 'COLLETOR ATL',
    },
    signatories: [],
    documents: [
      { type: 'Certificate of Incorporation', fileName: 'cert.pdf', url: '#' },
      { type: 'CR14', fileName: 'cr14.pdf', url: '#' },
    ],
    history: [
        { action: 'Submitted', user: 'COLLETOR', timestamp: '2024-05-19T10:00:00Z' },
        { action: 'In Review', user: 'TENDAI', timestamp: '2024-05-22T09:30:00Z' }
    ],
    comments: [],
    },
    {
    id: 'APP-004',
    clientName: 'Ewebmart investments',
    clientType: 'Company (Private / Public Limited)',
    status: 'Signed',
    submittedDate: '2024-05-10',
    lastUpdated: '2024-05-18T14:30:00Z',
    submittedBy: 'HEYZREST',
    region: 'Harare',
    fcbStatus: 'Good',
     details: {
        clientType: 'Company (Private / Public Limited)',
        region: 'Harare',
        organisationLegalName: 'Ewebmart investments',
        natureOfBusiness: 'Technology / ICT',
        physicalAddress: '123 Tech Hub, Harare',
        signatories: [],
        document1Type: 'Certificate of Incorporation',
        document2Type: 'CR14',
        agreedToTerms: true,
        signature: 'Ewebmart CEO',
        supervisorSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==',
        supervisorSignatureTimestamp: '2024-05-16T11:00:00Z',
        executiveSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==',
        executiveSignatureTimestamp: '2024-05-18T14:30:00Z'
    },
    signatories: [],
    documents: [
      { type: 'Certificate of Incorporation', fileName: 'eweb_cert.pdf', url: '#' },
      { type: 'CR14', fileName: 'eweb_cr14.pdf', url: '#' },
    ],
    history: [
      { action: 'Submitted', user: 'HEYZREST', timestamp: '2024-05-10T11:00:00Z' },
      { action: 'Pending Supervisor', user: 'RICHARD', timestamp: '2024-05-14T14:00:00Z' },
      { action: 'Pending Executive Signature', user: 'Blessing Zulu', timestamp: '2024-05-16T11:00:00Z' },
      { action: 'Signed', user: 'Tafadzwa Chihota', timestamp: '2024-05-18T14:30:00Z' },
    ],
    comments: [],
  },
  {
    id: 'APP-005',
    clientName: 'Great DN investments',
    clientType: 'Company (Private / Public Limited)',
    status: 'Rejected',
    submittedDate: '2024-05-12',
    lastUpdated: '2024-05-14T11:00:00Z',
    submittedBy: 'LIBERTY',
    region: 'Midlands',
    fcbStatus: 'Adverse',
    details: {
        clientType: 'Company (Private / Public Limited)',
        region: 'Midlands',
        organisationLegalName: 'Great DN investments',
        natureOfBusiness: 'Construction',
        physicalAddress: 'Industrial Loop, Gweru',
        signatories: [],
        document1Type: 'Certificate of Incorporation',
        document2Type: 'CR14',
        agreedToTerms: true,
        signature: 'LIBERTY ATL',
    },
    signatories: [],
    documents: [
      { type: 'Certificate of Incorporation', fileName: 'dn_cert.pdf', url: '#' },
    ],
    history: [
        { action: 'Submitted', user: 'LIBERTY', timestamp: '2024-05-12T15:00:00Z' },
        { action: 'Rejected', user: 'NYARADZO', timestamp: '2024-05-14T11:00:00Z', notes: 'Failed FCB background check due to prior legal defaults.' },
    ],
    comments: [
        {id: 'c1', user: 'NYARADZO', role: 'back-office', timestamp: '2024-05-14T10:59:00Z', content: 'Adverse FCB status found. Application rejected as per policy.'}
    ],
  },
  {
    id: 'APP-006',
    clientName: 'Tineyi Bhunu',
    clientType: 'Personal Account',
    status: 'Returned to ATL',
    submittedDate: '2024-05-18',
    lastUpdated: '2024-05-20T09:00:00Z',
    submittedBy: 'MERCY',
    region: 'Masvingo',
    fcbStatus: 'Good',
    details: {
        clientType: 'Personal Account',
        region: 'Masvingo',
        individualFirstName: "Tineyi",
        individualSurname: "Bhunu",
        individualAddress: "CBD, Masvingo",
        individualDateOfBirth: "1985-04-10",
        individualIdNumber: "08-987654-Y-12",
        signatories: [],
        document1Type: 'National ID Card',
        document2Type: 'Proof of Residence',
        agreedToTerms: true,
        signature: 'Tineyi Bhunu',
    },
    signatories: [],
    documents: [{ type: 'National ID Card', fileName: 'id.pdf', url: '#' }],
    history: [
        { action: 'Submitted', user: 'MERCY', timestamp: '2024-05-18T14:00:00Z' },
        { action: 'Returned to ATL', user: 'TENDAI', timestamp: '2024-05-20T09:00:00Z', notes: 'Proof of residence is older than 3 months. Requesting updated bill.' },
    ],
    comments: [],
  },
  {
    id: 'APP-007',
    clientName: 'Ticlda Tech Talk',
    clientType: 'Company (Private / Public Limited)',
    status: 'Pending Executive Signature',
    submittedDate: '2024-05-19',
    lastUpdated: '2024-05-21T11:30:00Z',
    submittedBy: 'PAMELA',
    region: 'Harare',
    fcbStatus: 'Good',
    details: {
        clientType: 'Company (Private / Public Limited)',
        region: 'Harare',
        organisationLegalName: 'Ticlda Tech Talk',
        natureOfBusiness: 'Technology / ICT',
        physicalAddress: 'Tech Tower, Level 4, Harare',
        businessTelNumber: '+263 77 000 111',
        email: 'hello@ticlda.com',
        dateOfIncorporation: '2023-02-14',
        certificateOfIncorporationNumber: 'CI-11223/2023',
        signatories: [],
        document1Type: 'Certificate of Incorporation',
        document2Type: 'CR14',
        agreedToTerms: true,
        signature: 'Ticlda CEO',
        supervisorSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==',
        supervisorSignatureTimestamp: '2024-05-21T10:00:00Z'
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
        { action: 'Submitted', user: 'PAMELA', timestamp: '2024-05-19T09:00:00Z' },
        { action: 'Pending Supervisor', user: 'TENDAI', timestamp: '2024-05-20T16:00:00Z' },
        { action: 'Agreement Signed by Supervisor', user: 'Blessing Zulu', timestamp: '2024-05-21T10:00:00Z' },
    ],
    comments: [],
  },
  {
    id: 'APP-008',
    clientName: 'Nash Decisive',
    clientType: 'Personal Account',
    status: 'Submitted',
    submittedDate: '2024-05-22',
    lastUpdated: '2024-05-22T14:00:00Z',
    submittedBy: 'Customer',
    region: 'Midlands',
    fcbStatus: 'Inclusive',
    details: {
        clientType: 'Personal Account',
        region: 'Midlands',
        individualFirstName: "Nash",
        individualSurname: "Decisive",
        individualAddress: "Gweru CBD",
        individualDateOfBirth: "1992-08-12",
        individualIdNumber: "12-345678-X-90",
        signatories: [],
        document1Type: 'National ID Card',
        document2Type: 'Proof of Residence',
        agreedToTerms: true,
        signature: 'Nash Decisive',
    },
    signatories: [],
    documents: [],
    history: [{ action: 'Self-Submitted by Customer', user: 'Customer', timestamp: '2024-05-22T14:00:00Z' }],
    comments: [],
  },
  {
    id: 'APP-009',
    clientName: 'Clibert panashe Masamvu',
    clientType: 'Personal Account',
    status: 'Archived',
    submittedDate: '2024-05-05',
    lastUpdated: '2024-05-08T10:00:00Z',
    submittedBy: 'TARIRO',
    region: 'Harare',
    fcbStatus: 'Good',
    details: {
        clientType: 'Personal Account',
        region: 'Harare',
        individualFirstName: "Clibert panashe",
        individualSurname: "Masamvu",
        individualAddress: "Highlands, Harare",
        individualDateOfBirth: "1988-11-20",
        individualIdNumber: "63-112233-Z-42",
        signatories: [],
        document1Type: 'National ID Card',
        document2Type: 'Proof of Residence',
        agreedToTerms: true,
        signature: 'Clibert Masamvu',
    },
    signatories: [],
    documents: [
        { type: 'National ID Card', fileName: 'clibert_id.pdf', url: '#' },
        { type: 'Proof of Residence', fileName: 'clibert_res.pdf', url: '#' }
    ],
    history: [
        { action: 'Submitted', user: 'TARIRO', timestamp: '2024-05-05T10:00:00Z' },
        { action: 'Signed', user: 'Tafadzwa Chihota', timestamp: '2024-05-07T15:00:00Z' },
        { action: 'Archived', user: 'TASHINGA', timestamp: '2024-05-08T10:00:00Z', notes: 'Filing complete. Record archived.' }
    ],
    comments: [],
  }
];

export const applicationsAtom = atomWithStorage<Application[]>('innbucks_applications_v1', initialApplications);
export const activeUserAtom = atom<any>(null);
