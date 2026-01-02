'use client';

export type Application = {
  id: string;
  clientName: string;
  clientType: 'Company' | 'Sole Trader';
  status: 'Pending' | 'In Review' | 'Approved' | 'Rejected' | 'Submitted';
  submittedDate: string;
  lastUpdated: string;
  submittedBy: string;
};

export const mockApplications: Application[] = [
  {
    id: 'APP001',
    clientName: 'IGLOOCORP Investments',
    clientType: 'Company',
    status: 'Approved',
    submittedDate: '2023-10-01',
    lastUpdated: '2023-10-05',
    submittedBy: 'ATL-01',
  },
  {
    id: 'APP002',
    clientName: 'Tapasity -Tech',
    clientType: 'Company',
    status: 'In Review',
    submittedDate: '2023-10-02',
    lastUpdated: '2023-10-04',
    submittedBy: 'ATL-01',
  },
  {
    id: 'APP003',
    clientName: 'Fanciful indulgence',
    clientType: 'Company',
    status: 'Rejected',
    submittedDate: '2023-09-28',
    lastUpdated: '2023-10-01',
    submittedBy: 'ATL-02',
  },
  {
    id: 'APP004',
    clientName: 'Alouis Gwatevera',
    clientType: 'Sole Trader',
    status: 'Submitted',
    submittedDate: '2023-10-04',
    lastUpdated: '2023-10-04',
    submittedBy: 'ATL-01',
  },
  {
    id: 'APP005',
    clientName: 'Britatract',
    clientType: 'Company',
    status: 'In Review',
    submittedDate: '2023-10-05',
    lastUpdated: '2023-10-05',
    submittedBy: 'ATL-03',
  },
  {
    id: 'APP006',
    clientName: 'Afripharm Medical',
    clientType: 'Company',
    status: 'Approved',
    submittedDate: '2023-09-25',
    lastUpdated: '2023-09-30',
    submittedBy: 'ATL-02',
  },
  {
    id: 'APP007',
    clientName: 'Rolling carts',
    clientType: 'Sole Trader',
    status: 'Submitted',
    submittedDate: '2023-10-06',
    lastUpdated: '2023-10-06',
    submittedBy: 'ATL-01',
  },
];
