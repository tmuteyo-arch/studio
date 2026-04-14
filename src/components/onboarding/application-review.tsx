'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Application, applicationsAtom, Comment, HistoryLog, OnboardingFormData, Document as AppDocument, FcbStatus, ApplicationStatus } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Archive, ArrowLeft, Check, FileText, User, X, MessageSquare, Download, CornerUpLeft, CheckCircle2, AlertCircle, Loader2, Wand2, FileEdit, FileSignature, Eraser, UserCheck, Eye, ShieldCheck, ShieldAlert, Upload, ShieldQuestion, Send, Key, Fingerprint, Wallet, MapPin, Sparkles, Globe, Trash2, Info, FileSearch, Hash } from 'lucide-react';
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
import { isValidTransition, getStateLabel } from '@/lib/state-machine';

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
  const [isProcessingAction, setIsProcessingAction] = React.useState(false);
  
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

  const isReadOnly = ['Locked', 'Dispatched'].includes(application.status);

  const isPersonalOrIndividual = ['Individual Accounts', 'Minors', 'Sole Trader'].includes(application.clientType);
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

  const handleStatusChange = async (nextStatus: ApplicationStatus, notes?: string) => {
    if (!isValidTransition(application.status, nextStatus)) {
        toast({ variant: 'destructive', title: 'Invalid Transition', description: `Cannot move from ${application.status} to ${nextStatus}.` });
        return;
    }

    setIsProcessingAction(true);
    try {
        const newHistoryLog: HistoryLog = {
          action: nextStatus,
          user: user.name,
          timestamp: new Date().toISOString(),
          notes: notes,
        };
        
        const updateData: Partial<Application> = { 
            status: nextStatus, 
            history: [...application.history, newHistoryLog] 
        };

        handleUpdateApplication(updateData);
        toast({ title: `State Updated: ${getStateLabel(nextStatus)}`, description: `Update successful.` });

        if (['Locked', 'Rejected', 'Approved', 'Dispatched', 'Under Review'].includes(nextStatus)) {
            setTimeout(() => onBack(), 500);
        }
    } catch (err) {
        toast({ variant: 'destructive', title: 'Action Failed', description: 'Could not update application status.' });
    } finally {
        setIsProcessingAction(false);
    }
  };

  const handleFcbFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const url = event.target?.result as string;
        setFcbReport({ type: 'FCB Report', fileName: file.name, url: url, pageCount: 1 });
        toast({ title: "Report Attached", description: `${file.name} is ready.` });
    };
    reader.readAsDataURL(file);
  };

  const handleReturnToAsl = () => {
    if (!returnComment.trim()) {
        toast({ variant: 'destructive', title: 'Note Needed', description: 'Please provide instructions.' });
        return;
    }
    handleStatusChange('Pending Documents', returnComment);
    setIsReturning(false);
  };

  const handleDispatchAccount = async () => {
    if (dispatchBrAccountNumber.length < 5 || dispatchWalletAccountNumber.length < 5) {
        toast({ variant: 'destructive', title: 'Invalid Account Numbers', description: 'Please enter both BR and Wallet identifiers.' });
        return;
    }

    setIsProcessingAction(true);
    try {
        const timestamp = new Date().toISOString();
        handleUpdateApplication({
            status: 'Dispatched',
            details: {
                ...application.details,
                brAccountNumber: dispatchBrAccountNumber,
                walletAccountNumber: dispatchWalletAccountNumber,
                isDispatched: true,
                accountOpeningDate: timestamp
            },
            history: [
                ...application.history,
                { action: 'Dispatched', user: user.name, timestamp, notes: `BR: ${dispatchBrAccountNumber} | Wallet: ${dispatchWalletAccountNumber}.` }
            ]
        });

        toast({ title: "Accounts Dispatched", description: `Process complete for ${application.clientName}.` });
        setIsDispatching(false);
        setTimeout(() => onBack(), 500);
    } finally {
        setIsProcessingAction(false);
    }
  };

  const handleFinalLock = () => {
    handleStatusChange('Locked', 'Record moved to permanent regulatory vault.');
  };

  const handleSupervisorApproval = async (signature: string) => {
    if (!activationCode || !brIdentity) {
        toast({ variant: 'destructive', title: 'Data Missing', description: 'Enter BR ID and Code.' });
        return;
    }
    
    setIsProcessingAction(true);
    try {
        const timestamp = new Date().toISOString();
        const notes = `Audit OK. Supervisor signed. BR Client ID: ${brIdentity}.`;
        
        handleUpdateApplication({ 
            status: 'Approved', 
            details: { 
                ...application.details, 
                activationCode, 
                brIdentity,
                supervisorSignature: signature,
                supervisorSignatureTimestamp: timestamp
            },
            history: [...application.history, { action: 'Approved', user: user.name, timestamp, notes }] 
        });
        toast({ title: "Approved", description: "Record is ready for dispatch." });
        setIsSupervisorSigning(false);
        setTimeout(() => onBack(), 500);
    } finally {
        setIsProcessingAction(false);
    }
  };

  const handleRejection = () => {
    if (!rejectionReason || !rejectionComment) {
        toast({ variant: 'destructive', title: 'Reason Needed', description: 'Provide a reason.' });
        return;
    }
    handleStatusChange('Rejected', `Reason: ${rejectionReason} - ${rejectionComment}`);
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
    toast({ title: "Deleted", description: `${application.clientName} has been removed.` });
    setIsDeletingConfirmOpen(false);
    onBack();
  };

  const handleDownloadPdf = async () => {
    const summaryElement = printRef.current;
    if (!summaryElement) return;
    setIsPrinting(true);
    
    try {
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
        
        if (resolutionRef.current && needsMandate) await addCanvasToPdf(resolutionRef.current);
        if (isCorporate && checklistRef.current) await addCanvasToPdf(checklistRef.current);
        if (isCorporate && agencyAgreementRef.current) await addCanvasToPdf(agencyAgreementRef.current);
        if (isCorporate && adlaRef.current) await addCanvasToPdf(adlaRef.current);
        await addCanvasToPdf(summaryElement);

        pdf.save(`Onboarding-${application.clientName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
        toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not generate PDF.' });
    } finally {
        setIsPrinting(false);
    }
  };

  const handleGeminiVerification = async () => {
    if (application.documents.length < 2) {
        toast({ variant: 'destructive', title: 'Documents Needed', description: 'AI check needs at least two documents.' });
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
            toast({ title: 'AI Check OK', description: `Status: ${result.fcbStatus}.` });
        }
    } catch (error) {
        console.error('AI Error:', error);
        toast({ variant: 'destructive', title: 'AI Error', description: 'AI failed to check documents.' });
    } finally {
        setIsAiProcessing(false);
    }
  };

  const renderActions = () => {
    if (isProcessingAction) return <Button disabled className="font-black px-8"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> WORKING...</Button>;

    switch (user.role) {
      case 'asl':
        if (application.status === 'Draft') return <Button onClick={() => handleStatusChange('In Progress')} className="bg-primary font-black px-8">START PROCESSING</Button>;
        if (application.status === 'In Progress') return <Button onClick={() => handleStatusChange('Pending Documents')} className="bg-primary font-black px-8">FINALIZE CAPTURE</Button>;
        if (application.status === 'Pending Documents') return <Button onClick={() => handleStatusChange('Under Review')} className="bg-primary font-black px-8">SUBMIT FOR REVIEW</Button>;
        return null;
      case 'back-office':
        if (application.status === 'Under Review') {
            return (
                <div className="flex gap-3">
                    <Button variant="outline" className="border-amber-500 text-amber-600 font-bold" onClick={() => setIsReturning(true)}><CornerUpLeft className="mr-2 h-4 w-4" /> Send Back</Button>
                    <Button className="bg-primary font-black px-8" onClick={() => handleStatusChange('Approved')}>PRE-APPROVE</Button>
                </div>
            );
        }
        if (application.status === 'Approved') return <Button onClick={() => setIsDispatching(true)} className="bg-primary font-black px-8"><Send className="mr-2 h-4 w-4" /> DISPATCH ACCOUNTS</Button>;
        if (application.status === 'Dispatched') return <Button onClick={handleFinalLock} className="bg-foreground text-background font-black px-8"><ShieldCheck className="mr-2 h-4 w-4" /> LOCK RECORD</Button>;
        return null;
      case 'supervisor':
      case 'management':
      case 'compliance':
        if (application.status === 'Under Review') {
            return (
                <div className="flex gap-3">
                    <Button variant="destructive" className="font-bold" onClick={() => setIsRejecting(true)}><X className="mr-2 h-4 w-4" /> Reject</Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-black px-8" onClick={() => setIsSupervisorSigning(true)}><FileSignature className="mr-2 h-4 w-4" /> AUDIT & APPROVE</Button>
                </div>
            );
        }
        return null;
      default: return null;
    }
  };
  
  const applicationForPrint = { ...application, details: { ...application.details, ...form.getValues() }};
  const canDelete = !['Locked', 'Dispatched'].includes(application.status);

  return (
    <FormProvider {...form}>
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <Button variant="ghost" onClick={onBack} className="hover:bg-muted text-muted-foreground" disabled={isProcessingAction}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
              <div className="flex items-center gap-3 w-full md:w-auto">
                  {canDelete && (
                      <Button variant="destructive" onClick={() => setIsDeletingConfirmOpen(true)} className="font-bold shadow-md" disabled={isProcessingAction}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                  )}
                  <Button variant="outline" onClick={handleDownloadPdf} disabled={isPrinting || isProcessingAction} className="font-bold border-primary/20"><Download className="mr-2 h-4 w-4" />{isPrinting ? 'Saving...' : 'Export'}</Button>
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
                    <Badge variant="outline" className="bg-muted text-[10px] font-mono uppercase">{application.id}</Badge>
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">{application.clientType}</Badge>
                  </div>
                  <CardTitle className="text-3xl font-black uppercase tracking-tight text-foreground">Review: {application.clientName}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3" /> Region: <strong className="text-foreground">{application.region}</strong>
                  </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className="font-black px-4 py-1.5 uppercase tracking-widest text-xs shadow-sm bg-foreground text-background">
                    {getStateLabel(application.status)}
                </Badge>
                {application.details.isDispatched && (
                    <Badge variant="success" className="font-black shadow-md">
                        <CheckCircle2 className="mr-1.5 h-3 w-3" /> DISPATCHED
                    </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
              {user.role !== 'asl' && application.status === 'Under Review' && (
                  <div className="mb-8 p-6 bg-slate-900/50 rounded-2xl border border-white/10 animate-in zoom-in-95">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                          <h4 className="text-xs font-black uppercase text-secondary tracking-widest flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full shadow-sm">
                              <ShieldCheck className="h-4 w-4" /> Compliance Check: FCB Report
                          </h4>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-white text-primary font-black h-10 px-6"
                            onClick={handleGeminiVerification}
                            disabled={isAiProcessing || application.documents.length < 2 || isProcessingAction}
                          >
                            {isAiProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-primary" />}
                            AI Check
                          </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider ml-1">FCB Status</Label>
                              <Select value={selectedFcbStatus} onValueChange={(v: FcbStatus) => setSelectedFcbStatus(v)} disabled={isProcessingAction}>
                                  <SelectTrigger className="h-12 bg-background border-white/10 text-lg font-bold">
                                      <SelectValue placeholder="Set FCB Status..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {fcbStatusOptions.map(status => (
                                          <SelectItem key={status} value={status} className="font-bold py-3">{status}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider ml-1">FCB Report Attachment</Label>
                              <div className="flex gap-2">
                                  <input type="file" ref={fileInputRef} onChange={handleFcbFileUpload} className="hidden" accept="application/pdf,image/*" />
                                  <Button 
                                      variant="outline" 
                                      className="flex-1 h-12 font-black border-white/10"
                                      onClick={() => fileInputRef.current?.click()}
                                      disabled={isProcessingAction}
                                  >
                                      <Upload className="mr-2 h-4 w-4" /> {fcbReport ? 'Replace Report' : 'Attach Report'}
                                  </Button>
                                  {fcbReport && (
                                      <Button variant="ghost" size="icon" className="h-12 w-12 border border-white/5" onClick={() => setPreviewDoc(fcbReport)}>
                                          <Eye className="h-5 w-5" />
                                      </Button>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-muted/50 p-1.5 mb-8 rounded-xl w-full sm:w-auto overflow-x-auto">
                      <TabsTrigger value="form-data" className="px-6 rounded-lg">Profile</TabsTrigger>
                      <TabsTrigger value="documents" className="px-6 rounded-lg">Documents</TabsTrigger>
                      <TabsTrigger value="comments" className="px-6 rounded-lg font-black"><Wallet className="mr-2 h-4 w-4"/>DISPATCH INFO</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="form-data" className="pt-2 animate-in fade-in-50 duration-300">
                      <Card className="border-none shadow-none bg-transparent">
                          <CardContent className="p-0 space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-muted/20 rounded-2xl border border-primary/5">
                                  <DetailItem label="Account Type" value={application.clientType} />
                                  <DetailItem label="Region" value={application.region} />
                                  <DetailItem label="TIN Number" value={application.details.tinNumber} />
                                  <DetailItem label="Lifecycle State" value={getStateLabel(application.status)} />
                              </div>
                              <div className="space-y-10">
                                {isPersonalOrIndividual ? <StepIndividualInfo disabled={isReadOnly || isProcessingAction} /> : <StepCorporateInfo disabled={isReadOnly || isProcessingAction} />}
                                {needsMandate && <StepSignatories disabled={isReadOnly || isProcessingAction} />}
                              </div>
                          </CardContent>
                      </Card>
                  </TabsContent>

                  <TabsContent value="documents" className="pt-2 animate-in fade-in-50 duration-300">
                    <div className="space-y-10">
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="px-0">
                                <CardTitle className="text-xl font-black uppercase flex items-center gap-2">
                                    <Archive className="h-5 w-5 text-primary" />
                                    Document Repository
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {application.documents.map((doc, i) => (
                                        <Card key={i} className="bg-muted/10 border-white/5 overflow-hidden group hover:border-primary/30 transition-all shadow-sm">
                                            <CardContent className="p-4 flex flex-col h-full">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><FileText className="h-5 w-5" /></div>
                                                    <Badge variant="outline" className="text-[8px] font-black uppercase">{doc.type}</Badge>
                                                </div>
                                                <p className="text-sm font-black uppercase text-foreground leading-tight truncate mb-6">{doc.type}</p>
                                                <Button 
                                                    className="w-full h-10 font-black uppercase text-[10px]"
                                                    variant="outline"
                                                    onClick={() => setPreviewDoc(doc)}
                                                >
                                                    <Eye className="mr-2 h-3.5 w-3.5" /> Preview File
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        {!isReadOnly && <StepDocumentUpload disabled={isReadOnly || isProcessingAction} />}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="comments" className="pt-2 animate-in fade-in-50 duration-300">
                      <Card className="border-none bg-transparent shadow-none">
                          <CardContent className="p-0 space-y-10">
                              {application.details.isDispatched ? (
                                  <div className="p-8 bg-primary/10 rounded-2xl border border-primary/30 shadow-lg animate-in zoom-in-95 relative overflow-hidden">
                                      <div className="flex items-center gap-5 mb-8">
                                          <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg border-4 border-white/20">
                                              <CheckCircle2 className="h-7 w-7" />
                                          </div>
                                          <div>
                                              <h4 className="text-2xl font-black uppercase tracking-tight text-primary leading-none">Account Active</h4>
                                              <p className="text-[10px] text-primary/70 font-black uppercase mt-2">Dispatched to Core Systems</p>
                                          </div>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <Card className="bg-background border-primary/20 shadow-md">
                                              <CardContent className="p-6">
                                                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">BR Account #</p>
                                                  <p className="text-2xl font-mono font-black text-foreground">{application.details.brAccountNumber}</p>
                                              </CardContent>
                                          </Card>
                                          <Card className="bg-background border-primary/20 shadow-md">
                                              <CardContent className="p-6">
                                                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Wallet Account #</p>
                                                  <p className="text-2xl font-mono font-black text-foreground">{application.details.walletAccountNumber}</p>
                                              </CardContent>
                                          </Card>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="p-12 border-dashed border-4 rounded-3xl flex flex-col items-center justify-center text-center bg-muted/5">
                                      <ShieldAlert className="h-16 w-16 text-muted-foreground opacity-20 mb-6" />
                                      <p className="text-lg font-black uppercase text-muted-foreground/60">Awaiting Dispatch</p>
                                  </div>
                              )}

                              <div className="space-y-6 pt-10 border-t border-white/5">
                                  <h4 className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Lifecycle Audit</h4>
                                  <div className="space-y-6">
                                      {application.comments.map((comment) => (
                                          <div key={comment.id} className="flex items-start gap-4">
                                              <Avatar className="h-10 w-10 border-2 border-white/10"><AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">{comment.user.substring(0,2)}</AvatarFallback></Avatar>
                                              <div className="flex-1 rounded-2xl border border-white/5 bg-muted/10 p-5 shadow-sm">
                                                  <div className="flex justify-between items-center mb-2">
                                                      <p className="font-black text-xs uppercase text-foreground/80">{comment.user} <span className="text-[9px] font-bold text-muted-foreground ml-2 px-2 py-0.5 bg-muted rounded-full">{comment.role.toUpperCase()}</span></p>
                                                      <p className="text-[10px] font-mono text-muted-foreground">{new Date(comment.timestamp).toLocaleString()}</p>
                                                  </div>
                                                  <p className="text-sm leading-relaxed text-foreground/70">{comment.content}</p>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                                  {application.status !== 'Locked' && (
                                      <div className="space-y-4 pt-8 border-t border-white/5 bg-muted/5 p-6 rounded-2xl">
                                          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">New Audit Note</Label>
                                          <Textarea placeholder="Type internal note..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="min-h-[120px] rounded-xl" disabled={isProcessingAction} />
                                          <Button onClick={handleAddComment} className="w-full font-black uppercase tracking-widest h-12" disabled={isProcessingAction}>Post Note</Button>
                                      </div>
                                  )}
                              </div>
                          </CardContent>
                      </Card>
                  </TabsContent>
              </Tabs>
          </CardContent>
        </Card>

        <AlertDialog open={isRejecting} onOpenChange={setIsRejecting}>
            <AlertDialogContent className="rounded-2xl border-destructive/20 shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black uppercase flex items-center gap-2 text-destructive"><ShieldAlert className="h-6 w-6" /> Reject</AlertDialogTitle>
                    <AlertDialogDescription className="text-base">Select a reason for rejection.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-6 py-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Reason</Label>
                        <Select onValueChange={setRejectionReason} value={rejectionReason}>
                            <SelectTrigger className="h-12"><SelectValue placeholder="Select reason..." /></SelectTrigger>
                            <SelectContent className="rounded-xl">{rejectionReasons.map(reason => (<SelectItem key={reason} value={reason}>{reason}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Note</Label>
                        <Textarea placeholder="Type details..." value={rejectionComment} onChange={(e) => setRejectionComment(e.target.value)} className="min-h-[150px] rounded-xl" />
                    </div>
                </div>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel className="h-12 rounded-xl font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRejection} className="h-12 rounded-xl bg-destructive text-destructive-foreground font-black px-8" disabled={!rejectionReason || !rejectionComment || isProcessingAction}>Reject</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isReturning} onOpenChange={setIsReturning}>
            <AlertDialogContent className="rounded-2xl border-amber-200">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black uppercase flex items-center gap-2 text-amber-600"><CornerUpLeft className="h-6 w-6" /> Return for Corrections</AlertDialogTitle>
                    <AlertDialogDescription className="text-base">Provide instructions for the ASL.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Fix Instructions</Label>
                        <Textarea placeholder="What needs to be fixed?" value={returnComment} onChange={(e) => setReturnComment(e.target.value)} className="min-h-[150px] rounded-xl border-amber-200" />
                    </div>
                </div>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel onClick={() => { setIsReturning(false); setReturnComment(''); }} className="h-12 rounded-xl font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReturnToAsl} className="h-12 rounded-xl bg-amber-600 text-white font-black px-8" disabled={!returnComment.trim() || isProcessingAction}>Send Back</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-primary/5 p-6 border-b flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><FileText className="h-5 w-5" /></div>
                        <div>
                            <DialogTitle className="text-xs uppercase font-black tracking-[0.2em] text-primary">{previewDoc?.type}</DialogTitle>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase">{previewDoc?.fileName}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setPreviewDoc(null)} className="rounded-full"><X className="h-5 w-5" /></Button>
                </div>
                <div className="flex-1 bg-black/90 relative flex items-center justify-center overflow-hidden">
                    {previewDoc?.url && previewDoc.url !== '#' ? (
                        previewDoc.url.includes('application/pdf') || previewDoc.fileName.toLowerCase().endsWith('.pdf') ? (
                            <iframe src={previewDoc.url} className="w-full h-full border-none" title="Doc" />
                        ) : <img src={previewDoc.url} alt="Document" className="max-w-full max-h-full object-contain" />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-white/30 text-center max-w-xs">
                            <ShieldQuestion className="h-16 w-16 opacity-20" />
                            <p className="text-sm font-black uppercase tracking-widest">Document data missing.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>

        <Dialog open={isDispatching} onOpenChange={setIsDispatching}>
            <DialogContent className="bg-card border-primary/20 rounded-2xl shadow-2xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-primary"><Send className="h-6 w-6" /> Final Dispatch</DialogTitle>
                    <CardDescription className="text-base mt-2">Assign identifiers for this agent.</CardDescription>
                </DialogHeader>
                <div className="py-8 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">BR Account Number</Label>
                        <Input placeholder="e.g. BR-1002345" value={dispatchBrAccountNumber} onChange={(e) => setDispatchBrAccountNumber(e.target.value)} className="h-12 font-mono text-center font-black" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Wallet Account Number</Label>
                        <Input placeholder="e.g. WL-9988776" value={dispatchWalletAccountNumber} onChange={(e) => setDispatchWalletAccountNumber(e.target.value)} className="h-12 font-mono text-center font-black" />
                    </div>
                </div>
                <DialogFooter className="gap-3 sm:flex-col">
                    <Button onClick={handleDispatchAccount} className="w-full h-12 text-lg font-black uppercase bg-primary text-primary-foreground" disabled={isProcessingAction}>
                        {isProcessingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        DISPATCH ACCOUNTS
                    </Button>
                    <Button variant="ghost" onClick={() => setIsDispatching(false)} className="w-full h-10 font-bold" disabled={isProcessingAction}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <InternalSignatureDialog 
            isOpen={isSupervisorSigning}
            onClose={() => setIsSupervisorSigning(false)}
            onSign={handleSupervisorApproval}
            title="Supervisor Sign-off"
            description="Authorize this application for final regulatory dispatch."
        />
      </div>
    </FormProvider>
  );
}
