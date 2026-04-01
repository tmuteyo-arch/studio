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
            <p className="text-[10px] text-gray-500 uppercase font-semibold">{label}</p>
            <p className="text-sm font-bold">{displayValue || '-'}</p>
        </div>
    );
};


const ApplicationPrintView = React.forwardRef<HTMLDivElement, ApplicationPrintViewProps>(({ application }, ref) => {
  const isPersonalOrIndividual = ['Individual Accounts', 'Minors', 'Sole Trader'].includes(application.clientType);
  const isCorporate = !isPersonalOrIndividual;
  const needsMandate = application.clientType !== 'Individual Accounts' && application.clientType !== 'Minors';
  
  return (
    <div ref={ref} className="bg-white text-black p-8" style={{ width: '210mm', minHeight: '297mm'}}>
      <header className="flex items-center justify-between mb-8 border-b pb-4 border-gray-300">
        <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <div>
                <h1 className="text-xl font-bold uppercase tracking-tight">InnBucks Agent Onboarding</h1>
                <p className="text-[10px] uppercase font-bold text-gray-500">Account Application Form Summary</p>
            </div>
        </div>
        <div className='text-right'>
            <p className="text-[10px] font-bold text-gray-400">APP ID: {application.id}</p>
            <p className="text-sm font-black text-primary">STATUS: {application.status.toUpperCase()}</p>
        </div>
      </header>

      <main>
        <section className="mb-6">
          <h2 className="text-md font-black uppercase border-b mb-4 pb-1 border-black flex items-center justify-between">
            <span>Business Information</span>
            <span className="text-[10px] font-normal text-gray-400">{application.clientType}</span>
          </h2>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {isCorporate ? (
                <>
                    <div className="col-span-2">
                        <DetailItem label="Organisation’s Legal Name" value={application.details.organisationLegalName} />
                    </div>
                    <DetailItem label="Cert. of Incorporation Number" value={application.details.certificateOfIncorporationNumber} />
                    <DetailItem label="Country of Incorporation" value={application.details.countryOfIncorporation} />
                    <DetailItem label="Date of Inc. / Registration" value={application.details.dateOfIncorporationRegistration} />
                    <DetailItem label="Trade Name" value={application.details.tradeName} />
                    <DetailItem label="Authorised Capital" value={application.details.authorisedCapital} />
                    <DetailItem label="BP / Tax Payer’s Number" value={application.details.bpTaxPayerNumber} />
                    <DetailItem label="TIN Number" value={application.details.tinNumber} />
                    
                    <div className="col-span-2 pt-2 border-t border-gray-100"></div>
                    
                    <DetailItem label="Postal Address" value={application.details.postalAddress} />
                    <DetailItem label="Physical Address" value={application.details.physicalAddress} />
                    <DetailItem label="Business Tel Number" value={application.details.businessTelNumber} />
                    <DetailItem label="Email" value={application.details.email} />
                    <div className="col-span-2">
                        <DetailItem label="Web Address" value={application.details.webAddress} />
                    </div>

                    <div className="col-span-2 pt-2 border-t border-gray-100"></div>

                    <div className="col-span-2">
                        <DetailItem label="Nature of Business Activities" value={application.details.natureOfBusinessActivities} />
                    </div>
                    <DetailItem label="Source of Wealth" value={application.details.sourceOfWealth} />
                    <DetailItem label="Type of Business" value={application.details.typeOfBusiness} />
                    
                    <div className="col-span-2 p-3 bg-gray-50 rounded border border-gray-200 mt-2">
                        <DetailItem label="Existing Account(s) with InnBucks?" value={application.details.hasExistingAccounts} />
                        {application.details.hasExistingAccounts && (
                            <div className="mt-1">
                                <DetailItem label="Specified Details" value={application.details.existingAccountsDetails} />
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <DetailItem label="Client Name" value={application.clientName} />
                    <DetailItem label="ID Number" value={application.details.individualIdNumber} />
                    <DetailItem label="Nationality" value={application.details.nationality} />
                    <DetailItem label="Date of Birth" value={application.details.individualDateOfBirth} />
                    <DetailItem label="Address" value={application.details.individualAddress} />
                    <DetailItem label="Mobile" value={application.details.individualMobileNumber} />
                    <DetailItem label="TIN Number" value={application.details.tinNumber} />
                </>
            )}
          </div>
        </section>

        {needsMandate && application.signatories && application.signatories.length > 0 && (
            <section className="mb-6">
                <h2 className="text-md font-black uppercase border-b mb-3 pb-1 border-black">Authorized Signatories</h2>
                <div className="space-y-3">
                    {application.signatories.map((sig, i) => (
                    <div key={i} className="text-sm p-3 border border-gray-200 rounded flex justify-between items-center">
                        <div>
                            <p className="font-bold">{sig.firstName} {sig.surname}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{sig.designation} • ID: {sig.nationalIdNo}</p>
                        </div>
                        {sig.signature && (
                            <img src={sig.signature} alt="Sig" className="h-8 object-contain" />
                        )}
                    </div>
                    ))}
                </div>
            </section>
        )}

        <section className="mb-6">
          <h2 className="text-md font-black uppercase border-b mb-3 pb-1 border-black">Uploaded Documents</h2>
          <div className="grid grid-cols-2 gap-2">
            {application.documents.map(doc => (
              <div key={doc.type} className="text-[10px] border p-2 rounded flex justify-between items-center bg-gray-50">
                <span className="font-bold uppercase">{doc.type}</span>
                <span className="text-gray-400 italic">{doc.fileName}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 page-break-before">
          <h2 className="text-md font-black uppercase border-b mb-3 pb-1 border-black">Internal Registry Status</h2>
          <div className="grid grid-cols-3 gap-4">
            <DetailItem label="BR Client ID" value={application.details.brIdentity} />
            <DetailItem label="Activation Code" value={application.details.activationCode} />
            <DetailItem label="FCB Risk Status" value={application.fcbStatus} />
          </div>
        </section>
      </main>

      <footer className="text-center text-[9px] text-gray-400 mt-auto pt-12 border-t border-gray-200 uppercase tracking-[0.2em] font-bold">
        <p>This document is a formal record of the digital onboarding process for InnBucks MicroBank Limited.</p>
        <p className="mt-1">Generated: {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
});

ApplicationPrintView.displayName = 'ApplicationPrintView';

export default ApplicationPrintView;