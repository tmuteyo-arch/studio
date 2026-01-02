'use client';

export type ApplicationStatus =
  | 'Submitted'
  | 'In Review'
  | 'Pending Supervisor'
  | 'Approved'
  | 'Rejected'
  | 'Returned to ATL';

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

export type Application = {
  id: string;
  clientName: string;
  clientType: 'Company' | 'Sole Trader' | 'Personal';
  status: ApplicationStatus;
  submittedDate: string;
  lastUpdated: string;
  submittedBy: string;
  details: {
    address: string;
    dateOfBirth: string;
    contactNumber: string;
    email: string;
  };
  documents: Document[];
  history: HistoryLog[];
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
    details: {
      address: '123 Business Rd, Harare',
      dateOfBirth: 'N/A',
      contactNumber: '+263 4 123 456',
      email: 'contact@igloocorp.com',
    },
    documents: [
      { type: 'Certificate of Incorporation', fileName: 'cert_of_inc.pdf', url: '#' },
      { type: 'CR14', fileName: 'cr14.pdf', url: '#' },
      { type: 'Proof of Residence', fileName: 'utility_bill.pdf', url: '#' },
    ],
    history: [
        { action: 'Approved', user: 'Supervisor-01', timestamp: '2023-10-05' },
        { action: 'Submitted to Supervisor', user: 'BackOffice-01', timestamp: '2023-10-03' },
        { action: 'Submitted', user: 'ATL-01', timestamp: '2023-10-01' },
    ]
  },
  {
    id: 'APP002',
    clientName: 'Tapasity -Tech',
    clientType: 'Company',
    status: 'Pending Supervisor',
    submittedDate: '2023-10-02',
    lastUpdated: '2023-10-04',
    submittedBy: 'ATL-01',
     details: {
      address: '456 Tech Park, Harare',
      dateOfBirth: 'N/A',
      contactNumber: '+263 77 111 2222',
      email: 'hello@tapasity.dev',
    },
    documents: [
      { type: 'Certificate of Incorporation', fileName: 'incorp_cert.pdf', url: '#' },
      { type: 'ZIMRA Tax Clearance', fileName: 'zimra.pdf', url: '#' },
    ],
    history: [
        { action: 'Reviewed', user: 'BackOffice-01', timestamp: '2023-10-04' },
        { action: 'Submitted', user: 'ATL-01', timestamp: '2023-10-02' },
    ]
  },
  {
    id: 'APP003',
    clientName: 'Fanciful indulgence',
    clientType: 'Company',
    status: 'Rejected',
    submittedDate: '2023-09-28',
    lastUpdated: '2023-10-01',
    submittedBy: 'ATL-02',
    details: {
      address: '789 Fancy Lane, Bulawayo',
      dateOfBirth: 'N/A',
      contactNumber: '+263 9 888 777',
      email: 'info@fanciful.co.zw',
    },
    documents: [
      { type: 'CR14', fileName: 'cr14_form.pdf', url: '#' },
    ],
    history: [
        { action: 'Rejected', user: 'Supervisor-02', timestamp: '2023-10-01', notes: 'Missing Certificate of Incorporation.' },
        { action: 'Submitted', user: 'ATL-02', timestamp: '2023-09-28' },
    ]
  },
  {
    id: 'APP004',
    clientName: 'Alouis Gwatevera',
    clientType: 'Sole Trader',
    status: 'Submitted',
    submittedDate: '2023-10-04',
    lastUpdated: '2023-10-04',
    submittedBy: 'ATL-01',
     details: {
      address: '101 Lion St, Gweru',
      dateOfBirth: '1985-05-15',
      contactNumber: '+263 71 333 4444',
      email: 'a.gwatevera@email.com',
    },
    documents: [
       { type: 'National ID', fileName: 'national_id.jpg', url: '#' },
       { type: 'Proof of Residence', fileName: 'water_bill.pdf', url: '#' },
    ],
    history: [
        { action: 'Submitted', user: 'ATL-01', timestamp: '2023-10-04' },
    ]
  },
  {
    id: 'APP005',
    clientName: 'Britatract',
    clientType: 'Company',
    status: 'In Review',
    submittedDate: '2023-10-05',
    lastUpdated: '2023-10-05',
    submittedBy: 'ATL-03',
     details: {
      address: '22 Innovation Drive, Harare',
      dateOfBirth: 'N/A',
      contactNumber: '+263 77 555 6666',
      email: 'admin@britatract.com',
    },
    documents: [
       { type: 'Certificate of Incorporation', fileName: 'cert.pdf', url: '#' },
       { type: 'CR14', fileName: 'cr14.pdf', url: '#' },
       { type: 'Bank Statement', fileName: 'bank_statement_q3.pdf', url: '#' },
    ],
    history: [
        { action: 'Submitted', user: 'ATL-03', timestamp: '2023-10-05' },
    ]
  },
  {
    id: 'APP007',
    clientName: 'Rolling carts',
    clientType: 'Sole Trader',
    status: 'Submitted',
    submittedDate: '2023-10-06',
    lastUpdated: '2023-10-06',
    submittedBy: 'ATL-01',
    details: {
      address: '33 Cartwheel Ave, Mutare',
      dateOfBirth: '1990-02-20',
      contactNumber: '+263 78 999 0000',
      email: 'rolling@carts.biz',
    },
    documents: [
       { type: 'National ID', fileName: 'id_scan.png', url: '#' },
       { type: 'Trading License', fileName: 'license.pdf', url: '#' },
    ],
    history: [
        { action: 'Submitted', user: 'ATL-01', timestamp: '2023-10-06' },
    ]
  },
  {
    id: 'APP008',
    clientName: 'Future Forward Inc.',
    clientType: 'Company',
    status: 'Pending Supervisor',
    submittedDate: '2023-10-07',
    lastUpdated: '2023-10-08',
    submittedBy: 'ATL-02',
    details: {
      address: '500 Future Ave, Harare',
      dateOfBirth: 'N/A',
      contactNumber: '+263 77 123 7890',
      email: 'ceo@ffinc.com',
    },
    documents: [
       { type: 'Certificate of Incorporation', fileName: 'inc_cert_ff.pdf', url: '#' },
       { type: 'Board Resolution', fileName: 'board_res.pdf', url: '#' },
    ],
    history: [
        { action: 'Reviewed', user: 'BackOffice-02', timestamp: '2023-10-08' },
        { action: 'Submitted', user: 'ATL-02', timestamp: '2023-10-07' },
    ]
  }
];
