
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Logo } from '@/components/logo';

interface AgencyAgreementPrintViewProps {
  data: any;
}

const AgencyAgreementPrintView = React.forwardRef<HTMLDivElement, AgencyAgreementPrintViewProps>(({ data }, ref) => {
    const clientName = data.organisationLegalName || `${data.individualFirstName || ''} ${data.individualSurname || ''}`.trim() || '____________________';
    const address = data.physicalAddress || data.individualAddress || '________________________________________';
    const date = format(new Date(), 'dd MMMM yyyy');

    return (
        <div ref={ref} className="bg-white text-black p-12 font-serif" style={{ width: '210mm', minHeight: '297mm' }}>
            <header className="flex flex-col items-center mb-8 border-b-2 border-black pb-4">
                <Logo className="h-20 w-20 mb-2" />
                <h1 className="text-3xl font-bold uppercase">InnBucks MicroBank</h1>
                <p className="text-xl font-semibold">AGENCY AGREEMENT</p>
            </header>

            <main className="space-y-6 text-justify text-sm leading-relaxed">
                <section>
                    <p>THIS AGREEMENT is made this <strong>{date}</strong>.</p>
                    <p className="mt-4">BETWEEN:</p>
                    <p><strong>INNBUCKS MICROBANK LIMITED</strong>, a company incorporated in Zimbabwe, having its registered office at [Address], Harare (hereinafter referred to as "the Bank").</p>
                    <p className="mt-2">AND:</p>
                    <p><strong>{clientName}</strong>, of <strong>{address}</strong> (hereinafter referred to as "the Agent").</p>
                </section>

                <section>
                    <h2 className="font-bold underline uppercase mb-2">1. Appointment</h2>
                    <p>The Bank hereby appoints the Agent to provide agency services as set out in this Agreement, and the Agent accepts such appointment. The Agent shall perform the services in a professional and diligent manner, adhering to all laws and Bank policies.</p>
                </section>

                <section>
                    <h2 className="font-bold underline uppercase mb-2">2. Scope of Services</h2>
                    <p>The Agent is authorized to:
                        <ul className="list-disc ml-6 mt-1">
                            <li>Facilitate customer account opening applications.</li>
                            <li>Perform KYC and due diligence on prospective customers.</li>
                            <li>Assist in document collection and verification.</li>
                            <li>Provide customer support for InnBucks wallet services.</li>
                        </ul>
                    </p>
                </section>

                <section>
                    <h2 className="font-bold underline uppercase mb-2">3. Compliance</h2>
                    <p>The Agent warrants that they will comply with all Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) regulations as prescribed by the Reserve Bank of Zimbabwe. Failure to comply will result in immediate termination.</p>
                </section>

                <section className="pt-12">
                    <div className="grid grid-cols-2 gap-12 mt-12">
                        <div className="space-y-8">
                            <p className="font-bold">SIGNED for and on behalf of the BANK:</p>
                            <div className="border-b border-black h-12"></div>
                            <p className="text-xs uppercase">Authorized Signature</p>
                        </div>
                        <div className="space-y-8">
                            <p className="font-bold">SIGNED by the AGENT:</p>
                            <div className="border-b border-black h-12"></div>
                            <p className="text-xs uppercase">Authorized Signature (Agent)</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mt-20 pt-4 border-t border-gray-300 text-center text-[10px] text-gray-500">
                InnBucks MicroBank Limited - Confidential - {format(new Date(), 'yyyy')}
            </footer>
        </div>
    );
});

AgencyAgreementPrintView.displayName = 'AgencyAgreementPrintView';
export default AgencyAgreementPrintView;
