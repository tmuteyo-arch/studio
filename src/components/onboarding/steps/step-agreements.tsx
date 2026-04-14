'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { FileSignature, CheckCircle2, Upload, Camera, Trash2, File, Plus, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { validateImageQualityHeuristic } from '@/lib/image-validation';
import { Input } from '@/components/ui/input';

const MAX_PAGES = 12;

const PhysicalCapture = ({ fieldName, disabled }: { fieldName: 'agreement1Pages' | 'agreement2Pages'; disabled?: boolean }) => {
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
    acceptedField, 
    signatureField,
    pagesField,
    disabled 
}: { 
    title: string; 
    acceptedField: keyof OnboardingFormData; 
    signatureField: keyof OnboardingFormData; 
    pagesField: keyof OnboardingFormData;
    disabled?: boolean;
}) => {
    const { control, watch } = useFormContext<OnboardingFormData>();
    
    const physicalPages = watch(pagesField) as string[] || [];
    const isAccepted = watch(acceptedField) as boolean;
    const signOffName = watch(signatureField) as string;

    const isComplete = physicalPages.length > 0 && isAccepted && (signOffName?.length || 0) >= 3;

    return (
        <div className="space-y-6 p-6 border rounded-2xl bg-card shadow-sm mb-8">
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-lg font-black uppercase tracking-tight text-primary flex items-center gap-2">
                    <FileSignature className="h-5 w-5" />
                    {title}
                </h3>
                {isComplete && (
                    <Badge variant="success" className="font-black uppercase tracking-widest text-[10px] py-1 px-3">
                        <CheckCircle2 className="mr-1.5 h-3 w-3" /> Signed & Uploaded
                    </Badge>
                )}
            </div>

            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Document Capture (Scan or Upload Existing Signed Contract)</Label>
                    <PhysicalCapture fieldName={pagesField as any} disabled={disabled} />
                </div>

                {physicalPages.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-dashed animate-in slide-in-from-top-2">
                        <div className="bg-primary/5 p-5 rounded-xl border border-primary/10">
                            <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" /> 
                                Acknowledgement Sign-off
                            </h4>
                            
                            <FormField
                                control={control}
                                name={acceptedField}
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-6">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value as boolean}
                                                onCheckedChange={field.onChange}
                                                disabled={disabled}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="font-bold text-[11px] uppercase tracking-tight cursor-pointer leading-tight">
                                                I confirm that the uploaded document is a true and correct copy of the fully signed {title}.
                                            </FormLabel>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name={signatureField}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[9px] font-black uppercase text-muted-foreground tracking-widest ml-1">Typed Full Name (Acknowledge Sign-off)</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Type your full name here..." 
                                                {...field} 
                                                value={field.value || ''} 
                                                disabled={disabled || !isAccepted}
                                                className="h-12 bg-background border-primary/20 text-md font-bold rounded-lg focus:ring-primary"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function StepAgreements({ disabled }: { disabled?: boolean }) {
    const { watch } = useFormContext<OnboardingFormData>();
    const relationshipType = watch('relationshipType');
    const clientType = watch('clientType');

    const isInstitution = ['NGO', 'Church', 'School', 'Society', 'Club/ Association', 'Trust'].includes(clientType);

    if (isInstitution) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <CardHeader className="px-6 pb-8">
                <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">InnBucks Agreement</CardTitle>
                <CardDescription className="text-xs uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">
                    Upload your existing signed contracts and complete the digital sign-off acknowledgement.
                </CardDescription>
            </CardHeader>

            <div className="px-6 pb-6">
                {!isInstitution && (
                    <AgreementSection 
                        title={relationshipType === 'Agency' ? 'Agency Agreement' : 'Merchant Services Agreement'} 
                        acceptedField="agreement1Accepted" 
                        signatureField="agreement1Signature"
                        pagesField="agreement1Pages"
                        disabled={disabled}
                    />
                )}

                {relationshipType === 'Merchant' && !isInstitution && (
                    <AgreementSection 
                        title="Non-Disclosure Agreement (NDA)" 
                        acceptedField="agreement2Accepted" 
                        signatureField="agreement2Signature"
                        pagesField="agreement2Pages"
                        disabled={disabled}
                    />
                )}
            </div>
        </div>
    );
}
