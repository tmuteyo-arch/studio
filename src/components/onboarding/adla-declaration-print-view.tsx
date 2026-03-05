
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Logo } from '@/components/logo';

interface AdlaDeclarationPrintViewProps {
  data: any;
}

const AdlaDeclarationPrintView = React.forwardRef<HTMLDivElement, AdlaDeclarationPrintViewProps>(({ data }, ref) => {
    const clientName = data.organisationLegalName || `${data.individualFirstName || ''} ${data.individualSurname || ''}`.trim() || '____________________';
    const date = format(new Date(), 'dd MMMM yyyy');

    return (
        <div ref={ref} className="bg-white text-black p-12 font-sans" style={{ width: '210mm', minHeight: '297mm' }}>
            <header className="flex justify-between items-start mb-12">
                <Logo className="h-16 w-16" />
                <div className="text-right">
                    <h1 className="text-xl font-bold uppercase">ADLA Declaration</h1>
                    <p className="text-xs text-gray-600">Compliance Form AD-01</p>
                </div>
            </header>

            <main className="space-y-8 text-sm">
                <div className="border-2 border-black p-6 bg-gray-50">
                    <h2 className="text-lg font-bold mb-4 text-center">AUTHORISED DEALER WITH LIMITED AUTHORITY (ADLA) DECLARATION</h2>
                    <p>I, the undersigned, <strong>{clientName}</strong>, hereby declare and confirm that:</p>
                </div>

                <div className="space-y-4">
                    <p><strong>1. Compliance:</strong> We understand our role as an agent for InnBucks MicroBank under the ADLA framework and commit to strictly following the guidelines set by the Bank's Compliance Department.</p>
                    <p><strong>2. KYC/CDD:</strong> We will ensure that every customer we onboard is correctly identified, and that their original ID documents are sighted and verified.</p>
                    <p><strong>3. Reporting:</strong> We will report any suspicious transactions or activities to the InnBucks Compliance Officer within 24 hours of detection.</p>
                    <p><strong>4. Records:</strong> We will maintain all records of transactions and identification documents for a minimum period of five (5) years.</p>
                </div>

                <div className="pt-20 space-y-12">
                    <div className="w-1/2">
                        <p className="font-bold mb-1">Signed on behalf of the Applicant:</p>
                        <div className="border-b border-black h-16 mb-2"></div>
                        <div className="flex justify-between text-xs uppercase">
                            <span>Signature</span>
                            <span>Date: {date}</span>
                        </div>
                    </div>

                    <div className="w-1/2 ml-auto">
                        <p className="font-bold mb-1">Witnessed by (InnBucks ATL):</p>
                        <div className="border-b border-black h-16 mb-2"></div>
                        <div className="flex justify-between text-xs uppercase">
                            <span>Signature</span>
                            <span>Name of ATL</span>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="absolute bottom-12 left-12 right-12 text-[10px] text-gray-400 italic">
                This document is a formal declaration required for the establishment of an Agency relationship with InnBucks MicroBank Limited.
            </footer>
        </div>
    );
});

AdlaDeclarationPrintView.displayName = 'AdlaDeclarationPrintView';
export default AdlaDeclarationPrintView;
