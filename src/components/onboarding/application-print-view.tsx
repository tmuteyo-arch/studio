'use client';

import * as React from 'react';
import { Application } from '@/lib/mock-data';
import { Logo } from '@/components/logo';

interface ApplicationPrintViewProps {
  application: Application;
}

const DetailItem = ({ label, value }: { label: string; value: string | undefined }) => (
    <div className="mb-2">
      <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
      <p className="text-sm">{value || '-'}</p>
    </div>
);

const ApplicationPrintView = React.forwardRef<HTMLDivElement, ApplicationPrintViewProps>(({ application }, ref) => {
  return (
    <div ref={ref} className="bg-white text-black p-8" style={{ width: '210mm', minHeight: '297mm'}}>
      <header className="flex items-center justify-between mb-8 border-b pb-4 border-gray-300">
        <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <div>
                <h1 className="text-xl font-bold">InnBucks Agent Onboarding</h1>
                <p className="text-sm">Application Summary</p>
            </div>
        </div>
        <div className='text-right'>
            <p className="text-sm">Application ID: <strong>{application.id}</strong></p>
            <p className="text-sm">Status: <strong>{application.status}</strong></p>
        </div>
      </header>

      <main>
        <section className="mb-6">
          <h2 className="text-lg font-semibold border-b mb-3 pb-1 border-gray-300">Applicant Information</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <DetailItem label="Client Name" value={application.clientName} />
            <DetailItem label="Client Type" value={application.clientType} />
            <DetailItem label="Submission Date" value={application.submittedDate} />
            <DetailItem label="Submitted By" value={application.submittedBy} />
            <DetailItem label="Contact Number" value={application.details.contactNumber} />
            <DetailItem label="Email" value={application.details.email} />
            <DetailItem label="Date of Birth" value={application.details.dateOfBirth} />
            <DetailItem label="Address" value={application.details.address} />
          </div>
        </section>

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

         <section>
          <h2 className="text-lg font-semibold border-b mb-3 pb-1 border-gray-300">Comments</h2>
           {application.comments.length > 0 ? (
            <ul className="space-y-2">
              {application.comments.map(comment => (
                <li key={comment.id} className="text-sm border-b pb-2 border-gray-200">
                    <p>{comment.content}</p>
                    <p className="text-xs text-gray-500 text-right mt-1"> - {comment.user} ({comment.role}) on {new Date(comment.timestamp).toLocaleString()}</p>
                </li>
              ))}
            </ul>
           ) : (
             <p className="text-sm text-gray-500">No comments on this application.</p>
           )}
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
