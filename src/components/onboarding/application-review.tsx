'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Application, applicationsAtom, Comment, HistoryLog, OnboardingFormData, Document as AppDocument, FcbStatus } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Archive, ArrowLeft, Check, FileText, History, User, X, MessageSquare, Download, CornerUpLeft, CheckCircle2, AlertCircle, Loader2, Wand2, FileEdit, FileSignature, Eraser, UserCheck, Eye, ShieldCheck, ShieldAlert, Upload, ShieldQuestion, Send, Key, Fingerprint, Wallet, MapPin, Sparkles, Globe, Trash2, Info, FileSearch, Hash } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '../ui/textarea';
import ApplicationPrintView from './application-print-view';
import AgencyAgreementPrintView from './agency-agreement-print-view';
import AdlaDeclarationPrintView from './adla-declaration-print-view';
import { useToast } from '@/hooks/use-toast';
import { User as UserProfile } from '@/lib/users';
import { Label } from '../ui/label';
import { getDocumentRequirements } from '@/lib/document-requirements';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { FormProvider, useForm } from 'react-hook-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { rejectionReasons } from '@/lib/types';
import CorporateChecklist from './corporate-checklist';
import { Badge } from '@/components/ui/badge';
import StepCorporateInfo from './steps/step-corporate-info';
import StepSignatories from './steps/step-signatories';
import StepIndividualInfo from './steps/step-individual-info';
import AccountResolutionPrintView from './account-resolution-print-view';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { extractAndValidateData } from '@/ai/flows/extract-and-validate-data';
import StepDocumentUpload from './steps/step-document-upload';
import SignatureCanvas from 'react-signature-canvas';

interface ApplicationReviewProps {
  application: Application;
  onBack: () => void;
  user: UserProfile;
}

const DetailItem = ({ label, value }: { label: string; value: string | undefined | null | boolean; }) => {
    if (value === undefined || value === null || value === '') return null;
    let displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{displayValue || '-'}</p>
        </div>
    );
};

const fcbStatusOptions: FcbStatus[] = ['Adverse', 'Good', 'PEP', 'AML', 'Green', 'Prior Adverse', 'Fair'];

const InternalSignatureDialog = ({ 
    isOpen, 
    onClose, 
    onSign, 
    title, 
    description 
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    onSign: (signature: string) => void, 
    title: string, 
    description: string 
}) => {
    const sigPadRef = React.useRef<SignatureCanvas | null>(null);
    const handleClear = () => sigPadRef.current?.clear();
    const handleConfirm = () => {
        if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
            onSign(sigPadRef.current.toDataURL());
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-card border-primary/20 rounded-2xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-primary">
                        <FileSignature className="h-6 w-6" /> {title}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-2">{description}</DialogDescription>
                </DialogHeader>
                <div className="py-6 space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Draw Digital Signature</Label>
                    <div className="w-full h-40 border-2 border-primary/10 rounded-xl bg-white overflow-hidden shadow-inner">
                        <SignatureCanvas 
                            ref={sigPadRef} 
                            penColor="black" 
                            canvasProps={{ className: 'w-full h-full' }} 
                        />
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-primary">
                        <Eraser className="mr-2 h-4 w-4" /> Clear Canvas
                    </Button>
                </div>
                <DialogFooter className="gap-3 sm:flex-col">
                    <Button onClick={handleConfirm} className="w-full h-12 text-lg font-black uppercase tracking-widest shadow-lg bg-primary text-primary-foreground">CONFIRM & SIGN</Button>
                    <Button variant="ghost" onClick={onClose} className="w-full font-bold">Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function ApplicationReview({ application: initialApplication, onBack, user }: ApplicationReviewProps) {
  const { toast } = useToast();
  const [applications, setApplications] = useAtom(applicationsAtom);
  const [application, setApplication] = React.useState(initialApplication);
  const [newComment, setNewComment] = React.useState('');
  const [isPrinting, setIsPrinting] = React.useState(false);
  const printRef = React.useRef<HTMLDivElement>(null);
  const checklistRef = React.useRef<HTMLDivElement>(null);
  const resolutionRef = React.useRef<HTMLDivElement>(null);
  const agencyAgreementRef = React.useRef<HTMLDivElement>(null);
  const adlaRef = React.useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = React.useState("form-data");

  const [isRejecting, setIsRejecting] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [rejectionComment, setRejectionComment] = React.useState('');

  const [isReturning, setIsReturning] = React.useState(false);
  const [returnComment, setReturnComment] = React.useState('');

  const [isReturningToBO, setIsReturningToBO] = React.useState(false);
  const [returnToBOComment, setReturnToBOComment] = React.useState('');

  const [isDeletingConfirmOpen, setIsDeletingConfirmOpen] = React.useState(false);
  
  const [previewDoc, setPreviewDoc] = React.useState<AppDocument | null>(null);

  // Compliance State for Back Office
  const [selectedFcbStatus, setSelectedFcbStatus] = React.useState<FcbStatus>(application.fcbStatus);
  const [fcbReport, setFcbReport] = React.useState<AppDocument | null>(application.documents.find(d => d.type === 'FCB Report') || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Workflow States
  const [brIdentity, setBrIdentity] = React.useState(application.details.brIdentity || '');
  const [activationCode, setActivationCode] = React.useState(application.details.activationCode || '');
  const [dispatchBrAccountNumber, setDispatchBrAccountNumber] = React.useState('');
  const [dispatchWalletAccountNumber, setDispatchWalletAccountNumber] = React.useState('');
  const [isDispatching, setIsDispatching] = React.useState(false);
  const [isAiProcessing, setIsAiProcessing] = React.useState(false);

  // Tiered Approval Signature States
  const [isSupervisorSigning, setIsSupervisorSigning] = React.useState(false);
  const [isExecutiveSigning, setIsExecutiveSigning] = React.useState(false);

  const isReadOnly = !['Draft', 'Returned to ATL', 'Returned to ASL', 'Claimed by ASL'].includes(application.status);

  const isPersonalOrIndividual = ['Individual Accounts', 'Minors', 'Sole Trader'].includes(application.clientType);
  const isForeign = application.clientType === 'Individual Accounts' && 
    application.details.nationality && 
    !['zimbabwe', 'zimbabwean'].includes(application.details.nationality.toLowerCase().trim());

  const isCorporate = !isPersonalOrIndividual;
  const needsMandate = application.clientType !== 'Individual Accounts' && application.clientType !== 'Minors';
  
  const form = useForm<OnboardingFormData>({ defaultValues: application.details });

  const handleUpdateApplication = (newData: Partial<Application>) => {
    setApplications(prev => prev.map(app => 
      app.id === application.id 
      ? { ...app, ...newData, lastUpdated: new Date().toISOString(), details: { ...app.details, ...form.getValues(), ...(newData.details || {}) } } 
      : app
    ));
    setApplication(prev => ({...prev, ...newData, details: { ...prev.details, ...(newData.details || {}) }}));
  };

  const handleStatusChange = (status: Application['status'], notes?: string) => {
    const isForwarding = status === 'Sent to Back Office';
    
    const newHistoryLog: HistoryLog = {
      action: status,
      user: user.name,
      timestamp: new Date().toISOString(),
      notes: notes,
    };
    
    const updateData: Partial<Application> = { 
        status: status, 
        history: [...application.history, newHistoryLog] 
    };

    if (isForwarding && application.submittedBy === 'Customer') {
        updateData.submittedBy = user.name;
    }
    
    handleUpdateApplication(updateData);

    toast({
        title: `Updated: ${status}`,
        description: `Update for ${application.clientName} is done.`,
    });

     if (['Archived', 'Rejected', 'Pending Supervisor', 'Sent to Supervisor', 'Pending Compliance', 'Returned to ATL', 'Returned to ASL', 'Approved', 'Sent to Back Office', 'Claimed by ASL', 'Rejected by ASL', 'Returned to Back Office', 'Sent to Risk & Compliance', 'Approved by Supervisor', 'Rejected by Supervisor', 'Approved by Compliance', 'Pending Executive Signature'].includes(status)) {
        setTimeout(() => onBack(), 500);
    }
  };

  const handleClaimLead = () => {
    handleUpdateApplication({ 
        status: 'Claimed by ASL', 
        submittedBy: user.name,
        history: [...application.history, { action: 'Submission Claimed', user: user.name, timestamp: new Date().toISOString() }] 
    });
    toast({ title: "Taken", description: `You now own ${application.clientName}.` });
    setTimeout(() => onBack(), 500);
  };

  const handleRejectLead = () => {
    handleUpdateApplication({ 
        status: 'Rejected by ASL', 
        submittedBy: 'Customer', // Return to public pool
        history: [...application.history, { action: 'Submission Rejected', user: user.name, timestamp: new Date().toISOString() }] 
    });
    toast({ title: "Rejected", description: "Record sent back to pool." });
    setTimeout(() => onBack(), 500);
  };

  const handleForwardToSupervisor = () => {
    if (!fcbReport) {
        toast({ variant: 'destructive', title: 'FCB Report Required', description: 'Please attach the FCB Report before forwarding.' });
        return;
    }

    const currentDocs = application.documents.filter(d => d.type === 'FCB Report');
    const updatedDocs = [...currentDocs, fcbReport];

    handleUpdateApplication({
        status: 'Sent to Supervisor',
        fcbStatus: selectedFcbStatus,
        documents: updatedDocs,
        history: [...application.history, { 
            action: 'Sent to Supervisor', 
            user: user.name, 
            timestamp: new Date().toISOString(),
            notes: `FCB Status: ${selectedFcbStatus}. Report attached.`
        }]
    });

    toast({ title: "Forwarded", description: "Application sent to Supervisor." });
    setTimeout(() => onBack(), 500);
  };

  const handleFcbFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const url = event.target?.result as string;
        setFcbReport({
            type: 'FCB Report',
            fileName: file.name,
            url: url
        });
        toast({ title: "Report Attached", description: `${file.name} is ready.` });
    };
    reader.readAsDataURL(file);
  };

  const handleReturnToAsl = () => {
    if (!returnComment.trim()) {
        toast({ variant: 'destructive', title: 'Note Needed', description: 'Please say why.' });
        return;
    }
    handleStatusChange('Returned to ASL', returnComment);
    setIsReturning(false);
  };

  const handleReturnToBO = () => {
    if (!returnToBOComment.trim()) {
        toast({ variant: 'destructive', title: 'Note Needed', description: 'Please say why.' });
        return;
    }
    handleStatusChange('Returned to Back Office', returnToBOComment);
    setIsReturningToBO(false);
  };

  const handleDispatchAccount = () => {
    if (dispatchBrAccountNumber.length < 5 || dispatchWalletAccountNumber.length < 5) {
        toast({
            variant: 'destructive',
            title: 'Invalid Account Numbers',
            description: 'Please enter both BR and Wallet account numbers.'
        });
        return;
    }

    const timestamp = new Date().toISOString();
    handleUpdateApplication({
        status: 'Archived',
        details: {
            ...application.details,
            brAccountNumber: dispatchBrAccountNumber,
            walletAccountNumber: dispatchWalletAccountNumber,
            isDispatched: true,
            accountOpeningDate: timestamp
        },
        history: [
            ...application.history,
            { 
                action: 'Accounts Dispatched', 
                user: user.name, 
                timestamp,
                notes: `BR: ${dispatchBrAccountNumber} | Wallet: ${dispatchWalletAccountNumber}. Record Archived.`
            }
        ]
    });

    toast({
        title: "Accounts Finalized",
        description: `Dispatch complete for ${application.clientName}.`
    });
    setIsDispatching(false);
    setTimeout(() => onBack(), 500);
  };

  // Tiered Approval Logic: Supervisor First sign
  const handleSupervisorApproval = (signature: string) => {
    if (!activationCode) {
        toast({ variant: 'destructive', title: 'Code Needed', description: 'Please enter the code.' });
        return;
    }
    if (!brIdentity) {
        toast({ variant: 'destructive', title: 'Client ID Needed', description: 'Please enter the BR Client ID.' });
        return;
    }
    const timestamp = new Date().toISOString();
    const notes = `Audit OK. Supervisor signed as First Approver. BR Client ID: ${brIdentity}. Forwarded for Executive sign-off.`;
    handleUpdateApplication({ 
        status: 'Pending Executive Signature', 
        details: { 
            ...application.details, 
            activationCode, 
            brIdentity,
            supervisorSignature: signature,
            supervisorSignatureTimestamp: timestamp
        },
        history: [...application.history, { action: 'Supervisor Signed & Forwarded', user: user.name, timestamp, notes }] 
    });
    toast({ title: "First Sign-off Complete", description: "Agreement record sent to Management." });
    setIsSupervisorSigning(false);
    setTimeout(() => onBack(), 500);
  };

  // Tiered Approval Logic: Management Final sign
  const handleExecutiveApproval = (signature: string) => {
    const timestamp = new Date().toISOString();
    const notes = `Executive Final Sign-off complete. Application ready for final dispatch.`;
    handleUpdateApplication({ 
        status: 'Approved', 
        details: { 
            ...application.details, 
            executiveSignature: signature,
            executiveSignatureTimestamp: timestamp
        },
        history: [...application.history, { action: 'Final Management Sign-off', user: user.name, timestamp, notes }] 
    });
    toast({ title: "Final Management Sign-off", description: "Executive signature applied. Back Office can now dispatch accounts." });
    setIsExecutiveSigning(false);
    setTimeout(() => onBack(), 500);
  };

  const handleRejection = () => {
    if (!rejectionReason || !rejectionComment) {
        toast({ variant: 'destructive', title: 'Reason Needed', description: 'Provide a reason.' });
        return;
    }
    const status = user.role === 'supervisor' ? 'Rejected by Supervisor' : 'Rejected';
    handleStatusChange(status, `Reason: ${rejectionReason} - ${rejectionComment}`);
    setIsRejecting(false);
  };

  const handleAddComment = () => {
    if (newComment.trim() === '') return;
    const newCommentObject: Comment = { id: `c${Date.now()}`, user: user.name, role: user.role as any, timestamp: new Date().toISOString(), content: newComment.trim() };
    handleUpdateApplication({ comments: [...application.comments, newCommentObject] });
    setNewComment('');
  };

  const handleDelete = () => {
    setApplications(prev => prev.filter(app => app.id !== application.id));
    toast({
        title: "Deleted",
        description: `${application.clientName} has been removed.`,
    });
    setIsDeletingConfirmOpen(false);
    onBack();
  };

  const handleDownloadPdf = async () => {
    const summaryElement = printRef.current;
    if (!summaryElement) return;
    setIsPrinting(true);
    
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    let isFirstPage = true;

    const addCanvasToPdf = async (element: HTMLElement) => {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        
        if (!isFirstPage) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
        isFirstPage = false;
    };
    
    // Mandate Page First for non-individuals
    if (resolutionRef.current && needsMandate) await addCanvasToPdf(resolutionRef.current);
    
    if (isCorporate && checklistRef.current) await addCanvasToPdf(checklistRef.current);
    if (isCorporate && agencyAgreementRef.current) await addCanvasToPdf(agencyAgreementRef.current);
    if (isCorporate && adlaRef.current) await addCanvasToPdf(adlaRef.current);
    await addCanvasToPdf(summaryElement);

    pdf.save(`Onboarding-${application.clientName.replace(/\s+/g, '_')}.pdf`);
    setIsPrinting(false);
  };

  const handleGeminiVerification = async () => {
    if (application.documents.length < 2) {
        toast({
            variant: 'destructive',
            title: 'Documents Needed',
            description: 'AI check needs at least two documents.'
        });
        return;
    }

    setIsAiProcessing(true);
    try {
        const result = await extractAndValidateData({
            document1DataUri: application.documents[0].url,
            document1Type: application.documents[0].type,
            document2DataUri: application.documents[1].url,
            document2Type: application.documents[1].type,
            formDataFields: application.details as any,
        });

        if (result) {
            handleUpdateApplication({
                fcbStatus: result.fcbStatus as any,
                comments: [
                    ...application.comments,
                    {
                        id: `ai-${Date.now()}`,
                        user: 'Gemini AI',
                        role: 'compliance',
                        timestamp: new Date().toISOString(),
                        content: `AI Check OK. Result: ${result.fcbStatus}. Note: ${result.validationResult}`
                    }
                ]
            });
            toast({
                title: 'AI Check OK',
                description: `Status: ${result.fcbStatus}.`,
            });
        }
    } catch (error) {
        console.error('AI Error:', error);
        toast({
            variant: 'destructive',
            title: 'AI Error',
            description: 'AI failed to check documents.'
        });
    } finally {
        setIsAiProcessing(false);
    }
  };

  const renderActions = () => {
    switch (user.role) {
      case 'asl':
        const isSubmission = application.submittedBy === 'Customer';
        
        if (isSubmission) {
            return (
                <div className="flex gap-2">
                    <Button onClick={handleClaimLead} className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-all active:scale-95">
                        <UserCheck className="mr-2 h-4 w-4" /> Claim
                    </Button>
                    <Button onClick={handleRejectLead} variant="destructive" className="font-bold shadow-md transition-all active:scale-95">
                        <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button onClick={() => handleStatusChange('Sent to Back Office')} className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md transition-all active:scale-95">
                        <Send className="mr-2 h-4 w-4" /> Send to Office
                    </Button>
                </div>
            );
        }

        if (application.status === 'Submitted' || application.status === 'Returned to ATL' || application.status === 'Returned to ASL' || application.status === 'Claimed by ASL') {
            return (
                <Button onClick={() => handleStatusChange('Sent to Back Office')} className="bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg px-8 transition-all active:scale-95">
                    <Send className="mr-2 h-4 w-4" /> Send to Office
                </Button>
            );
        }
        return null;
      case 'back-office':
        if (application.status === 'Approved' || application.status === 'Approved by Supervisor') {
            return <Button onClick={() => setIsDispatching(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg px-8 transition-all active:scale-95"><Send className="mr-2 h-4 w-4" /> Dispatch Accounts</Button>;
        }
        if (application.status === 'Submitted' || application.status === 'Returned to ATL' || application.status === 'Returned to ASL' || application.status === 'Sent to Back Office' || application.status === 'Claimed by ASL' || application.status === 'Returned to Back Office') {
            return (
                <div className="flex gap-3">
                    <Button 
                        variant="outline" 
                        className="border-amber-500 text-amber-600 hover:bg-amber-50 font-bold shadow-sm transition-all active:scale-95"
                        onClick={() => setIsReturning(true)}
                    >
                        <CornerUpLeft className="mr-2 h-4 w-4" /> Send Back
                    </Button>
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md transition-all active:scale-95 px-6" 
                        onClick={handleForwardToSupervisor}
                    >
                        <ShieldCheck className="mr-2 h-4 w-4" /> Send to Supervisor
                    </Button>
                </div>
            );
        }
        return null;
      case 'supervisor':
        if (application.status === 'Pending Supervisor' || application.status === 'Sent to Supervisor' || application.status === 'Approved by Compliance') {
            return (
                <div className="flex flex-wrap gap-3">
                    <Button 
                        variant="outline" 
                        onClick={() => setIsReturningToBO(true)} 
                        className="border-amber-500 text-amber-600 hover:bg-amber-50 font-bold shadow-sm transition-all active:scale-95"
                    >
                        <CornerUpLeft className="mr-2 h-4 w-4" /> Send to Office
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => handleStatusChange('Sent to Risk & Compliance')} 
                        className="border-primary/20 text-primary hover:bg-primary/5 font-bold shadow-sm transition-all active:scale-95"
                    >
                        <ShieldAlert className="mr-2 h-4 w-4" /> Send to Risk
                    </Button>
                    <Button variant="destructive" className="font-bold shadow-md transition-all active:scale-95" onClick={() => setIsRejecting(true)}>
                        <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white font-black shadow-lg px-8 transition-all active:scale-95" 
                        onClick={() => {
                            if (!activationCode || !brIdentity) {
                                toast({ variant: 'destructive', title: 'Data Missing', description: 'Please enter BR ID and Code before signing.' });
                                return;
                            }
                            setIsSupervisorSigning(true);
                        }}
                    >
                        <FileSignature className="mr-2 h-4 w-4" /> AUDIT & FORWARD TO MGMT
                    </Button>
                </div>
            );
        }
        return null;
      case 'management':
        if (application.status === 'Pending Executive Signature') {
            return (
                <div className="flex gap-3">
                    <Button variant="destructive" className="font-bold shadow-md transition-all active:scale-95" onClick={() => setIsRejecting(true)}>
                        <X className="mr-2 h-4 w-4" /> Decline
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg px-8 transition-all active:scale-95" onClick={() => setIsExecutiveSigning(true)}>
                        <FileSignature className="mr-2 h-4 w-4" /> FINAL APPROVE & SIGN
                    </Button>
                </div>
            );
        }
        return null;
      case 'compliance':
        if (application.status === 'Pending Compliance' || application.status === 'Sent to Risk & Compliance') {
            return (
                <div className="flex gap-3">
                    <Button variant="destructive" className="font-bold shadow-md transition-all active:scale-95" onClick={() => setIsRejecting(true)}>
                        <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-black shadow-lg px-8 transition-all active:scale-95" onClick={() => handleStatusChange('Approved by Compliance')}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                    </Button>
                </div>
            );
        }
        return null;
      default: return null;
    }
  };
  
  const applicationForPrint = { ...application, details: { ...application.details, ...form.getValues() }};
  const canDelete = user.role === 'asl' || user.role === 'back-office';

  const renderAgreementAuditStatus = (title: string, method: 'digital' | 'physical', isSigned: boolean, pagesCount: number) => (
    <div className="flex items-center justify-between p-4 border rounded-xl bg-background shadow-sm">
        <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{title}</p>
            <p className="text-xs font-bold text-primary uppercase">{method} PROCESSING</p>
        </div>
        {method === 'digital' ? (
            isSigned ? <Badge variant="success" className="font-black">SIGNED</Badge> : <Badge variant="destructive">MISSING</Badge>
        ) : (
            pagesCount > 0 ? <Badge variant="success" className="font-black">{pagesCount} PAGES CAPTURED</Badge> : <Badge variant="destructive">NO PAGES</Badge>
        )}
    </div>
  );

  return (
    <FormProvider {...form}>
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <Button variant="ghost" onClick={onBack} className="hover:bg-muted text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
              <div className="flex items-center gap-3 w-full md:w-auto">
                  {canDelete && !application.details.isDispatched && (
                      <Button variant="destructive" onClick={() => setIsDeletingConfirmOpen(true)} className="font-bold shadow-md transition-all active:scale-95">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                  )}
                  <Button variant="outline" onClick={handleDownloadPdf} disabled={isPrinting} className="font-bold border-primary/20 hover:bg-primary/5"><Download className="mr-2 h-4 w-4" />{isPrinting ? 'Saving...' : 'Export'}</Button>
                  {renderActions()}
              </div>
          </div>

          <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
            <div ref={printRef}><ApplicationPrintView application={applicationForPrint} /></div>
            {needsMandate && <div ref={resolutionRef}><AccountResolutionPrintView application={applicationForPrint} /></div>}
            {isCorporate && (
                <>
                    <div ref={checklistRef}><CorporateChecklist application={applicationForPrint} /></div>
                    <div ref={agencyAgreementRef}><AgencyAgreementPrintView data={applicationForPrint.details} /></div>
                    <div ref={adlaRef}><AdlaDeclarationPrintView data={applicationForPrint.details} /></div>
                </>
            )}
          </div>
          
        <Card className="border-primary/10 shadow-2xl overflow-hidden backdrop-blur-sm bg-card/95">
          <div className="bg-primary h-1.5 w-full" />
          <CardHeader className="pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-muted text-[10px] font-mono tracking-tighter uppercase">{application.id}</Badge>
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">{application.clientType}</Badge>
                  </div>
                  <CardTitle className="text-3xl font-black uppercase tracking-tight text-foreground">Review: {application.clientName}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3" /> Region: <strong className="text-foreground">{application.region}</strong>
                  </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className="font-black px-4 py-1.5 uppercase tracking-widest text-xs shadow-sm bg-foreground text-background">
                    {application.status.replace(/-/g, ' ')}
                </Badge>
                {application.details.isDispatched && (
                    <Badge variant="success" className="font-black animate-bounce shadow-md border-green-200">
                        <CheckCircle2 className="mr-1.5 h-3 w-3" /> SENT
                    </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
              {/* Back Office Compliance Section */}
              {user.role === 'back-office' && (application.status === 'Submitted' || application.status === 'Sent to Back Office' || application.status === 'Returned to Back Office' || application.status === 'Claimed by ASL') && (
                  <div className="mb-8 p-6 bg-slate-900/50 rounded-2xl border border-white/10 animate-in zoom-in-95 shadow-inner">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                          <h4 className="text-xs font-black uppercase text-secondary tracking-widest flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full shadow-sm">
                              <ShieldCheck className="h-4 w-4" /> Compliance Check: FCB Report
                          </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider ml-1">FCB Status</Label>
                              <Select value={selectedFcbStatus} onValueChange={(v: FcbStatus) => setSelectedFcbStatus(v)}>
                                  <SelectTrigger className="h-12 bg-background border-white/10 focus:ring-secondary text-lg font-bold">
                                      <SelectValue placeholder="Set FCB Status..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {fcbStatusOptions.map(status => (
                                          <SelectItem key={status} value={status} className="font-bold py-3">{status}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                              <p className="text-[10px] text-muted-foreground italic flex items-center gap-1.5 ml-1 mt-1.5">
                                <Info className="h-3 w-3" /> Select the risk status from the FCB bureau.
                              </p>
                          </div>
                          <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider ml-1">FCB Report Attachment</Label>
                              <div className="flex gap-2">
                                  <input type="file" ref={fileInputRef} onChange={handleFcbFileUpload} className="hidden" accept="application/pdf,image/*" />
                                  <Button 
                                      variant="outline" 
                                      className="flex-1 h-12 font-black uppercase tracking-widest border-white/10 hover:bg-secondary/10"
                                      onClick={() => fileInputRef.current?.click()}
                                  >
                                      <Upload className="mr-2 h-4 w-4 text-secondary" /> {fcbReport ? 'Replace Report' : 'Attach Report'}
                                  </Button>
                                  {fcbReport && (
                                      <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-12 w-12 border border-white/5"
                                          onClick={() => setPreviewDoc(fcbReport)}
                                      >
                                          <Eye className="h-5 w-5" />
                                      </Button>
                                  )}
                              </div>
                              {fcbReport && (
                                  <div className="flex items-center gap-2 px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg animate-in fade-in slide-in-from-top-1">
                                      <FileSearch className="h-4 w-4 text-secondary" />
                                      <span className="text-xs font-mono font-bold text-secondary truncate max-w-[200px]">{fcbReport.fileName}</span>
                                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto" />
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              )}

              {/* Supervisor Identity Check Section */}
              {user.role === 'supervisor' && (application.status === 'Pending Supervisor' || application.status === 'Sent to Supervisor' || application.status === 'Approved by Compliance') && (
                  <div className="mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/20 animate-in zoom-in-95 shadow-inner">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                          <h4 className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
                              <Fingerprint className="h-4 w-4" /> Supervisor Action: ID Registry
                          </h4>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-white border-primary/20 text-primary font-black hover:bg-primary/5 transition-all shadow-md active:scale-95 h-10 px-6"
                            onClick={handleGeminiVerification}
                            disabled={isAiProcessing || application.documents.length < 2}
                          >
                            {isAiProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-primary fill-primary/20" />}
                            {isAiProcessing ? 'Checking...' : 'AI Check'}
                          </Button>
                      </div>
                      <div className="max-w-md space-y-6">
                          <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider ml-1">BR Client ID</Label>
                              <Input 
                                  placeholder="Enter the BR ID code..." 
                                  value={brIdentity} 
                                  onChange={(e) => setBrIdentity(e.target.value)}
                                  className="bg-background font-mono h-12 text-lg focus:ring-primary border-primary/20 shadow-sm"
                              />
                              <p className="text-[10px] text-muted-foreground italic flex items-center gap-1.5 ml-1 mt-1.5">
                                <Info className="h-3 w-3" /> This ID is mandatory for the core registry.
                              </p>
                          </div>
                          <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider ml-1">Activation Code</Label>
                              <Input 
                                  placeholder="Type the security code..." 
                                  value={activationCode} 
                                  onChange={(e) => setActivationCode(e.target.value)}
                                  className="bg-background font-mono h-12 text-lg focus:ring-primary border-primary/20 shadow-sm"
                              />
                          </div>
                      </div>
                  </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-muted/50 p-1.5 mb-8 rounded-xl w-full sm:w-auto overflow-x-auto">
                      <TabsTrigger value="form-data" className="px-6 rounded-lg data-[state=active]:shadow-md"><FileEdit className="mr-2 h-4 w-4"/>Profile</TabsTrigger>
                      <TabsTrigger value="documents" className="px-6 rounded-lg data-[state=active]:shadow-md"><FileText className="mr-2 h-4 w-4"/>Documents</TabsTrigger>
                      <TabsTrigger value="comments" className="px-6 rounded-lg data-[state=active]:shadow-md font-black"><Wallet className="mr-2 h-4 w-4"/>WALLET INFO</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="form-data" className="pt-2 animate-in fade-in-50 duration-300">
                      <Card className="border-none shadow-none bg-transparent">
                          <CardContent className="p-0 space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-muted/20 rounded-2xl border border-primary/5">
                                  <DetailItem label="Account Type" value={application.clientType} />
                                  <DetailItem label="Region" value={application.region} />
                                  <DetailItem label="TIN Number" value={application.details.tinNumber} />
                                  <DetailItem label="Status" value={application.status.toUpperCase()} />
                              </div>
                              <Separator className="opacity-50" />
                              <div className="space-y-10">
                                {isPersonalOrIndividual ? <StepIndividualInfo disabled={isReadOnly} /> : <StepCorporateInfo disabled={isReadOnly} />}
                                
                                {isForeign && (
                                  <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                    <div className="flex items-center gap-2 text-primary mb-6">
                                      <Globe className="h-5 w-5" />
                                      <h4 className="text-sm font-black uppercase tracking-widest">Foreign Registry Data</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                      <DetailItem label="Passport Number" value={application.details.passportNumber} />
                                      <DetailItem label="Country of Origin" value={application.details.countryOfOrigin} />
                                      <DetailItem label="Visa/Permit Number" value={application.details.visaPermitNumber} />
                                      <DetailItem label="Permit Expiry" value={application.details.permitExpiryDate} />
                                    </div>
                                  </div>
                                )}

                                {needsMandate && (
                                    <div className="mt-8 bg-muted/10 p-6 rounded-2xl border border-white/10">
                                        <StepSignatories disabled={isReadOnly} />
                                    </div>
                                )}

                                {isCorporate && (
                                    <div className="rounded-xl border p-6 space-y-6 bg-primary/5">
                                        <h3 className="font-black uppercase tracking-widest text-xs text-primary flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4" />
                                            InnBucks Agreement Audit Status
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {renderAgreementAuditStatus(
                                                application.details.relationshipType === 'Agency' ? 'Agency Agreement' : 'Merchant Agreement',
                                                application.details.agreement1Method,
                                                !!application.details.agreement1Signature,
                                                application.details.agreement1Pages?.length || 0
                                            )}
                                            {application.details.relationshipType === 'Merchant' && renderAgreementAuditStatus(
                                                'Non-Disclosure Agreement (NDA)',
                                                application.details.agreement2Method,
                                                !!application.details.agreement2Signature,
                                                application.details.agreement2Pages?.length || 0
                                            )}
                                        </div>
                                    </div>
                                )}
                              </div>
                          </CardContent>
                      </Card>
                  </TabsContent>

                  <TabsContent value="documents" className="pt-2 animate-in fade-in-50 duration-300">
                    <div className="space-y-10">
                        {/* High-detail Gallery for ASL/Clerks to view all uploaded files */}
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="px-0">
                                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <Archive className="h-5 w-5 text-primary" />
                                    Document Repository
                                </CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest">
                                    Review all submitted identification and corporate records.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {application.documents.map((doc, i) => (
                                        <Card key={i} className="bg-muted/10 border-white/5 overflow-hidden group hover:border-primary/30 transition-all shadow-sm">
                                            <CardContent className="p-4 flex flex-col h-full">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <Badge variant="outline" className="text-[8px] font-black uppercase border-white/10">{doc.type}</Badge>
                                                </div>
                                                <div className="space-y-1 mb-6 flex-1">
                                                    <p className="text-sm font-black uppercase text-foreground leading-tight truncate" title={doc.type}>{doc.type}</p>
                                                    <p className="text-[10px] font-mono text-muted-foreground truncate uppercase">{doc.fileName}</p>
                                                </div>
                                                <Button 
                                                    className="w-full h-10 font-black uppercase tracking-widest text-[10px] border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
                                                    variant="outline"
                                                    onClick={() => setPreviewDoc(doc)}
                                                >
                                                    <Eye className="mr-2 h-3.5 w-3.5" />
                                                    Preview File
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                {application.documents.length === 0 && (
                                    <div className="p-20 text-center border-2 border-dashed rounded-3xl opacity-20 bg-muted/5">
                                        <Archive className="h-12 w-12 mx-auto mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No documents found in registry.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Management tools only visible in edit mode */}
                        {!isReadOnly && (
                            <div className="pt-10 border-t border-white/5">
                                <StepDocumentUpload disabled={isReadOnly} />
                            </div>
                        )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="comments" className="pt-2 animate-in fade-in-50 duration-300">
                      <Card className="border-none bg-transparent shadow-none">
                          <CardContent className="p-0 space-y-10">
                              {(application.status === 'Archived' && application.details.isDispatched) ? (
                                  <div className="p-8 bg-primary/10 rounded-2xl border border-primary/30 shadow-lg animate-in zoom-in-95 relative overflow-hidden">
                                      <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="h-32 w-32 -rotate-12" /></div>
                                      <div className="flex items-center gap-5 mb-8">
                                          <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg border-4 border-white/20">
                                              <CheckCircle2 className="h-7 w-7" />
                                          </div>
                                          <div>
                                              <h4 className="text-2xl font-black uppercase tracking-tight text-primary leading-none">Account Ready</h4>
                                              <p className="text-[10px] text-primary/70 font-black uppercase tracking-[0.2em] mt-2">Processed & Sent</p>
                                          </div>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                          <Card className="bg-background border-primary/20 shadow-md rounded-xl overflow-hidden">
                                              <CardContent className="p-6 flex items-center gap-5">
                                                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Fingerprint className="h-6 w-6" /></div>
                                                  <div>
                                                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">BR Account #</p>
                                                      <p className="text-2xl font-mono font-black text-foreground tracking-tighter">{application.details.brAccountNumber}</p>
                                                  </div>
                                              </CardContent>
                                          </Card>
                                          <Card className="bg-background border-primary/20 shadow-md rounded-xl overflow-hidden">
                                              <CardContent className="p-6 flex items-center gap-5">
                                                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Wallet className="h-6 w-6" /></div>
                                                  <div>
                                                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Wallet Account #</p>
                                                      <p className="text-2xl font-mono font-black text-foreground tracking-tighter">{application.details.walletAccountNumber}</p>
                                                  </div>
                                              </CardContent>
                                          </Card>
                                          <Card className="bg-background border-primary/20 shadow-md rounded-xl overflow-hidden">
                                              <CardContent className="p-6 flex items-center gap-5">
                                                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Hash className="h-6 w-6" /></div>
                                                  <div>
                                                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">BR Registry ID</p>
                                                      <p className="text-2xl font-mono font-black text-foreground tracking-tighter">{application.details.brIdentity}</p>
                                                  </div>
                                              </CardContent>
                                          </Card>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="p-12 border-dashed border-4 rounded-3xl flex flex-col items-center justify-center text-center bg-muted/5 group hover:bg-muted/10 transition-colors">
                                      <ShieldAlert className="h-16 w-16 text-muted-foreground opacity-20 mb-6 group-hover:scale-110 transition-transform" />
                                      <p className="text-lg font-black uppercase tracking-tight text-muted-foreground/60">Waiting for Dispatch</p>
                                      <p className="text-xs text-muted-foreground/40 uppercase tracking-[0.3em] mt-2 max-w-xs">Credentials will show here once finished.</p>
                                  </div>
                              )}

                              <div className="space-y-6 pt-10 border-t border-white/5">
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-primary" /> History
                                    </h4>
                                    <Badge variant="outline" className="text-[9px] font-bold uppercase opacity-50">{application.comments.length} Entries</Badge>
                                  </div>
                                  <div className="space-y-6">
                                      {application.comments.map((comment) => (
                                          <div key={comment.id} className="flex items-start gap-4 animate-in slide-in-from-left-2">
                                              <Avatar className="h-10 w-10 border-2 border-white/10 shadow-sm"><AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">{comment.user.substring(0,2)}</AvatarFallback></Avatar>
                                              <div className="flex-1 rounded-2xl border border-white/5 bg-muted/10 p-5 shadow-sm">
                                                  <div className="flex justify-between items-center mb-2">
                                                      <p className="font-black text-xs uppercase tracking-wider text-foreground/80">{comment.user} <span className="text-[9px] font-bold text-muted-foreground ml-2 px-2 py-0.5 bg-muted rounded-full">{comment.role.toUpperCase()}</span></p>
                                                      <p className="text-[10px] font-mono text-muted-foreground">{new Date(comment.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                                                  </div>
                                                  <p className="text-sm leading-relaxed text-foreground/70">{comment.content}</p>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                                  {application.status !== 'Archived' && (
                                      <div className="space-y-4 pt-8 border-t border-white/5 bg-muted/5 p-6 rounded-2xl">
                                          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">New Note</Label>
                                          <Textarea placeholder="Type internal note..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="min-h-[120px] bg-background text-base resize-none focus:ring-primary rounded-xl" />
                                          <Button onClick={handleAddComment} className="w-full font-black uppercase tracking-widest h-12 shadow-lg active:scale-95">Post Note</Button>
                                      </div>
                                  )}
                              </div>
                          </CardContent>
                      </Card>
                  </TabsContent>
              </Tabs>
          </CardContent>
        </Card>

        {/* Action Dialogs */}
        <AlertDialog open={isRejecting} onOpenChange={setIsRejecting}>
            <AlertDialogContent className="rounded-2xl border-destructive/20 shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-destructive">
                        <ShieldAlert className="h-6 w-6" /> Reject
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base">Select a reason for rejection.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-6 py-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Reason</Label>
                        <Select onValueChange={setRejectionReason} value={rejectionReason}>
                            <SelectTrigger className="h-12 border-destructive/20 focus:ring-destructive"><SelectValue placeholder="Select reason..." /></SelectTrigger>
                            <SelectContent className="rounded-xl">{rejectionReasons.map(reason => (<SelectItem key={reason} value={reason} className="font-bold py-3">{reason}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Note</Label>
                        <Textarea placeholder="Type details..." value={rejectionComment} onChange={(e) => setRejectionComment(e.target.value)} className="min-h-[150px] rounded-xl focus:ring-destructive" />
                    </div>
                </div>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel className="h-12 rounded-xl font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRejection} className="h-12 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-black px-8" disabled={!rejectionReason || !rejectionComment}>Reject</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isReturning} onOpenChange={setIsReturning}>
            <AlertDialogContent className="rounded-2xl border-amber-200 shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-amber-600">
                        <CornerUpLeft className="h-6 w-6" /> Send Back
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base">Say why you are sending it back.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Instructions</Label>
                        <Textarea 
                            placeholder="What needs to be fixed?" 
                            value={returnComment} 
                            onChange={(e) => setReturnComment(e.target.value)} 
                            className="min-h-[150px] rounded-xl border-amber-200 focus:ring-amber-500 text-base"
                        />
                    </div>
                </div>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel onClick={() => { setIsReturning(false); setReturnComment(''); }} className="h-12 rounded-xl font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleReturnToAsl} 
                        className="h-12 rounded-xl bg-amber-600 text-white hover:bg-amber-700 font-black px-8" 
                        disabled={!returnComment.trim()}
                    >
                        Send Back
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isReturningToBO} onOpenChange={setIsReturningToBO}>
            <AlertDialogContent className="rounded-2xl border-amber-200 shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-amber-600">
                        <CornerUpLeft className="h-6 w-6" /> Send to Office
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base">Say what needs to be fixed.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Instructions</Label>
                        <Textarea 
                            placeholder="What needs to be fixed?" 
                            value={returnToBOComment} 
                            onChange={(e) => setReturnToBOComment(e.target.value)} 
                            className="min-h-[150px] rounded-xl border-amber-200 focus:ring-amber-500 text-base"
                        />
                    </div>
                </div>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel onClick={() => { setIsReturningToBO(false); setReturnToBOComment(''); }} className="h-12 rounded-xl font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleReturnToBO} 
                        className="h-12 rounded-xl bg-amber-600 text-white hover:bg-amber-700 font-black px-8" 
                        disabled={!returnToBOComment.trim()}
                    >
                        Send to Office
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isDeletingConfirmOpen} onOpenChange={setIsDeletingConfirmOpen}>
            <AlertDialogContent className="rounded-2xl border-destructive/20 shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-destructive">
                        <Trash2 className="h-6 w-6" /> Delete Application
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base">
                        Are you sure you want to permanently delete the application for <strong>{application.clientName}</strong>? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel className="h-12 rounded-xl font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="h-12 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-black px-8">Delete Permanently</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-primary/5 p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><FileText className="h-5 w-5" /></div>
                        <div>
                            <DialogTitle className="text-xs uppercase font-black tracking-[0.2em] text-primary">{previewDoc?.type}</DialogTitle>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase">{previewDoc?.fileName}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setPreviewDoc(null)} className="rounded-full hover:bg-white/10"><X className="h-5 w-5" /></Button>
                </div>
                <div className="flex-1 bg-black/90 relative flex items-center justify-center overflow-hidden">
                    {previewDoc?.url && previewDoc.url !== '#' ? (
                        previewDoc.url.includes('application/pdf') || previewDoc.fileName.toLowerCase().endsWith('.pdf') ? (
                            <iframe src={previewDoc.url} className="w-full h-full border-none" title="Doc" />
                        ) : <img src={previewDoc.url} alt="Document" className="max-w-full max-h-full object-contain animate-in zoom-in-95" />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-white/30 text-center max-w-xs animate-pulse">
                            <ShieldQuestion className="h-16 w-16 opacity-20" />
                            <p className="text-sm font-black uppercase tracking-widest leading-relaxed">Document data missing.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>

        <Dialog open={isDispatching} onOpenChange={setIsDispatching}>
            <DialogContent className="bg-card border-primary/20 rounded-2xl shadow-2xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-primary">
                        <Send className="h-6 w-6" /> Dual-Account Dispatch
                    </DialogTitle>
                    <CardDescription className="text-base mt-2">Assign the permanent identifiers for this agent.</CardDescription>
                </DialogHeader>
                <div className="py-8 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">BR Account Number</Label>
                        <Input 
                            placeholder="e.g. BR-1002345"
                            value={dispatchBrAccountNumber}
                            onChange={(e) => setDispatchBrAccountNumber(e.target.value)}
                            className="h-12 font-mono text-center font-black rounded-xl border-primary/30 focus:ring-primary shadow-inner"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Wallet Account Number</Label>
                        <Input 
                            placeholder="e.g. WL-9988776"
                            value={dispatchWalletAccountNumber}
                            onChange={(e) => setDispatchWalletAccountNumber(e.target.value)}
                            className="h-12 font-mono text-center font-black rounded-xl border-primary/30 focus:ring-primary shadow-inner"
                        />
                    </div>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary leading-relaxed flex items-start gap-3">
                        <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Regulatory Note: This action is permanent and will lock the record for all origination staff.</span>
                    </div>
                </div>
                <DialogFooter className="gap-3 sm:flex-col sm:gap-3">
                    <Button onClick={handleDispatchAccount} className="w-full h-12 text-lg font-black uppercase tracking-widest shadow-lg bg-primary text-primary-foreground hover:scale-[1.02] transition-transform">COMPLETE DISPATCH</Button>
                    <Button variant="ghost" onClick={() => setIsDispatching(false)} className="w-full h-10 font-bold text-muted-foreground hover:bg-muted">Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Tiered Signature Dialogs */}
        <InternalSignatureDialog 
            isOpen={isSupervisorSigning}
            onClose={() => setIsSupervisorSigning(false)}
            onSign={handleSupervisorApproval}
            title="First Sign-off (Supervisor)"
            description="As the Supervisor, you are auditing the agreements and providing the first level of internal approval."
        />

        <InternalSignatureDialog 
            isOpen={isExecutiveSigning}
            onClose={() => setIsExecutiveSigning(false)}
            onSign={handleExecutiveApproval}
            title="Final Management Sign-off"
            description="You are providing the final Bank approval for this agency relationship. The record will be ready for account dispatch."
        />
      </div>
    </FormProvider>
  );
}
