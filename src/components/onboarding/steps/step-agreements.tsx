'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileSignature, Eraser, RotateCcw, CheckCircle2, ShieldAlert } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const AgreementText = ({ type }: { type: 'agency' | 'adla' | 'merchant' | 'nda' }) => {
    switch (type) {
        case 'agency':
            return (
                <div className="space-y-4">
                    <h3 className="font-black uppercase tracking-tight">AGENCY AGREEMENT</h3>
                    <p>This Agency Agreement is entered into between InnBucks MicroBank Limited ("the Bank") and the Agent.</p>
                    <p>1. APPOINTMENT: The Bank hereby appoints the Agent to provide agency services including customer onboarding and KYC verification.</p>
                    <p>2. COMPLIANCE: The Agent shall strictly adhere to all AML/CFT regulations and Bank policies. Failure to comply will result in immediate termination.</p>
                    <p>3. CONFIDENTIALITY: The Agent shall maintain strict confidentiality regarding all customer data and Bank proprietary information.</p>
                    <p>4. REMUNERATION: Fees and commissions shall be paid as per the Bank's prevailing tariff schedule.</p>
                </div>
            );
        case 'adla':
            return (
                <div className="space-y-4">
                    <h3 className="font-black uppercase tracking-tight">ADLA DECLARATION</h3>
                    <p>AUTHORISED DEALER WITH LIMITED AUTHORITY (ADLA) COMPLIANCE FORM</p>
                    <p>I, the undersigned, hereby declare that our organization will operate as an ADLA Agent in full compliance with the Reserve Bank of Zimbabwe guidelines.</p>
                    <p>We commit to: sighting original identification documents, maintaining transaction records for 5 years, and reporting suspicious activity within 24 hours.</p>
                </div>
            );
        case 'merchant':
            return (
                <div className="space-y-4">
                    <h3 className="font-black uppercase tracking-tight">MERCHANT SERVICES AGREEMENT</h3>
                    <p>This agreement governs the provision of payment processing services by InnBucks MicroBank to the Merchant.</p>
                    <p>1. SERVICE: The Bank will facilitate digital payments for the Merchant's goods and services.</p>
                    <p>2. FEES: Transaction fees will be debited from settlements as agreed.</p>
                    <p>3. SECURITY: The Merchant must maintain secure systems and notify the Bank of any breaches immediately.</p>
                </div>
            );
        case 'nda':
            return (
                <div className="space-y-4">
                    <h3 className="font-black uppercase tracking-tight">NON-DISCLOSURE AGREEMENT</h3>
                    <p>The parties intend to exchange certain confidential information for the purpose of evaluating a business relationship.</p>
                    <p>The Receiving Party shall not disclose, reveal, or use any Confidential Information for any purpose other than the business purpose.</p>
                    <p>This obligation shall survive the termination of any resulting business relationship for a period of five (5) years.</p>
                </div>
            );
    }
};

const AgreementSection = ({ 
    title, 
    type, 
    acceptedField, 
    signatureField, 
    disabled 
}: { 
    title: string; 
    type: 'agency' | 'adla' | 'merchant' | 'nda'; 
    acceptedField: keyof OnboardingFormData; 
    signatureField: keyof OnboardingFormData; 
    disabled?: boolean;
}) => {
    const { control, watch, setValue } = useFormContext<OnboardingFormData>();
    const sigPadRef = React.useRef<SignatureCanvas | null>(null);
    const [mounted, setMounted] = React.useState(false);
    
    const isAccepted = watch(acceptedField) as boolean;
    const currentSignature = watch(signatureField) as string;

    React.useEffect(() => { setMounted(true); }, []);

    const handleEndStroke = () => {
        if (sigPadRef.current) {
            if (!sigPadRef.current.isEmpty()) {
                const dataUrl = sigPadRef.current.toDataURL();
                setValue(signatureField, dataUrl as any, { shouldValidate: true, shouldDirty: true });
            }
        }
    };

    const handleClear = () => {
        sigPadRef.current?.clear();
        setValue(signatureField, '' as any, { shouldValidate: true });
    };

    const isSigned = !!currentSignature;

    return (
        <div className="space-y-6 p-6 border rounded-2xl bg-card shadow-sm mb-8">
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-lg font-black uppercase tracking-tight text-primary flex items-center gap-2">
                    <FileSignature className="h-5 w-5" />
                    {title}
                </h3>
                {isSigned && (
                    <Badge variant="success" className="font-black uppercase tracking-widest text-[10px] py-1 px-3">
                        <CheckCircle2 className="mr-1.5 h-3 w-3" /> Signed
                    </Badge>
                )}
            </div>

            <ScrollArea className="h-48 w-full rounded-xl border bg-muted/10 p-6 text-sm leading-relaxed">
                <AgreementText type={type} />
            </ScrollArea>

            <div className="space-y-6">
                <FormField
                    control={control}
                    name={acceptedField}
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4 bg-muted/5">
                            <FormControl>
                                <Checkbox
                                    checked={field.value as boolean}
                                    onCheckedChange={field.onChange}
                                    disabled={disabled || isSigned}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="font-bold text-xs uppercase tracking-tight cursor-pointer">
                                    I confirm that I have read and agree to the terms of this document.
                                </FormLabel>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

                <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Digital Signature</Label>
                    <div className="relative">
                        {isSigned ? (
                            <div className="border-2 border-primary/20 rounded-xl p-4 bg-white shadow-inner flex flex-col items-center justify-center min-h-[160px]">
                                <img src={currentSignature} alt="Signature" className="h-24 w-auto object-contain" />
                                {!disabled && (
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setValue(signatureField, '' as any)}
                                        className="mt-4 text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-[9px] tracking-widest"
                                    >
                                        <RotateCcw className="mr-2 h-3 w-3" /> Click here to re-sign
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className={`space-y-2 ${!isAccepted ? 'opacity-20 pointer-events-none' : 'animate-in fade-in zoom-in-95'}`}>
                                <div className="border-2 border-dashed border-primary/20 rounded-xl bg-white overflow-hidden shadow-sm h-40">
                                    {mounted && (
                                        <SignatureCanvas
                                            ref={sigPadRef}
                                            penColor="black"
                                            canvasProps={{ className: 'w-full h-full' }}
                                            onEnd={handleEndStroke}
                                        />
                                    )}
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[9px] text-muted-foreground italic font-medium">Use mouse or touch to sign above.</p>
                                    <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="h-8 text-muted-foreground hover:text-destructive">
                                        <Eraser className="mr-2 h-3.5 w-3.5" /> Clear
                                    </Button>
                                </div>
                            </div>
                        )}
                        {!isAccepted && !isSigned && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-xl">
                                <Badge variant="outline" className="bg-background font-black uppercase tracking-widest text-[9px] py-1.5 px-4 shadow-sm">
                                    <ShieldAlert className="mr-2 h-3.5 w-3.5 text-amber-500" />
                                    Check "I agree" box first
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function StepAgreements({ disabled }: { disabled?: boolean }) {
    const { watch } = useFormContext<OnboardingFormData>();
    const relationshipType = watch('relationshipType');

    const isAgency = relationshipType === 'Agency';

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <CardHeader className="px-6 pb-8">
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Legal Agreements</CardTitle>
                <CardDescription className="text-xs uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                    Please review and sign the mandatory documents for your {relationshipType} relationship.
                </CardDescription>
            </CardHeader>

            <div className="px-6 pb-6">
                {isAgency ? (
                    <>
                        <AgreementSection 
                            title="Agency Agreement" 
                            type="agency" 
                            acceptedField="agreement1Accepted" 
                            signatureField="agreement1Signature"
                            disabled={disabled}
                        />
                    </>
                ) : (
                    <>
                        <AgreementSection 
                            title="Merchant Services Agreement" 
                            type="merchant" 
                            acceptedField="agreement1Accepted" 
                            signatureField="agreement1Signature"
                            disabled={disabled}
                        />
                        <AgreementSection 
                            title="Non-Disclosure Agreement (NDA)" 
                            type="nda" 
                            acceptedField="agreement2Accepted" 
                            signatureField="agreement2Signature"
                            disabled={disabled}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
