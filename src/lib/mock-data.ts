'use client';

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { OnboardingFormData, Signatory } from './types';

export type ApplicationStatus =
  | 'Submitted'
  | 'In Review'
  | 'Pending Supervisor'
  | 'Pending Compliance'
  | 'Approved'
  | 'Signed'
  | 'Rejected'
  | 'Returned to ATL'
  | 'Archived'
  | 'Sent to Back Office'
  | 'Claimed by ASL'
  | 'Rejected by ASL'
  | 'Sent to Supervisor'
  | 'Returned to ASL'
  | 'Returned to Back Office'
  | 'Sent to Risk & Compliance'
  | 'Approved by Supervisor'
  | 'Rejected by Supervisor';
  
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
  role: 'asl' | 'back-office' | 'supervisor' | 'management' | 'compliance' | 'customer';
  timestamp: string;
  content: string;
};

export type UserActivityLog = {
  id: string;
  userId: string;
  userName: string;
  action: 'Login' | 'Logout' | 'Account Created';
  timestamp: string;
}

export type Application = {
  id: string;
  clientName: string;
  clientType: string;
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
    clientType: 'Private Limited (Pvt) Company',
    status: 'Pending Supervisor',
    submittedDate: '2024-05-15',
    lastUpdated: '2024-05-20T10:00:00Z',
    submittedBy: 'CHIDO',
    region: 'Harare',
    fcbStatus: 'Good',
    details: {
        clientType: 'Private Limited (Pvt) Company',
        region: 'Harare',
        organisationLegalName: 'A.J Madondo investments',
        natureOfBusiness: 'Financial Services',
        physicalAddress: 'Suite 4, Madondo Plaza, Harare',
        businessTelNumber: '+263 4 555 666',
        email: 'info@ajinvestments.co.zw',
        dateOfIncorporation: '2015-03-10',
        certificateOfIncorporationNumber: 'CI-99887/2015',
        brIdentity: 'BR-ID-99283',
        signatories: [],
        document1Type: 'Certificate of Incorporation',
        document2Type: 'CR14',
        agreedToTerms: true,
        signature: 'CHIDO ASL',
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
        { action: 'BR Identity Created', user: 'TENDAI', timestamp: '2024-05-20T09:30:00Z', notes: 'BR Identity: BR-ID-99283' },
        { action: 'Pending Supervisor', user: 'TENDAI', timestamp: '2024-05-20T10:00:00Z', notes: 'Documents verified. Escalating for final sign-off.' }
    ],
    comments: [],
    },
    {
    id: 'APP-002',
    clientName: 'Beloved T Garadzimba',
    clientType: 'Individual Accounts',
    status: 'Submitted',
    submittedDate: '2024-05-21',
    lastUpdated: '2024-05-21T08:00:00Z',
    submittedBy: 'Customer',
    region: 'Manicaland',
    fcbStatus: 'Inclusive',
    details: {
        clientType: 'Individual Accounts',
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
    }
];

export const applicationsAtom = atomWithStorage<Application[]>('innbucks_applications_v2', initialApplications);
export const activeUserAtom = atom<any>(null);
export const activityLogsAtom = atomWithStorage<UserActivityLog[]>('innbucks_activity_logs_v1', [
  { id: 'log-1', userId: 'asl-1', userName: 'CHIDO', action: 'Login', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'log-2', userId: 'asl-1', userName: 'CHIDO', action: 'Account Created', timestamp: new Date(Date.now() - 1800000).toISOString() },
]);
