'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { FileSignature, Eraser, RotateCcw, CheckCircle2, ShieldAlert, Upload, Camera, Trash2, File, Plus, Loader2, AlertCircle } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { validateImageQualityHeuristic } from '@/lib/image-validation';

const MAX_PAGES = 12;

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

const PhysicalCapture = ({ fieldName, disabled }: { fieldName: 'agreement1Pages' | 'agreement2Pages' | 'adlaPages'; disabled?: boolean }) => {
    const { toast } = useToast();
    const { watch, setValue } = useFormContext<OnboardingFormData>();
    const pages = watch(fieldName) || [];
    
    const [isValidating, setIsValidating] = React.useState(false);
    const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
    const [isScanning, setIsScanning] = React.useState(false);
    
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (pages.length >= MAX_PAGES) {
            toast({ variant: 'destructive', title: 'Limit Reached', description: `Maximum ${MAX_PAGES} pages allowed.` });
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const dataUri = event.target?.result as string;
            if (file.type.startsWith('image/')) {
                setIsValidating(true);
                const result = await validateImageQualityHeuristic(dataUri);
                setIsValidating(false);
                if (!result.isValid) {
                    toast({ variant: 'destructive', title: 'Quality Check Failed', description: 'Image not clear.' });
                    return;
                }
            }
            setValue(fieldName, [...pages, dataUri], { shouldValidate: true, shouldDirty: true });
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsDataURL(file);
    };

    const startScan = async () => {
        if (pages.length >= MAX_PAGES) {
            toast({ variant: 'destructive', title: 'Limit Reached', description: `Maximum ${MAX_PAGES} pages allowed.` });
            return;
        }
        setIsScanning(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setHasCameraPermission(true);
            setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 300);
        } catch (error) {
            setHasCameraPermission(false);
            setIsScanning(false);
        }
    };

    const captureImage = async () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUri = canvas.toDataURL('image/jpeg');
                stopScan();
                setIsValidating(true);
                const result = await validateImageQualityHeuristic(dataUri);
                setIsValidating(false);
                if (!result.isValid) {
                    toast({ variant: 'destructive', title: 'Quality Check Failed', description: 'Image not clear.' });
                    return;
                }
                setValue(fieldName, [...pages, dataUri], { shouldValidate: true, shouldDirty: true });
            }
        }
    };

    const stopScan = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsScanning(false);
    };

    return (
        <div className="space-y-4">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex-1">
                    {pages.length > 0 ? (
                        <ScrollArea className="w-full whitespace-nowrap rounded-lg border bg-muted/20 p-4">
                            <div className="flex w-max space-x-4">
                                {pages.map((page, idx) => (
                                    <div key={idx} className="relative w-24 h-32 rounded-md border bg-background overflow-hidden group shadow-sm">
                                        <img src={page} alt={`Page ${idx+1}`} className="w-full h-full object-cover" />
                                        <div className="absolute top-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded">#{idx+1}</div>
                                        {!disabled && (
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Button variant="destructive" size="icon" className="h-6 w-6" onClick={() => setValue(fieldName, pages.filter((_, i) => i !== idx))}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {pages.length < MAX_PAGES && !disabled && (
                                    <div className="w-24 h-32 rounded-md border-2 border-dashed flex flex-col items-center justify-center bg-muted/10 text-muted-foreground gap-1">
                                        <Plus className="h-4 w-4 opacity-20" />
                                        <span className="text-[8px] font-black uppercase">Add</span>
                                    </div>
                                )}
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    ) : (
                        <div className="h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5 gap-2">
                            <File className="h-8 w-8 opacity-10" />
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">No pages captured</p>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    {!disabled && (
                        <>
                            <Button variant="outline" className="h-10 text-xs font-black uppercase border-primary/20" onClick={startScan} disabled={isValidating}>
                                <Camera className="mr-2 h-4 w-4" /> Scan Page
                            </Button>
                            <Button variant="outline" className="h-10 text-xs font-black uppercase border-primary/20" onClick={() => fileInputRef.current?.click()} disabled={isValidating}>
                                <Upload className="mr-2 h-4 w-4" /> Upload File
                            </Button>
                        </>
                    )}
                    <Badge variant="outline" className="h-10 justify-center font-black uppercase text-[9px] tracking-widest">
                        {pages.length} / {MAX_PAGES} Pages
                    </Badge>
                </div>
            </div>

            <Dialog open={isScanning} onOpenChange={(o) => !o && stopScan()}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>Scan Physical Page</DialogTitle></DialogHeader>
                    <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                        <video ref={videoRef} className="w-full h-full" autoPlay playsInline muted />
                        <canvas ref={canvasRef} className="hidden" />
                        {!hasCameraPermission && hasCameraPermission !== null && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                                <Alert variant="destructive" className="m-4 max-w-xs"><AlertCircle className="h-4 w-4" /><AlertTitle>Camera Access</AlertTitle><AlertDescription>Please enable camera access.</AlertDescription></Alert>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={stopScan}>Cancel</Button>
                        <Button onClick={captureImage} disabled={!hasCameraPermission} className="bg-primary text-primary-foreground font-black px-8">Take Photo</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const AgreementSection = ({ 
    title, 
    type, 
    methodField,
    acceptedField, 
    signatureField,
    pagesField,
    disabled 
}: { 
    title: string; 
    type: 'agency' | 'adla' | 'merchant' | 'nda'; 
    methodField: keyof OnboardingFormData;
    acceptedField: keyof OnboardingFormData; 
    signatureField: keyof OnboardingFormData; 
    pagesField: keyof OnboardingFormData;
    disabled?: boolean;
}) => {
    const { control, watch, setValue } = useFormContext<OnboardingFormData>();
    const sigPadRef = React.useRef<SignatureCanvas | null>(null);
    const [mounted, setMounted] = React.useState(false);
    
    const method = watch(methodField) as 'digital' | 'physical';
    const isAccepted = watch(acceptedField) as boolean;
    const currentSignature = watch(signatureField) as string;
    const physicalPages = watch(pagesField) as string[] || [];

    React.useEffect(() => { setMounted(true); }, []);

    const handleEndStroke = () => {
        if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
            const dataUrl = sigPadRef.current.toDataURL();
            setValue(signatureField, dataUrl as any, { shouldValidate: true, shouldDirty: true });
        }
    };

    const isSigned = method === 'digital' ? !!currentSignature : physicalPages.length > 0;

    return (
        <div className="space-y-6 p-6 border rounded-2xl bg-card shadow-sm mb-8">
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-lg font-black uppercase tracking-tight text-primary flex items-center gap-2">
                    <FileSignature className="h-5 w-5" />
                    {title}
                </h3>
                {isSigned && (
                    <Badge variant="success" className="font-black uppercase tracking-widest text-[10px] py-1 px-3">
                        <CheckCircle2 className="mr-1.5 h-3 w-3" /> {method === 'digital' ? 'Signed' : 'Captured'}
                    </Badge>
                )}
            </div>

            <Tabs value={method} onValueChange={(v) => !disabled && setValue(methodField, v as any)} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6 h-12 p-1.5 bg-muted/50 rounded-xl">
                    <TabsTrigger value="digital" className="rounded-lg font-black uppercase text-[10px] tracking-widest">Digital Sign-off</TabsTrigger>
                    <TabsTrigger value="physical" className="rounded-lg font-black uppercase text-[10px] tracking-widest">Physical Document</TabsTrigger>
                </TabsList>

                <TabsContent value="digital" className="space-y-6 animate-in fade-in duration-300">
                    <ScrollArea className="h-48 w-full rounded-xl border bg-muted/10 p-6 text-sm leading-relaxed">
                        <AgreementText type={type} />
                    </ScrollArea>

                    <FormField
                        control={control}
                        name={acceptedField}
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4 bg-muted/5">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value as boolean}
                                        onCheckedChange={field.onChange}
                                        disabled={disabled}
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
                            {currentSignature ? (
                                <div className="border-2 border-primary/20 rounded-xl p-4 bg-white shadow-inner flex flex-col items-center justify-center min-h-[160px]">
                                    <img src={currentSignature} alt="Signature" className="h-24 w-auto object-contain" />
                                    {!disabled && (
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setValue(signatureField, '' as any)} className="mt-4 text-[9px] font-black uppercase">
                                            <RotateCcw className="mr-2 h-3 w-3" /> Re-sign
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className={`space-y-2 ${!isAccepted ? 'opacity-20 pointer-events-none' : ''}`}>
                                    <div className="border-2 border-dashed border-primary/20 rounded-xl bg-white h-40 overflow-hidden">
                                        {mounted && <SignatureCanvas ref={sigPadRef} penColor="black" canvasProps={{ className: 'w-full h-full' }} onEnd={handleEndStroke} />}
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => sigPadRef.current?.clear()} className="h-8 text-muted-foreground">
                                        <Eraser className="mr-2 h-3.5 w-3.5" /> Clear
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="physical" className="animate-in fade-in duration-300">
                    <PhysicalCapture fieldName={pagesField as any} disabled={disabled} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default function StepAgreements({ disabled }: { disabled?: boolean }) {
    const { watch } = useFormContext<OnboardingFormData>();
    const relationshipType = watch('relationshipType');
    const clientType = watch('clientType');

    const isInstitution = ['NGO', 'Church', 'School', 'Society', 'Club/ Association', 'Trust'].includes(clientType);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <CardHeader className="px-6 pb-8">
                <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">Legal Agreements</CardTitle>
                <CardDescription className="text-xs uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                    Sign digitally or capture physical contract pages.
                </CardDescription>
            </CardHeader>

            <div className="px-6 pb-6">
                {!isInstitution && (
                    <AgreementSection 
                        title={relationshipType === 'Agency' ? 'Agency Agreement' : 'Merchant Services Agreement'} 
                        type={relationshipType === 'Agency' ? 'agency' : 'merchant'} 
                        methodField="agreement1Method"
                        acceptedField="agreement1Accepted" 
                        signatureField="agreement1Signature"
                        pagesField="agreement1Pages"
                        disabled={disabled}
                    />
                )}

                {relationshipType === 'Merchant' && !isInstitution && (
                    <AgreementSection 
                        title="Non-Disclosure Agreement (NDA)" 
                        type="nda" 
                        methodField="agreement2Method"
                        acceptedField="agreement2Accepted" 
                        signatureField="agreement2Signature"
                        pagesField="agreement2Pages"
                        disabled={disabled}
                    />
                )}

                <AgreementSection 
                    title="ADLA Declaration" 
                    type="adla" 
                    methodField="adlaMethod"
                    acceptedField="adlaAccepted" 
                    signatureField="adlaSignature"
                    pagesField="adlaPages"
                    disabled={disabled}
                />
            </div>
        </div>
    );
}
