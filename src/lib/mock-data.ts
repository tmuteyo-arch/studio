'use client';

import { atom } from 'jotai';

export type ApplicationStatus =
  | 'Submitted'
  | 'In Review'
  | 'Pending Supervisor'
  | 'Approved'
  | 'Rejected'
  | 'Returned to ATL';
  
export type FcbStatus = 'Inclusive' | 'Good' | 'Adverse' | 'PEP';

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

export type Application = {
  id: string;
  clientName: string;
  clientType: 'Company' | 'Sole Trader' | 'Personal' | string;
  status: ApplicationStatus;
  submittedDate: string;
  lastUpdated: any;
  submittedBy: string;
  fcbStatus: FcbStatus;
  details: {
    address: string;
    dateOfBirth: string;
    contactNumber: string;
    email: string;
  };
  documents: Document[];
  history: HistoryLog[];
  comments: Comment[];
};

export const initialApplications: Application[] = [];

export const applicationsAtom = atom<Application[]>(initialApplications);
