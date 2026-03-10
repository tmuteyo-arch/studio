'use client';

import * as React from 'react';
import { Application } from '@/lib/mock-data';
import { Logo } from '@/components/logo';

interface ApplicationPrintViewProps {
  application: Application;
}

const DetailItem = ({ label, value }: { label: string; value: string | undefined | null | boolean; }) => {
    if (value === undefined || value === null || value === '') return null;
    let displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
    return (
        <div className="mb-2">
            <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
            <p className="text-sm">{displayValue || '-'}</p>
        </div>
    );
};


const ApplicationPrintView = React.forwardRef<HTMLDivElement, ApplicationPrintViewProps>(({ application }, ref) => {
  const isCorporate = !['Personal Account', 'Proprietorship / Sole Trader'].includes(application.clientType);
  
  return (
    <div ref={ref} className="bg-white text-black p-8" style={{ width: '210mm', minHeight: '297mm'}}>
      <header className="flex items-center justify-between mb-8 border-b pb-4 border-gray-300">
        <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <div>
                <h1 className="text-xl font-bold">InnBucks Agent Onboarding</h1>
                <p className="text-sm">Mandatory Information Summary</p>
            </div>
        </div>
        <div className='text-right'>
            <p className="text-sm">App ID: <strong>{application.id}</strong></p>
            <p className="text-sm">Status: <strong>{application.status}</strong></p>
        </div>
      </header>

      <main>
        <section className="mb-6">
          <h2 className="text-lg font-semibold border-b mb-3 pb-1 border-gray-300">Client Information</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <DetailItem label="Client Name" value={application.clientName} />
            <DetailItem label="Client Type" value={application.clientType} />
            <DetailItem label="Region" value={application.region} />
            <DetailItem label="Submission Date" value={application.submittedDate} />
            {isCorporate ? (
                <>
                    <DetailItem label="Legal Name" value={application.details.organisationLegalName} />
                    <DetailItem label="Business Type" value={application.details.natureOfBusiness} />
                    <DetailItem label="Reg. Number" value={application.details.certificateOfIncorporationNumber} />
                    <DetailItem label="Inc. Date" value={application.details.dateOfIncorporation} />
                    <DetailItem label="Address" value={application.details.physicalAddress} />
                    <DetailItem label="Business Phone" value={application.details.businessTelNumber} />
                    <DetailItem label="Email" value={application.details.email} />
                </>
            ) : (
                <>
                    <DetailItem label="Full Name" value={`${application.details.individualFirstName} ${application.details.individualSurname}`} />
                    <DetailItem label="ID Number" value={application.details.individualIdNumber} />
                    <DetailItem label="Address" value={application.details.individualAddress} />
                    <DetailItem label="Mobile" value={application.details.individualMobileNumber} />
                    <DetailItem label="Date of Birth" value={application.details.individualDateOfBirth} />
                </>
            )}
          </div>
        </section>

        {isCorporate && application.signatories && application.signatories.length > 0 && (
            <section className="mb-6">
                <h2 className="text-lg font-semibold border-b mb-3 pb-1 border-gray-300">Signatories</h2>
                <ul className="list-disc list-inside space-y-1">
                    {application.signatories.map((sig, i) => (
                    <li key={i} className="text-sm">
                        {sig.firstName} {sig.surname} ({sig.designation}) - ID: {sig.nationalIdNo}
                    </li>
                    ))}
                </ul>
            </section>
        )}

        <section className="mb-6">
          <h2 className="text-lg font-semibold border-b mb-3 pb-1 border-gray-300">Uploaded Documents</h2>
          <ul className="list-disc list-inside space-y-1">
            {application.documents.map(doc => (
              <li key={doc.type} className="text-sm">
                <strong>{doc.type}:</strong> {doc.fileName}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold border-b mb-3 pb-1 border-gray-300">Activity Log</h2>
           <ul className="space-y-2">
            {application.history.map((entry, index) => (
                <li key={index} className="text-sm flex justify-between border-b py-1 border-gray-200">
                    <span><strong>{entry.action}</strong> by {entry.user}</span>
                    <span className="text-gray-600">{entry.timestamp}</span>
                </li>
            ))}
            </ul>
        </section>
      </main>

      <footer className="text-center text-xs text-gray-400 mt-12 pt-4 border-t border-gray-200">
        <p>Generated on: {new Date().toLocaleString()}</p>
        <p>InnBucks Agent Onboarding System</p>
      </footer>
    </div>
  );
});

ApplicationPrintView.displayName = 'ApplicationPrintView';

export default ApplicationPrintView;
