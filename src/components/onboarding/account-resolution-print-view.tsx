'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Application } from '@/lib/mock-data';
import { Logo } from '@/components/logo';

interface AccountResolutionPrintViewProps {
  application: Application;
}

const SignatoryBox = ({ signatory }: { signatory: any }) => (
    <div className="border border-gray-300 rounded p-2 bg-gray-50/30">
        <div className="grid grid-cols-[100px_1fr] items-center gap-2 mb-1.5 border-b border-gray-200 pb-1">
            <span className="text-[9px] font-bold uppercase text-gray-500">Surname</span>
            <div className="h-5 border-l border-gray-200 pl-2 text-xs font-bold">{signatory.surname || ''}</div>
        </div>
        <div className="grid grid-cols-[100px_1fr] items-center gap-2 mb-1.5 border-b border-gray-200 pb-1">
            <span className="text-[9px] font-bold uppercase text-gray-500">First Name</span>
            <div className="h-5 border-l border-gray-200 pl-2 text-xs font-bold">{signatory.firstName || ''}</div>
        </div>
        <div className="grid grid-cols-[100px_1fr] items-center gap-2 mb-1.5 border-b border-gray-200 pb-1">
            <span className="text-[9px] font-bold uppercase text-gray-500">Other Name</span>
            <div className="h-5 border-l border-gray-200 pl-2 text-xs font-bold">{signatory.otherName || ''}</div>
        </div>
        <div className="grid grid-cols-[100px_1fr] items-center gap-2 mb-1.5 border-b border-gray-200 pb-1">
            <span className="text-[9px] font-bold uppercase text-gray-500">National I.D. No.</span>
            <div className="h-5 border-l border-gray-200 pl-2 text-xs font-mono font-bold">{signatory.nationalIdNo || ''}</div>
        </div>
        <div className="grid grid-cols-[100px_1fr] items-center gap-2 mb-1.5 border-b border-gray-200 pb-1">
            <span className="text-[9px] font-bold uppercase text-gray-500">Designation</span>
            <div className="h-5 border-l border-gray-200 pl-2 text-xs font-bold">{signatory.designation || ''}</div>
        </div>
        <div className="grid grid-cols-[100px_1fr] items-center gap-2 mb-1.5 border-b border-gray-200 pb-1">
            <span className="text-[9px] font-bold uppercase text-gray-500">Date</span>
            <div className="h-5 border-l border-gray-200 pl-2 text-xs font-bold">{signatory.signature ? format(new Date(), 'yyyy-MM-dd') : ''}</div>
        </div>
        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <span className="text-[9px] font-bold uppercase text-gray-500">Signature</span>
            <div className="h-8 border-l border-gray-200 pl-2 flex items-center">
                {signatory.signature && signatory.signature.startsWith('data:image') ? (
                    <img src={signatory.signature} alt="Signature" className="h-6 w-auto object-contain"/>
                ) : null}
            </div>
        </div>
    </div>
);


const AccountResolutionPrintView = React.forwardRef<HTMLDivElement, AccountResolutionPrintViewProps>(({ application }, ref) => {
    const resolutionDate = application.details.resolutionDate ? new Date(application.details.resolutionDate) : new Date();
    const signatories = application.signatories || [];
    const signatorySlots = Array.from({ length: 6 }, (_, i) => signatories[i] || {});

    return (
        <div ref={ref} className="bg-white text-black p-10 font-sans" style={{ width: '210mm', minHeight: '297mm' }}>
            {/* Header matching image structure */}
            <header className="flex items-center justify-between border-b-4 border-[#1e1b4b] pb-4 mb-8">
                <div className="flex items-center gap-4">
                    <Logo className="h-14 w-14" />
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-[#1e1b4b]">InnBucks</h1>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">MicroBank Limited</p>
                    </div>
                </div>
                <div className="h-full border-l-2 border-gray-200 px-8">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-[#1e1b4b]">Application Form</h2>
                </div>
            </header>

            <main className="space-y-8">
                <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#1e1b4b] mb-4">Account Mandate</h3>
                    <div className="space-y-4 text-[11px] leading-relaxed text-gray-700">
                        <p>
                            We hereby certify the following are true extracts of resolution passed at the board of Directors / Management Committees / AGM / Board of Trustees of the 
                            Company / Associates / Trust held on the 
                            <span className="inline-block border-b border-black w-8 text-center mx-1 font-bold">{format(resolutionDate, 'dd')}</span> 
                            day of 
                            <span className="inline-block border-b border-black w-24 text-center mx-1 font-bold">{format(resolutionDate, 'MMMM')}</span> 
                            <span className="inline-block border-b border-black w-12 text-center mx-1 font-bold">{format(resolutionDate, 'yyyy')}</span>.
                        </p>
                        <p>
                            We hereby certify the following are true extracts of resolution passed at the board of Directors / Management Committees / AGM /
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span>That a transaction / account be opened in the name of</span>
                            <div className="flex-1 border-b border-black font-black text-xs uppercase px-2 py-0.5 bg-gray-50">
                                {application.clientName}
                            </div>
                        </div>
                        <p className="text-[10px] italic text-gray-500 mt-1">
                            (Company name) with InnBucks in accordance with the services requested for and in line with the terms and subject to the provisions of the Microfinance Act, Rules of the institution pursuant to this application.
                        </p>
                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#1e1b4b] mb-4">Authorisation Signatures</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {signatorySlots.map((sig, i) => (
                            <SignatoryBox key={i} signatory={sig} />
                        ))}
                    </div>
                </section>

                <section className="pt-4">
                    <div className="border border-gray-300 rounded p-4 bg-gray-50/50">
                        <span className="text-[9px] font-bold uppercase text-gray-500 block mb-2">Signing Instruction</span>
                        <div className="min-h-[40px] text-xs font-bold italic text-[#1e1b4b]">
                            {application.details.signingInstruction || '________________________________________________________________________________'}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mt-20 pt-6 border-t border-gray-100 flex justify-between items-end">
                <div className="text-[8px] uppercase font-bold text-gray-400 tracking-[0.2em]">
                    <p>Internal Registry Reference: {application.id}</p>
                    <p className="mt-1">Generated: {new Date().toLocaleString()}</p>
                </div>
                <div className="text-[8px] text-gray-300 italic">
                    InnBucks MicroBank Limited - Compliance Form AM-02
                </div>
            </footer>
        </div>
    );
});

AccountResolutionPrintView.displayName = 'AccountResolutionPrintView';
export default AccountResolutionPrintView;
