'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Application } from '@/lib/mock-data';
import { Logo } from '@/components/logo';

interface AccountResolutionPrintViewProps {
  application: Application;
}

const SignatoryBox = ({ signatory, isLast }: { signatory: any, isLast: boolean }) => (
    <div className={`p-2 border-t border-l ${isLast ? 'border-r' : ''} border-gray-400`}>
        <div className="grid grid-cols-2 gap-x-4">
            <div>
                <p className="text-xs text-gray-500 uppercase">Surname</p>
                <p className="text-sm border-b border-gray-400 h-6">{signatory.surname || ''}</p>
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase">First Name</p>
                <p className="text-sm border-b border-gray-400 h-6">{signatory.firstName || ''}</p>
            </div>
        </div>
        <div className="mt-2">
            <p className="text-xs text-gray-500 uppercase">Other Name</p>
            <p className="text-sm border-b border-gray-400 h-6">{signatory.otherName || ''}</p>
        </div>
        <div className="mt-2">
            <p className="text-xs text-gray-500 uppercase">National I.D. No.</p>
            <p className="text-sm border-b border-gray-400 h-6">{signatory.nationalIdNo || ''}</p>
        </div>
        <div className="mt-2">
            <p className="text-xs text-gray-500 uppercase">Designation</p>
            <p className="text-sm border-b border-gray-400 h-6">{signatory.designation || ''}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 mt-2">
            <div>
                <p className="text-xs text-gray-500 uppercase">Date</p>
                <p className="text-sm border-b border-gray-400 h-6">{format(new Date(), 'yyyy-MM-dd')}</p>
            </div>
            <div>
                 <p className="text-xs text-gray-500 uppercase">Signature</p>
                <div className="border-b border-gray-400 h-10 flex items-center">
                    {signatory.signature && signatory.signature.startsWith('data:image') ? (
                        <img src={signatory.signature} alt="Signature" className="h-8 w-auto"/>
                    ) : null}
                </div>
            </div>
        </div>
    </div>
);


const AccountResolutionPrintView = React.forwardRef<HTMLDivElement, AccountResolutionPrintViewProps>(({ application }, ref) => {
    
    const resolutionDate = application.details.resolutionDate ? new Date(application.details.resolutionDate) : new Date();
    const signatories = application.details.signatories || [];

    // Create an array of 6 signatories, filling with empty objects if needed
    const signatorySlots = Array.from({ length: 6 }, (_, i) => signatories[i] || {});

    return (
        <div ref={ref} className="bg-white text-black p-8 font-sans" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}>
            <header className="flex items-center justify-between pb-4 mb-4">
                <div className="flex items-center gap-3">
                    <Logo className="h-16 w-16" />
                    <div>
                        <h1 className="text-2xl font-bold">InnBucks</h1>
                        <p className="text-lg">MicroBank Limited</p>
                    </div>
                </div>
                <h1 className="text-xl font-bold text-center flex-grow">
                    Account Resolution<br />Application Form
                </h1>
                <div className="w-24"></div>
            </header>

            <div className="border border-gray-700 p-4">
                <h2 className="text-md font-bold mb-2">Account Mandate</h2>
                <p className="text-sm mb-2">
                    We hereby certify the following are true extracts of resolution passed at the board of Directors / Management Committees / AGM / Board of Trustees of the Company / Associates / Trust held on the
                    <span className="inline-block border-b border-black text-center mx-2" style={{width: '30px'}}>{format(resolutionDate, 'dd')}</span>
                    day of
                    <span className="inline-block border-b border-black text-center mx-2" style={{width: '80px'}}>{format(resolutionDate, 'MMMM')}</span>,
                    <span className="inline-block border-b border-black text-center mx-2" style={{width: '50px'}}>{format(resolutionDate, 'yyyy')}</span>.
                </p>
                <p className="text-sm mt-4">
                    That a transaction / account be opened in the name of 
                    <span className="inline-block border-b border-black w-1/2 ml-2 px-2">{application.clientName}</span>
                </p>
                 <p className="text-xs mt-1 ml-4">(Company name) with InnBucks in accordance with the services requested for and in line with the terms and subject to the provisions of the Microfinance Act, Rules of the institution pursuant to this application.</p>
            </div>
            
            <div className="border-l border-r border-b border-gray-700 p-4">
                <h2 className="text-md font-bold mb-2">Authorisation Signatures</h2>
                <div className="grid grid-cols-2">
                    {signatorySlots.slice(0, 2).map((sig, i) => <SignatoryBox key={i} signatory={sig} isLast={i % 2 !== 0} />)}
                </div>
                <div className="grid grid-cols-2">
                    {signatorySlots.slice(2, 4).map((sig, i) => <SignatoryBox key={i + 2} signatory={sig} isLast={i % 2 !== 0} />)}
                </div>
                 <div className="grid grid-cols-2">
                    {signatorySlots.slice(4, 6).map((sig, i) => <SignatoryBox key={i + 4} signatory={sig} isLast={i % 2 !== 0} />)}
                </div>
                <div className="border-t border-l border-r border-b border-gray-400 p-2">
                    <p className="text-xs text-gray-500 uppercase">Signing Instruction</p>
                    <p className="text-sm border-b border-gray-400 h-12">{application.details.signingInstruction}</p>
                </div>
            </div>
        </div>
    );
});

AccountResolutionPrintView.displayName = 'AccountResolutionPrintView';
export default AccountResolutionPrintView;
