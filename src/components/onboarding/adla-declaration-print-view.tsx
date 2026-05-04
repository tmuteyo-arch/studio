
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Logo } from '@/components/logo';

interface AdlaDeclarationPrintViewProps {
  data: any;
}

const TableRow = ({ label, isHeader = false }: { label: string; isHeader?: boolean }) => (
  <tr className="border-b border-black">
    <td className={`p-1.5 text-[10px] border-r border-black w-[60%] ${isHeader ? 'font-black bg-gray-100 uppercase' : 'font-medium'}`}>
      {label}
    </td>
    <td className="p-1.5 text-[10px] border-r border-black text-center w-[15%]">
      {isHeader ? <span className="font-black">YES/NO</span> : ''}
    </td>
    <td className="p-1.5 text-[10px]">
       {isHeader ? <span className="font-black uppercase">Comments</span> : ''}
    </td>
  </tr>
);

const AdlaDeclarationPrintView = React.forwardRef<HTMLDivElement, AdlaDeclarationPrintViewProps>(({ data }, ref) => {
    const clientName = data.organisationLegalName || `${data.individualFirstName || ''} ${data.individualSurname || ''}`.trim() || '____________________';
    const address = data.physicalAddress || data.individualAddress || '________________________________________';
    const phone = data.businessTelNumber || data.individualMobileNumber || '____________________';
    const managerName = data.individualFirstName ? `${data.individualFirstName} ${data.individualSurname}` : '____________________';
    
    const date = format(new Date(), 'dd MMMM yyyy');

    return (
        <div ref={ref} className="bg-white text-black p-10 font-sans leading-tight relative" style={{ width: '210mm', minHeight: '297mm' }}>
            {/* Header Section */}
            <header className="flex flex-col items-center mb-8">
                <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="h-20 w-20 border-2 border-black rounded-full flex items-center justify-center overflow-hidden grayscale">
                         <Logo className="h-16 w-16 opacity-50" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-center">Reserve Bank of Zimbabwe</p>
                </div>
                <h1 className="text-sm font-black uppercase tracking-widest border-b-2 border-black pb-1 mb-1">Exchange Control Division</h1>
                <h2 className="text-md font-black uppercase">ADLA SUB AGENCY DECLARATION FORM</h2>
            </header>

            {/* Entity Details Section */}
            <div className="space-y-3 mb-8 text-[11px]">
                <div className="flex items-baseline gap-2">
                    <span className="w-48 font-bold">Name of Principal ADLA</span>
                    <span className="flex-1 border-b border-black font-black uppercase">InnBucks MicroBank Limited</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="w-48 font-bold">Name of Sub Agent</span>
                    <span className="flex-1 border-b border-black font-black uppercase">{clientName}</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="w-48 font-bold">Sub Agent Tier</span>
                    <span className="flex-1 border-b border-black font-black uppercase">Tier 1</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="w-48 font-bold">Physical Address of the Sub Agent</span>
                    <span className="flex-1 border-b border-black">{address}</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="w-12 font-bold">Phone:</span>
                    <span className="w-32 border-b border-black">Bus: {phone}</span>
                    <span className="w-12 font-bold ml-4">Cell:</span>
                    <span className="flex-1 border-b border-black">{data.individualMobileNumber || '____________________'}</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="w-48 font-bold">Name of Sub Agent Manager</span>
                    <span className="flex-1 border-b border-black uppercase font-bold">{managerName}</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="w-48 font-bold">Phone</span>
                    <span className="flex-1 border-b border-black">{phone}</span>
                </div>
            </div>

            {/* Narrative Body */}
            <div className="text-[10px] mb-4 leading-relaxed">
                <p>
                    I <span className="font-bold uppercase mx-1">{managerName}</span> the manager of 
                    <span className="font-bold uppercase mx-1">{clientName}</span> bureau de change wish to declare that 
                    <span className="font-bold uppercase mx-1">{clientName}</span> bureau de change is in compliant with Exchange Control rules and regulations and is meeting all the Exchange control requirements as in the table below;
                </p>
            </div>

            {/* Declaration Table */}
            <div className="border border-black mb-6">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#1e1b4b] text-white">
                            <th className="p-2 text-left text-[9px] font-black uppercase border-r border-white/20">Area of Declaration</th>
                            <th className="p-2 text-center text-[9px] font-black uppercase border-r border-white/20">Answer YES/NO</th>
                            <th className="p-2 text-left text-[9px] font-black uppercase">Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        <TableRow label="EXCHANGE CONTROL" isHeader={true} />
                        <TableRow label="Exchange Control Training of Officers" />
                        <TableRow label="Stationery" />
                        <TableRow label="Exchange Control Regulations/Guidelines File" />
                        <TableRow label="Security - CCTV, Security guards, panic buttons" />
                        <TableRow label="Knowledge of Transaction Processing" />
                        
                        <TableRow label="ANTI-MONEY LAUNDERING AND COUNTERING OF FINANCIAL TERRORISM PROGRAMME" isHeader={true} />
                        <TableRow label="AML/CFT Policy" />
                        <TableRow label="AML/CFT Training" />
                        <TableRow label="Implementation of AL Qaeda List/Directives" />
                        <TableRow label="STRs Reporting and Returns" />
                        <TableRow label="Handling of PEPs" />
                        <TableRow label="Identification of Customers before carrying-out transaction" />
                    </tbody>
                </table>
            </div>

            {/* Final Statutory Declaration */}
            <div className="space-y-4">
                <p className="text-[9px] font-black uppercase tracking-tight underline">DECLARATION BY AUTHORISED DEALER WITH LIMITED AUTHORITY (ADLA)</p>
                <p className="text-[9px] text-justify leading-relaxed italic text-gray-700">
                    The ADLA declares that the information contained in this form is in its entirety true and correct. This declaration is made in compliance with the provisions of Section 41 of the Exchange Control Regulations, Statutory Instrument 109 of 1996. I acknowledge that providing false information is a breach of Paragraph 5 of subsection (1) of Section 5 of the Exchange Control Act Chapter 22:05 and doing so will render me liable to prosecution under the Act.
                </p>
            </div>

            {/* Signatures */}
            <div className="mt-20 grid grid-cols-2 gap-20">
                <div className="text-center">
                    <div className="border-b border-black h-12 mb-2 flex items-center justify-center">
                        {data.adlaSignature && <img src={data.adlaSignature} alt="Sig" className="h-8 object-contain" />}
                    </div>
                    <p className="text-[10px] font-black uppercase">Authorized Signatory</p>
                    <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold">Sub-Agent Signature • {date}</p>
                </div>
                <div className="text-center">
                    <div className="border-b border-black h-12 mb-2"></div>
                    <p className="text-[10px] font-black uppercase">Authorized Signatory</p>
                    <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold">InnBucks (Principal ADLA)</p>
                </div>
            </div>

            <footer className="absolute bottom-10 left-10 right-10 flex justify-between items-end border-t border-gray-100 pt-4">
                <div className="text-[8px] uppercase font-bold text-gray-400 tracking-[0.2em]">
                    Registry Ref: {data.brIdentity || 'AWAITING-ID'}
                </div>
                <div className="text-[8px] text-gray-300 italic font-medium">
                    Official Form AD-01-SUB (RBZ Compliant Layout)
                </div>
            </footer>
        </div>
    );
});

AdlaDeclarationPrintView.displayName = 'AdlaDeclarationPrintView';
export default AdlaDeclarationPrintView;
