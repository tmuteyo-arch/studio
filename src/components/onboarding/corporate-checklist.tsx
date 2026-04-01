'use client';
import * as React from 'react';
import { Application } from '@/lib/mock-data';
import { Logo } from '@/components/logo';

interface CorporateChecklistProps {
    application: Application;
    supervisor?: string;
}

const CheckboxItem = ({ label, checked }: { label: string, checked: boolean }) => (
    <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border border-black flex items-center justify-center">
            {checked && <span className="text-black font-bold">✓</span>}
        </div>
        <span className="text-sm">{label}</span>
    </div>
);

const DottedLine = () => <span className="border-b border-dotted border-gray-500 flex-grow mx-1"></span>;

const CorporateChecklist = React.forwardRef<HTMLDivElement, CorporateChecklistProps>(({ application, supervisor }, ref) => {
    
    const approvalEntry = application.history.find(h => h.action === 'Approved' || h.action === 'Supervisor Approved');
    const supervisorName = supervisor || (approvalEntry ? approvalEntry.user : 'N/A');
    const approvalDate = approvalEntry ? new Date(approvalEntry.timestamp).toLocaleDateString() : 'N/A';

    const hasDoc = (docType: string) => application.documents.some(d => d.type === docType);

    return (
        <div ref={ref} className="bg-white text-black p-8 font-sans" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}>
            <header className="flex items-center justify-between pb-4 mb-4">
                <div className="flex items-center gap-3">
                    <Logo className="h-16 w-16" />
                </div>
                <h1 className="text-2xl font-bold text-center flex-grow">
                    Checklist For Corporate<br />Account Opening
                </h1>
                <div className="w-16"></div>
            </header>
            
            <div className="border-2 border-black p-2">
                <div className="flex justify-between items-center bg-gray-200 p-1">
                    <h2 className="font-bold text-sm">For Bank</h2>
                </div>
                <table className="w-full border-collapse" style={{ border: '1px solid black' }}>
                    <thead>
                        <tr style={{ border: '1px solid black' }}>
                            <th className="p-2 text-left text-xs font-bold" style={{ border: '1px solid black', width: '85%' }}>CHECKLIST DETAILS (CORPORATE ACCOUNT OPENING) INNBUCKS MICROBANK</th>
                            <th className="p-2 text-left text-xs font-bold" style={{ border: '1px solid black' }}>INITIALS OR N/A</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={2} className="p-2 text-xs" style={{ border: '1px solid black' }}>
                                Tick where applicable and attach on customer file upon completion of necessary checks.
                            </td>
                        </tr>
                        <tr style={{ border: '1px solid black' }}>
                            <td className="p-2 space-y-1" style={{ border: '1px solid black' }}>
                                <p className="font-bold text-sm mb-2">1.1 Confirm receipt of the following documents:</p>
                                <CheckboxItem label="Memorandum and Articles of Association" checked={hasDoc('Memorandum and Articles of Association')} />
                                <CheckboxItem label="Certificate of Incorporation" checked={hasDoc('Certificate of Incorporation')} />
                                <CheckboxItem label="Constitution (where applicable)" checked={hasDoc('Constitution')} />
                                <CheckboxItem label="Partnership Agreement/declaration" checked={hasDoc('Partnership Agreement')} />
                                <CheckboxItem label="Trust Deed" checked={hasDoc('Trust Deed')} />
                                <CheckboxItem label="Tax Clearance Certificate (Current/Valid)" checked={hasDoc('Tax Clearance Certificate') || hasDoc('ZIMRA Tax Clearance Certificate') || hasDoc('Certified Tax Clearance')} />
                                <CheckboxItem label="CR 2/CR11- Confirmation of shareholding structure on Company letterhead." checked={hasDoc('CR2') || hasDoc('CR11')} />
                                <CheckboxItem label="CR 6 Notice of Registered office, and postal address" checked={hasDoc('CR6') || hasDoc('CR5 / CR6 Forms')} />
                                <CheckboxItem label="CR14 Register of directors, and officers" checked={hasDoc('CR14') || hasDoc('CR14 Form')} />
                                <CheckboxItem label="Lease Agreement (Operating address)" checked={hasDoc('Lease Agreement')} />
                                <CheckboxItem label="Business License (Trading/Shop license)" checked={hasDoc('Business License') || hasDoc('Operating and Business Licence')} />
                                <CheckboxItem label="For Directors (Proof of identities, Proof of residence)" checked={hasDoc('Valid Identity Documents') || (hasDoc('National ID Card') && hasDoc('Proof of Residence'))} />
                                <CheckboxItem label="Resolution to open bank account with Innbucks Microbank" checked={hasDoc('Board Resolution') || hasDoc('Board Resolution Letter')} />
                                <CheckboxItem label="Bank Statements from Current Bankers- Current 3 months" checked={hasDoc('Bank Statement') || hasDoc('Stamped Bank Statement')} />

                                <p className="font-bold text-sm mt-4 mb-2">1.2 Confirm correct completion of the following mandatory forms.</p>
                                <CheckboxItem label="Account opening form" checked={true} />
                                <CheckboxItem label="Signature card" checked={application.signatories.length > 0} />
                                <CheckboxItem label="Agency Agreement" checked={!!application.details.agreement1Accepted} />
                                <CheckboxItem label="Non-Disclosure Agreement (NDA)" checked={!!application.details.agreement2Accepted} />
                                <CheckboxItem label="Merchant Agreement Form" checked={application.details.relationshipType === 'Merchant' && !!application.details.agreement1Accepted} />
                                <CheckboxItem label="ADLA declaration" checked={hasDoc('ADLA Declaration')} />

                                <p className="font-bold text-sm mt-4 mb-2">1.3 Digital Banking Setup</p>
                                <CheckboxItem label="Internet banking (IT Department)." checked={false} />
                            </td>
                            <td className="p-2" style={{ border: '1px solid black' }}></td>
                        </tr>
                        <tr style={{ border: '1px solid black' }}>
                            <td colSpan={2} className="p-2 space-y-3 text-sm">
                                <div className="flex items-center">1.4 Financial Clearing Bureau (FCB) report obtained on: <DottedLine /> (date)</div>
                                <div className="flex items-center">1.5 Smart Analytics report obtained on: <DottedLine /> (date)</div>
                                <div className="flex items-center">1.6 Special Approvals/ Waivers sort e.g. PEP <div className="w-4 h-4 border border-black inline-block ml-2"></div></div>
                                <div className="flex items-center">1.7 Other special approvals: <div className="w-4 h-4 border border-black inline-block ml-2"></div></div>
                                <div className="flex items-center">1.8 Welcome email dispatched to customer on: <DottedLine /> (date)</div>
                                <p>We certify that all the account opening procedures have been followed and all the customer details have been captured completely and accurately on BR.</p>
                                <div className="flex items-center">Date <DottedLine /></div>
                                <div className="flex items-center">ACCOUNT OPENED BY(Name) <DottedLine /> (Sig) <DottedLine /></div>
                            </td>
                        </tr>
                         <tr style={{ border: '1px solid black', height: '40px' }}>
                            <td colSpan={2} className="p-2 text-sm flex items-center">
                                SUPERVISED BY: <span className="px-4 border-b border-dotted border-gray-500">{supervisorName}</span>
                                <span className="ml-auto">Date:</span> <span className="px-4 border-b border-dotted border-gray-500">{approvalDate}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
});

CorporateChecklist.displayName = 'CorporateChecklist';
export default CorporateChecklist;
