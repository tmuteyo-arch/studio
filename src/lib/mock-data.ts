'use client';

import { atom } from 'jotai';
import { Timestamp } from 'firebase/firestore';

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
  id: string; // Firestore document ID
  clientName: string;
  clientType: 'Company (Private / Public Limited)' | 'Proprietorship / Sole Trader' | 'Personal Account' | 'Archived' | string;
  status: ApplicationStatus;
  submittedDate: string;
  lastUpdated: Timestamp;
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
