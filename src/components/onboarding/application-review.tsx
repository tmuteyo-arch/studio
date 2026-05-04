'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Application, applicationsAtom, Comment, HistoryLog, OnboardingFormData, Document as AppDocument, FcbStatus, ApplicationStatus, notificationsAtom, Notification } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Archive, ArrowLeft, Check, FileText, User, X, MessageSquare, Download, CornerUpLeft, CheckCircle2, AlertCircle, Loader2, FileEdit, FileSignature, Eraser, UserCheck, Eye, ShieldCheck, ShieldAlert, Upload, ShieldQuestion, Send, Key, Fingerprint, Wallet, MapPin, Globe, Trash2, Info, FileSearch, Hash, Gavel, ClipboardCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '../ui/textarea';
import ApplicationPrintView from './application-print-view';
import AgencyAgreementPrintView from './agency-agreement-print-view';
import AdlaDeclarationPrintView from './adla-declaration-print-view';
import { useToast } from '@/hooks/use-toast';
import { User as UserProfile } from '@/lib/users';
import { Label } from '../ui/label';
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
  const [, setNotifications] = useAtom(notificationsAtom);
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

  // Digital Signatures
  const [isSupervisorSigning, setIsSupervisorSigning] = React.useState(false);
  const [isExecutiveSigning, setIsExecutiveSigning] = React.useState(false);

  const isReadOnly = ['Locked', 'Dispatched'].includes(application.status);

  const isPersonalOrIndividual = ['Individual Accounts', 'Minors', 'Sole Trader'].includes(application.clientType);
  const isCorporate = !isPersonalOrIndividual;
  const needsMandate = application.clientType !== 'Individual Accounts' && application.clientType !== 'Minors';
  
  const form = useForm<OnboardingFormData>({ defaultValues: application.details });

  // Role-based document visibility
  const visibleDocuments = React.useMemo(() => {
    if (['back-office', 'supervisor', 'management', 'compliance'].includes(user.role)) {
        return application.documents;
    }
    return application.documents.filter(doc => doc.type !== 'FCB Report' && doc.type !== 'Internal Audit');
  }, [application.documents, user.role]);

  const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    setNotifications(prev => [{
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        isRead: false,
        ...notif
    }, ...prev]);
  };

  const handleUpdateApplication = (newData: Partial<Application>) => {
    const updatedApps = applications.map(app => 
      app.id === application.id 
      ? { 
          ...app, 
          ...newData, 
          lastUpdated: new Date().toISOString(), 
          details: { 
              ...app.details, 
              ...form.getValues(), 
              ...(newData.details || {}) 
          } 
        } 
      : app
    );
    setApplications(updatedApps);
    setApplication(prev => ({...prev, ...newData, details: { ...prev.details, ...(newData.details || {}) }}));
  };

  const handleStatusChange = async (nextStatus: ApplicationStatus, notes?: string) => {
    if (!isValidTransition(application.status, nextStatus)) {
        toast({ variant: 'destructive', title: 'Transition Blocked', description: `Workflow requires sequential approval.` });
        return;
    }

    setIsProcessingAction(true);
    try {
        const timestamp = new Date().toISOString();
        const newHistoryLog: HistoryLog = {
          action: nextStatus,
          user: user.name,
          timestamp,
          notes: notes,
        };
        
        handleUpdateApplication({ 
            status: nextStatus, 
            history: [...application.history, newHistoryLog] 
        });

        toast({ title: `Record State: ${getStateLabel(nextStatus)}` });
        
        if (['Locked', 'Rejected', 'Approved', 'Dispatched', 'Under Review', 'Pending Supervisor', 'Pending Executive Signature', 'Approved by Management'].includes(nextStatus)) {
            setTimeout(() => onBack(), 500);
        }
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
        const newDoc: AppDocument = { type: 'FCB Report', fileName: file.name, url: url, pageCount: 1 };
        setFcbReport(newDoc);
        
        // Add to permanent documents
        handleUpdateApplication({
            documents: [...application.documents.filter(d => d.type !== 'FCB Report'), newDoc],
            fcbStatus: selectedFcbStatus
        });

        toast({ title: "FCB Report Linked", description: "Audit trail updated." });
    };
    reader.readAsDataURL(file);
  };

  // Step actions as defined in tiered workflow
  const handleBackOfficeEscalate = () => {
    if (!fcbReport) {
        toast({ variant: 'destructive', title: 'FCB Required', description: 'Attach FCB report before escalating.' });
        return;
    }
    if (!brIdentity) {
        toast({ variant: 'destructive', title: 'Registry ID Needed', description: 'Assign an Application ID.' });
        return;
    }
    
    handleUpdateApplication({ 
        details: { ...application.details, brIdentity },
        fcbStatus: selectedFcbStatus
    });
    
    handleStatusChange('Pending Supervisor', 'BO Audit complete. FCB attached and Application ID assigned.');
  };

  const handleSupervisorReviewComplete = () => {
    handleStatusChange('Pending Executive Signature', 'Supervisor audit OK. Requesting Executive Agreement sign-off.');
  };

  const handleExecutiveSignOff = (signature: string) => {
    handleUpdateApplication({
        details: { 
            ...application.details, 
            executiveSignature: signature, 
            executiveSignatureTimestamp: new Date().toISOString() 
        }
    });
    handleStatusChange('Approved by Management', 'Executive Agreement Signed. Returning to Supervisor for final code.');
    setIsExecutiveSigning(false);
  };

  const handleSupervisorFinalApproval = () => {
    if (!activationCode) {
        toast({ variant: 'destructive', title: 'Activation Code Needed', description: 'Enter the Core Activation Code.' });
        return;
    }
    handleUpdateApplication({
        details: { ...application.details, activationCode }
    });
    handleStatusChange('Approved', 'Final Supervisor approval granted. Returning to BO for Dispatch.');
  };

  const handleDispatchAccount = async () => {
    if (dispatchBrAccountNumber.length < 5 || dispatchWalletAccountNumber.length < 5) {
        toast({ variant: 'destructive', title: 'Invalid Inputs', description: 'Enter both BR and Wallet identifiers.' });
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
                { action: 'Dispatched', user: user.name, timestamp, notes: `Final issuance complete.` }
            ]
        });
        toast({ title: "Process Complete" });
        setIsDispatching(false);
        setTimeout(() => onBack(), 500);
    } finally {
        setIsProcessingAction(false);
    }
  };

  const handleRejection = () => {
    if (!rejectionReason || !rejectionComment) {
        toast({ variant: 'destructive', title: 'Audit Note Needed', description: 'Reason for rejection must be logged.' });
        return;
    }
    handleStatusChange('Rejected', `Reason: ${rejectionReason} - ${rejectionComment}`);
    setIsRejecting(false);
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

        pdf.save(`Forensic-Audit-${application.id}.pdf`);
    } finally {
        setIsPrinting(false);
    }
  };

  const renderActions = () => {
    if (isProcessingAction) return <Button disabled className="font-black px-8"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> PROCESSING...</Button>;

    switch (user.role) {
      case 'asl':
        if (application.status === 'Draft') return <Button onClick={() => handleStatusChange('In Progress')} className="bg-primary font-black px-8">START</Button>;
        if (application.status === 'In Progress') return <Button onClick={() => handleStatusChange('Pending Documents')} className="bg-primary font-black px-8">NEXT</Button>;
        if (application.status === 'Pending Documents') return <Button onClick={() => handleStatusChange('Under Review')} className="bg-primary font-black px-8">SUBMIT FOR REVIEW</Button>;
        return null;
        
      case 'back-office':
        if (application.status === 'Under Review') {
            return (
                <div className="flex gap-3">
                    <Button variant="outline" className="text-amber-500 font-bold" onClick={() => setIsReturning(true)}>Return</Button>
                    <Button className="bg-primary font-black px-8" onClick={handleBackOfficeEscalate}>SEND TO SUPERVISOR</Button>
                </div>
            );
        }
        if (application.status === 'Approved') return <Button onClick={() => setIsDispatching(true)} className="bg-primary font-black px-8"><Send className="mr-2 h-4 w-4" /> DISPATCH</Button>;
        if (application.status === 'Dispatched') return <Button onClick={() => handleStatusChange('Locked')} className="bg-foreground text-background font-black px-8">ARCHIVE</Button>;
        return null;

      case 'supervisor':
        if (application.status === 'Pending Supervisor') {
            return (
                <div className="flex gap-3">
                    <Button variant="destructive" onClick={() => setIsRejecting(true)}>Reject</Button>
                    <Button className="bg-primary font-black px-8" onClick={handleSupervisorReviewComplete}>SEND TO MANAGEMENT</Button>
                </div>
            );
        }
        if (application.status === 'Approved by Management') {
            return <Button className="bg-green-600 hover:bg-green-700 text-white font-black px-8" onClick={handleSupervisorFinalApproval}>FINAL APPROVAL</Button>;
        }
        return null;

      case 'management':
        if (application.status === 'Pending Executive Signature') {
            return (
                <div className="flex gap-3">
                    <Button variant="destructive" onClick={() => setIsRejecting(true)}>Reject</Button>
                    <Button className="bg-primary font-black px-8" onClick={() => setIsExecutiveSigning(true)}><FileSignature className="mr-2 h-4 w-4" /> SIGN AGREEMENT</Button>
                </div>
            );
        }
        return null;

      default: return null;
    }
  };

  return (
    <FormProvider {...form}>
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <Button variant="ghost" onClick={onBack} className="hover:bg-muted text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
              <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button variant="outline" onClick={handleDownloadPdf} disabled={isPrinting} className="font-bold"><Download className="mr-2 h-4 w-4" />Export Audit</Button>
                  {renderActions()}
              </div>
          </div>

          <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
            <div ref={printRef}><ApplicationPrintView application={application} /></div>
            {needsMandate && <div ref={resolutionRef}><AccountResolutionPrintView application={application} /></div>}
            {isCorporate && (
                <>
                    <div ref={checklistRef}><CorporateChecklist application={application} /></div>
                    <div ref={agencyAgreementRef}><AgencyAgreementPrintView data={application.details} /></div>
                    <div ref={adlaRef}><AdlaDeclarationPrintView data={application.details} /></div>
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
                  <CardTitle className="text-3xl font-black uppercase tracking-tight text-foreground">{application.clientName}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3" /> Region: <strong className="text-foreground">{application.region}</strong>
                  </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className="font-black px-4 py-1.5 uppercase tracking-widest text-xs shadow-sm bg-foreground text-background">
                    {getStateLabel(application.status)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
              
              {/* Back Office Audit Form */}
              {user.role === 'back-office' && application.status === 'Under Review' && (
                  <div className="mb-8 p-6 bg-slate-900/50 rounded-2xl border border-white/10 animate-in zoom-in-95">
                      <h4 className="text-xs font-black uppercase text-secondary tracking-widest mb-6 flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4" /> Back Office Audit Controls
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Financial Bureau (FCB) Status</Label>
                              <Select value={selectedFcbStatus} onValueChange={(v: FcbStatus) => setSelectedFcbStatus(v)}>
                                  <SelectTrigger className="h-12 bg-background border-white/10 font-bold">
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
                              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Assign Application Registry ID</Label>
                              <Input placeholder="e.g. BR-APP-XXXXX" value={brIdentity} onChange={e => setBrIdentity(e.target.value)} className="h-12 bg-background border-white/10 font-mono font-bold" />
                          </div>
                          <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">FCB Audit Attachment</Label>
                              <div className="flex gap-2">
                                  <input type="file" ref={fileInputRef} onChange={handleFcbFileUpload} className="hidden" accept="application/pdf,image/*" />
                                  <Button 
                                      variant="outline" 
                                      className="flex-1 h-12 font-black border-white/10"
                                      onClick={() => fileInputRef.current?.click()}
                                  >
                                      <Upload className="mr-2 h-4 w-4" /> {fcbReport ? 'Report Linked' : 'Attach FCB'}
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

              {/* Supervisor Final Approval Form */}
              {user.role === 'supervisor' && application.status === 'Approved by Management' && (
                  <div className="mb-8 p-6 bg-slate-900/50 rounded-2xl border border-white/10 animate-in zoom-in-95">
                      <h4 className="text-xs font-black uppercase text-primary tracking-widest mb-6 flex items-center gap-2">
                          <Key className="h-4 w-4" /> Registry Activation
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Core Registry Activation Code</Label>
                              <Input 
                                  placeholder="Enter final issuing code..." 
                                  value={activationCode} 
                                  onChange={e => setActivationCode(e.target.value)} 
                                  className="h-14 bg-background border-primary/20 font-mono font-black text-xl text-center tracking-tighter" 
                              />
                          </div>
                          <div className="flex items-center justify-center p-6 border-2 border-dashed border-primary/20 rounded-xl">
                              <p className="text-xs text-muted-foreground text-center font-bold uppercase tracking-tight">
                                  This code will finalize the application and return it to Back Office for issuance.
                              </p>
                          </div>
                      </div>
                  </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-muted/50 p-1.5 mb-8 rounded-xl w-full sm:w-auto overflow-x-auto">
                      <TabsTrigger value="form-data" className="px-6 rounded-lg">Profile</TabsTrigger>
                      <TabsTrigger value="documents" className="px-6 rounded-lg">Vault</TabsTrigger>
                      <TabsTrigger value="audit" className="px-6 rounded-lg font-black"><Gavel className="mr-2 h-4 w-4"/>AUDIT TRAIL</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="form-data" className="pt-2 animate-in fade-in-50 duration-300">
                      <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-muted/20 rounded-2xl border border-primary/5">
                            <DetailItem label="Account Type" value={application.clientType} />
                            <DetailItem label="Registry ID" value={application.details.brIdentity || 'Not Assigned'} />
                            <DetailItem label="FCB Risk" value={application.fcbStatus} />
                            <DetailItem label="State" value={getStateLabel(application.status)} />
                        </div>
                        {isPersonalOrIndividual ? <StepIndividualInfo disabled={true} /> : <StepCorporateInfo disabled={true} />}
                        {needsMandate && <StepSignatories disabled={true} />}
                      </div>
                  </TabsContent>

                  <TabsContent value="documents" className="pt-2 animate-in fade-in-50 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleDocuments.map((doc, i) => (
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
                                        <Eye className="mr-2 h-3.5 w-3.5" /> Preview
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="audit" className="pt-2 animate-in fade-in-50 duration-300">
                      <div className="space-y-10">
                          <div className="space-y-6">
                              <h4 className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2"><History className="h-4 w-4 text-primary" /> Forensic History</h4>
                              <div className="space-y-4">
                                  {application.history.map((log, idx) => (
                                      <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-muted/10">
                                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-black text-primary border border-primary/20">{log.user.substring(0,2)}</div>
                                          <div className="flex-1">
                                              <div className="flex justify-between items-center mb-1">
                                                  <p className="text-xs font-black uppercase text-white/80">{log.action}</p>
                                                  <span className="text-[10px] font-mono text-white/20">{new Date(log.timestamp).toLocaleString()}</span>
                                              </div>
                                              <p className="text-[11px] text-white/40 italic">{log.notes || 'No comments logged.'}</p>
                                              <p className="text-[9px] font-black uppercase text-primary/50 mt-1">Processed By: {log.user}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </TabsContent>
              </Tabs>
          </CardContent>
        </Card>

        {/* Rejection Dialog */}
        <AlertDialog open={isRejecting} onOpenChange={setIsRejecting}>
            <AlertDialogContent className="rounded-2xl border-destructive/20 shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black uppercase flex items-center gap-2 text-destructive"><ShieldAlert className="h-6 w-6" /> Decline Application</AlertDialogTitle>
                    <AlertDialogDescription className="text-base">Provide regulatory reasoning for declining this applicant.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-6 py-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Reason Code</Label>
                        <Select onValueChange={setRejectionReason} value={rejectionReason}>
                            <SelectTrigger className="h-12"><SelectValue placeholder="Select reason..." /></SelectTrigger>
                            <SelectContent className="rounded-xl">{rejectionReasons.map(reason => (<SelectItem key={reason} value={reason}>{reason}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Audit Note</Label>
                        <Textarea placeholder="Type details..." value={rejectionComment} onChange={(e) => setRejectionComment(e.target.value)} className="min-h-[150px] rounded-xl" />
                    </div>
                </div>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel className="h-12 rounded-xl font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRejection} className="h-12 rounded-xl bg-destructive text-destructive-foreground font-black px-8" disabled={!rejectionReason || !rejectionComment}>DECLINE RECORD</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Return Dialog */}
        <AlertDialog open={isReturning} onOpenChange={setIsReturning}>
            <AlertDialogContent className="rounded-2xl border-amber-200">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black uppercase flex items-center gap-2 text-amber-600"><CornerUpLeft className="h-6 w-6" /> Request Corrections</AlertDialogTitle>
                    <AlertDialogDescription className="text-base">Provide instructions for the ASL to rectify this application.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Fix Instructions</Label>
                        <Textarea placeholder="What needs to be changed?" value={returnComment} onChange={(e) => setReturnComment(e.target.value)} className="min-h-[150px] rounded-xl border-amber-200" />
                    </div>
                </div>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel onClick={() => { setIsReturning(false); setReturnComment(''); }} className="h-12 rounded-xl font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { handleStatusChange('Pending Documents', returnComment); setIsReturning(false); }} className="h-12 rounded-xl bg-amber-600 text-white font-black px-8" disabled={!returnComment.trim()}>SEND BACK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Document Preview */}
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
                            <p className="text-sm font-black uppercase tracking-widest">Binary stream missing.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>

        {/* Final Dispatch Dialog */}
        <Dialog open={isDispatching} onOpenChange={setIsDispatching}>
            <DialogContent className="bg-card border-primary/20 rounded-2xl shadow-2xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-primary"><Send className="h-6 w-6" /> Final Dispatch</DialogTitle>
                    <CardDescription className="text-base mt-2">Assign final core system identifiers.</CardDescription>
                </DialogHeader>
                <div className="py-8 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">BR Account Number</Label>
                        <Input placeholder="BR-XXXXXXX" value={dispatchBrAccountNumber} onChange={(e) => setDispatchBrAccountNumber(e.target.value)} className="h-12 font-mono text-center font-black" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Wallet Account Number</Label>
                        <Input placeholder="WL-XXXXXXX" value={dispatchWalletAccountNumber} onChange={(e) => setDispatchWalletAccountNumber(e.target.value)} className="h-12 font-mono text-center font-black" />
                    </div>
                </div>
                <DialogFooter className="gap-3 sm:flex-col">
                    <Button onClick={handleDispatchAccount} className="w-full h-12 text-lg font-black uppercase bg-primary text-primary-foreground">DISPATCH ACCOUNTS</Button>
                    <Button variant="ghost" onClick={() => setIsDispatching(false)} className="w-full h-10 font-bold">Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <InternalSignatureDialog 
            isOpen={isExecutiveSigning}
            onClose={() => setIsExecutiveSigning(false)}
            onSign={handleExecutiveSignOff}
            title="Board Sign-off"
            description="Authorize this agreement for final regulatory processing."
        />
      </div>
    </FormProvider>
  );
}
