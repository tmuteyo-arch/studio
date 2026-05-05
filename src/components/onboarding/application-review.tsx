'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Application, applicationsAtom, HistoryLog, OnboardingFormData, Document as AppDocument, FcbStatus, ApplicationStatus, notificationsAtom, Notification } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive, ArrowLeft, FileText, X, Download, CornerUpLeft, Loader2, FileSignature, Eraser, Eye, ShieldCheck, ShieldAlert, Upload, ShieldQuestion, Send, Key, MapPin, Gavel, ClipboardCheck, History, AlertTriangle, ShieldX } from 'lucide-react';
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
import SignatureCanvas from 'react-signature-canvas';
import { isValidTransition, getStateLabel } from '@/lib/state-machine';
import { Switch } from '../ui/switch';

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
  
  const [previewDoc, setPreviewDoc] = React.useState<AppDocument | null>(null);

  // Compliance State for Back Office
  const [selectedFcbStatus, setSelectedFcbStatus] = React.useState<FcbStatus>(application.fcbStatus);
  const [fcbReport, setFcbReport] = React.useState<AppDocument | null>(application.documents.find(d => d.type === 'FCB Report') || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Safety Check Logic State
  const [safetyCheck, setSafetyCheck] = React.useState({
      problemReport: false,
      highProfile: false,
      securityIssue: false,
      isSevere: false
  });

  // Workflow States
  const [brIdentity, setBrIdentity] = React.useState(application.details.brIdentity || '');
  const [activationCode, setActivationCode] = React.useState(application.details.activationCode || '');
  const [dispatchBrAccountNumber, setDispatchBrAccountNumber] = React.useState('');
  const [dispatchWalletAccountNumber, setDispatchWalletAccountNumber] = React.useState('');
  const [isDispatching, setIsDispatching] = React.useState(false);

  // Digital Signatures
  const [isExecutiveSigning, setIsExecutiveSigning] = React.useState(false);

  const isPersonalOrIndividual = ['Individual Accounts', 'Minors', 'Sole Trader'].includes(application.clientType);
  const needsMandate = application.clientType !== 'Individual Accounts' && application.clientType !== 'Minors';
  const isCorporate = !isPersonalOrIndividual;
  
  const form = useForm<OnboardingFormData>({ defaultValues: application.details });

  // Role-based document visibility
  const visibleDocuments = React.useMemo(() => {
    if (['back-office', 'supervisor', 'management', 'compliance'].includes(user.role)) {
        return application.documents;
    }
    return application.documents.filter(doc => doc.type !== 'FCB Report' && doc.type !== 'Internal Audit');
  }, [application.documents, user.role]);

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
        toast({ variant: 'destructive', title: 'Action Blocked', description: `This step cannot be skipped.` });
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

        toast({ title: `Updated: ${getStateLabel(nextStatus)}` });
        
        if (['Locked', 'Rejected', 'Approved', 'Dispatched', 'Under Review', 'Safe to Continue', 'Not Safe to Proceed', 'Needs Review', 'Management Review', 'Approved by Management'].includes(nextStatus)) {
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
        
        handleUpdateApplication({
            documents: [...application.documents.filter(d => d.type !== 'FCB Report'), newDoc],
            fcbStatus: selectedFcbStatus
        });

        toast({ title: "Check Report Saved", description: "The background check report is now attached." });
    };
    reader.readAsDataURL(file);
  };

  const handleBackOfficeApplicationCheck = () => {
    if (!fcbReport) {
        toast({ variant: 'destructive', title: 'File Missing', description: 'Please attach the background check report first.' });
        return;
    }
    if (!brIdentity) {
        toast({ variant: 'destructive', title: 'ID Needed', description: 'Please assign a Reference ID.' });
        return;
    }

    const { problemReport, highProfile, securityIssue, isSevere } = safetyCheck;
    const hasProblem = problemReport || highProfile || securityIssue;
    
    let nextStatus: ApplicationStatus;
    let notes = `Safety Check - Problem: ${problemReport}, High Profile: ${highProfile}, Security Issue: ${securityIssue}, Severe: ${isSevere}.`;

    if (hasProblem) {
        if (isSevere) {
            nextStatus = 'Not Safe to Proceed';
            notes += ' Terminating application due to severe security flags.';
        } else {
            nextStatus = 'Needs Review';
            notes += ' Returning for secondary internal review.';
        }
    } else {
        nextStatus = 'Safe to Continue';
        notes += ' Safety check passed. Sending to Supervisor.';
    }
    
    handleUpdateApplication({ 
        details: { ...application.details, brIdentity },
        fcbStatus: selectedFcbStatus
    });
    
    handleStatusChange(nextStatus, notes);
  };

  const handleSupervisorReviewComplete = () => {
    handleStatusChange('Management Review', 'Supervisor check passed. Sent for Manager sign-off.');
  };

  const handleExecutiveSignOff = (signature: string) => {
    handleUpdateApplication({
        details: { 
            ...application.details, 
            executiveSignature: signature, 
            executiveSignatureTimestamp: new Date().toISOString() 
        }
    });
    handleStatusChange('Approved by Management', 'Manager signed the agreement. Returned to Supervisor.');
    setIsExecutiveSigning(false);
  };

  const handleSupervisorFinalApproval = () => {
    if (!activationCode) {
        toast({ variant: 'destructive', title: 'Code Needed', description: 'Please enter the final approval code.' });
        return;
    }
    handleUpdateApplication({
        details: { ...application.details, activationCode }
    });
    handleStatusChange('Approved', 'Final approval given. Ready to finish account setup.');
  };

  /**
   * Validates a wallet or bank account string based on regulatory standards.
   * Logic: Must be exactly 10 numeric digits.
   */
  const validateWallet = (account: string) => {
    return /^\d{10}$/.test(account);
  };

  const handleDispatchAccount = async () => {
    // Collect all accounts associated with this application to validate them
    const accountsToValidate = [
        { name: 'Core BR Account', value: dispatchBrAccountNumber },
        { name: 'Primary Wallet', value: dispatchWalletAccountNumber }
    ];

    // Validation Loop: FOR each wallet_account IN application
    const invalidAccounts = accountsToValidate.filter(acc => !validateWallet(acc.value));

    // IF all_wallets_valid
    if (invalidAccounts.length === 0) {
        // dispatch_all_wallets_together()
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
                    { action: 'Dispatched', user: user.name, timestamp, notes: `Batch validation successful. All accounts dispatched together.` }
                ]
            });
            
            // set_status = "Dispatched"
            toast({ title: "Dispatch Success", description: "All wallets validated and accounts activated together." });
            setIsDispatching(false);
            setTimeout(() => onBack(), 500);
        } finally {
            setIsProcessingAction(false);
        }
    } else {
        // ELSE stop_dispatch() and return_error()
        toast({ 
            variant: 'destructive', 
            title: 'Batch Dispatch Halted', 
            description: `Validation failed for: ${invalidAccounts.map(a => a.name).join(', ')}. Accounts must be 10-digit numeric identifiers.` 
        });
    }
  };

  const handleRejection = () => {
    if (!rejectionReason || !rejectionComment) {
        toast({ variant: 'destructive', title: 'Reason Needed', description: 'Please explain why this is being rejected.' });
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

        pdf.save(`Records-${application.id}.pdf`);
    } finally {
        setIsPrinting(false);
    }
  };

  const renderActions = () => {
    if (isProcessingAction) return <Button disabled className="font-bold px-8"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> WORKING...</Button>;

    switch (user.role) {
      case 'asl':
        if (application.status === 'Draft') return <Button onClick={() => handleStatusChange('In Progress')} className="bg-primary font-bold px-8">START</Button>;
        if (application.status === 'In Progress') return <Button onClick={() => handleStatusChange('Pending Documents')} className="bg-primary font-bold px-8">NEXT</Button>;
        if (application.status === 'Pending Documents') return <Button onClick={() => handleStatusChange('Under Review')} className="bg-primary font-bold px-8">SEND FOR REVIEW</Button>;
        return null;
        
      case 'back-office':
        if (application.status === 'Under Review' || application.status === 'Needs Review') {
            return (
                <div className="flex gap-3">
                    <Button variant="outline" className="text-amber-500 font-bold" onClick={() => setIsReturning(true)}>Return to Sales</Button>
                    <Button className="bg-primary font-bold px-8" onClick={handleBackOfficeApplicationCheck}>APPLY CHECK</Button>
                </div>
            );
        }
        if (application.status === 'Approved') return <Button onClick={() => setIsDispatching(true)} className="bg-primary font-bold px-8"><Send className="mr-2 h-4 w-4" /> FINISH SETUP</Button>;
        if (application.status === 'Dispatched') return <Button onClick={() => handleStatusChange('Locked')} className="bg-foreground text-background font-bold px-8">MOVE TO ARCHIVE</Button>;
        return null;

      case 'supervisor':
        if (application.status === 'Safe to Continue') {
            return (
                <div className="flex gap-3">
                    <Button variant="destructive" onClick={() => setIsRejecting(true)}>Reject</Button>
                    <Button className="bg-primary font-bold px-8" onClick={handleSupervisorReviewComplete}>SEND TO MANAGER</Button>
                </div>
            );
        }
        if (application.status === 'Approved by Management') {
            return <Button className="bg-green-600 hover:bg-green-700 text-white font-bold px-8" onClick={handleSupervisorFinalApproval}>GIVE FINAL APPROVAL</Button>;
        }
        return null;

      case 'management':
        if (application.status === 'Management Review') {
            return (
                <div className="flex gap-3">
                    <Button variant="destructive" onClick={() => setIsRejecting(true)}>Reject</Button>
                    <Button className="bg-primary font-bold px-8" onClick={() => setIsExecutiveSigning(true)}><FileSignature className="mr-2 h-4 w-4" /> SIGN AGREEMENT</Button>
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
                  <Button variant="outline" onClick={handleDownloadPdf} disabled={isPrinting} className="font-bold"><Download className="mr-2 h-4 w-4" />Save as PDF</Button>
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
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">{application.clientType}</Badge>
                  </div>
                  <CardTitle className="text-3xl font-bold uppercase tracking-tight text-foreground">{application.clientName}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3" /> Region: <strong className="text-foreground">{application.region}</strong>
                  </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className="font-bold px-4 py-1.5 uppercase tracking-widest text-xs shadow-sm bg-foreground text-background">
                    {getStateLabel(application.status)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
              
              {/* Back Office Form & Safety Check */}
              {user.role === 'back-office' && (application.status === 'Under Review' || application.status === 'Needs Review') && (
                  <div className="mb-8 space-y-8">
                      <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/10 animate-in zoom-in-95">
                          <h4 className="text-xs font-bold uppercase text-secondary tracking-widest mb-6 flex items-center gap-2">
                              <ClipboardCheck className="h-4 w-4" /> Staff Check Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="space-y-4">
                                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Background Check Status</Label>
                                  <Select value={selectedFcbStatus} onValueChange={(v: FcbStatus) => setSelectedFcbStatus(v)}>
                                      <SelectTrigger className="h-12 bg-background border-white/10 font-bold">
                                          <SelectValue placeholder="Set Status..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                          {fcbStatusOptions.map(status => (
                                              <SelectItem key={status} value={status} className="font-bold py-3">{status}</SelectItem>
                                          ))}
                                      </SelectContent>
                                  </Select>
                              </div>
                              <div className="space-y-4">
                                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Reference ID Number</Label>
                                  <Input placeholder="e.g. APP-12345" value={brIdentity} onChange={e => setBrIdentity(e.target.value)} className="h-12 bg-background border-white/10 font-mono font-bold" />
                              </div>
                              <div className="space-y-4">
                                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Attach Check Report</Label>
                                  <div className="flex gap-2">
                                      <input type="file" ref={fileInputRef} onChange={handleFcbFileUpload} className="hidden" accept="application/pdf,image/*" />
                                      <Button 
                                          variant="outline" 
                                          className="flex-1 h-12 font-bold border-white/10"
                                          onClick={() => fileInputRef.current?.click()}
                                      >
                                          <Upload className="mr-2 h-4 w-4" /> {fcbReport ? 'Report Added' : 'Upload Report'}
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

                      <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 animate-in slide-in-from-top-4">
                          <h4 className="text-xs font-black uppercase text-primary tracking-widest mb-6 flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4" /> Mandatory Application Check
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                              <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-white/5">
                                  <Label className="text-[10px] font-bold uppercase cursor-pointer" htmlFor="prob-rep">Problem Report</Label>
                                  <Switch id="prob-rep" checked={safetyCheck.problemReport} onCheckedChange={v => setSafetyCheck({...safetyCheck, problemReport: v})} />
                              </div>
                              <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-white/5">
                                  <Label className="text-[10px] font-bold uppercase cursor-pointer" htmlFor="high-prof">High Profile</Label>
                                  <Switch id="high-prof" checked={safetyCheck.highProfile} onCheckedChange={v => setSafetyCheck({...safetyCheck, highProfile: v})} />
                              </div>
                              <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-white/5">
                                  <Label className="text-[10px] font-bold uppercase cursor-pointer" htmlFor="sec-issue">Security Issue</Label>
                                  <Switch id="sec-issue" checked={safetyCheck.securityIssue} onCheckedChange={v => setSafetyCheck({...safetyCheck, securityIssue: v})} />
                              </div>
                              <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                                  <div className="flex items-center gap-2">
                                      <AlertTriangle className="h-3 w-3 text-destructive" />
                                      <Label className="text-[10px] font-black uppercase text-destructive cursor-pointer" htmlFor="severe">Is Severe?</Label>
                                  </div>
                                  <Switch id="severe" checked={safetyCheck.isSevere} onCheckedChange={v => setSafetyCheck({...safetyCheck, isSevere: v})} />
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* Supervisor Approval Form */}
              {user.role === 'supervisor' && application.status === 'Approved by Management' && (
                  <div className="mb-8 p-6 bg-slate-900/50 rounded-2xl border border-white/10 animate-in zoom-in-95">
                      <h4 className="text-xs font-bold uppercase text-primary tracking-widest mb-6 flex items-center gap-2">
                          <Key className="h-4 w-4" /> Final Approval
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Final Approval Code</Label>
                              <Input 
                                  placeholder="Enter final code..." 
                                  value={activationCode} 
                                  onChange={e => setActivationCode(e.target.value)} 
                                  className="h-14 bg-background border-primary/20 font-mono font-bold text-xl text-center tracking-tighter" 
                              />
                          </div>
                          <div className="flex items-center justify-center p-6 border-2 border-dashed border-primary/20 rounded-xl">
                              <p className="text-xs text-muted-foreground text-center font-bold uppercase tracking-tight">
                                  This code will finish the application and allow account setup.
                              </p>
                          </div>
                      </div>
                  </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-muted/50 p-1.5 mb-8 rounded-xl w-full sm:w-auto overflow-x-auto">
                      <TabsTrigger value="form-data" className="px-6 rounded-lg">Profile</TabsTrigger>
                      <TabsTrigger value="documents" className="px-6 rounded-lg">Files</TabsTrigger>
                      <TabsTrigger value="audit" className="px-6 rounded-lg font-bold"><History className="mr-2 h-4 w-4"/>HISTORY</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="form-data" className="pt-2 animate-in fade-in-50 duration-300">
                      <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-muted/20 rounded-2xl border border-primary/5">
                            <DetailItem label="Account Type" value={application.clientType} />
                            <DetailItem label="Reference ID" value={application.details.brIdentity || 'Not Set'} />
                            <DetailItem label="Check Status" value={application.fcbStatus} />
                            <DetailItem label="Progress" value={getStateLabel(application.status)} />
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
                                        <Badge variant="outline" className="text-[8px] font-bold uppercase">{doc.type}</Badge>
                                    </div>
                                    <p className="text-sm font-bold uppercase text-foreground leading-tight truncate mb-6">{doc.type}</p>
                                    <Button 
                                        className="w-full h-10 font-bold uppercase text-[10px]"
                                        variant="outline"
                                        onClick={() => setPreviewDoc(doc)}
                                    >
                                        <Eye className="mr-2 h-3.5 w-3.5" /> View File
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="audit" className="pt-2 animate-in fade-in-50 duration-300">
                      <div className="space-y-10">
                          <div className="space-y-6">
                              <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2"><History className="h-4 w-4 text-primary" /> Action History</h4>
                              <div className="space-y-4">
                                  {application.history.map((log, idx) => (
                                      <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-muted/10">
                                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary border border-primary/20">{log.user.substring(0,2)}</div>
                                          <div className="flex-1">
                                              <div className="flex justify-between items-center mb-1">
                                                  <p className="text-xs font-bold uppercase text-white/80">{log.action}</p>
                                                  <span className="text-[10px] font-mono text-white/20">{new Date(log.timestamp).toLocaleString()}</span>
                                              </div>
                                              <p className="text-[11px] text-white/40 italic">{log.notes || 'No notes.'}</p>
                                              <p className="text-[9px] font-bold uppercase text-primary/50 mt-1">Person: {log.user}</p>
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
                    <AlertDialogTitle className="text-2xl font-bold uppercase flex items-center gap-2 text-destructive"><ShieldAlert className="h-6 w-6" /> Reject Application</AlertDialogTitle>
                    <AlertDialogDescription className="text-base">Please explain why this application is being rejected.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-6 py-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Reason Category</Label>
                        <Select onValueChange={setRejectionReason} value={rejectionReason}>
                            <SelectTrigger className="h-12"><SelectValue placeholder="Select reason..." /></SelectTrigger>
                            <SelectContent className="rounded-xl">{rejectionReasons.map(reason => (<SelectItem key={reason} value={reason}>{reason}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Additional Notes</Label>
                        <Textarea placeholder="Type details here..." value={rejectionComment} onChange={(e) => setRejectionComment(e.target.value)} className="min-h-[150px] rounded-xl" />
                    </div>
                </div>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel className="h-12 rounded-xl font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRejection} className="h-12 rounded-xl bg-destructive text-destructive-foreground font-bold px-8" disabled={!rejectionReason || !rejectionComment}>REJECT NOW</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Return Dialog */}
        <AlertDialog open={isReturning} onOpenChange={setIsReturning}>
            <AlertDialogContent className="rounded-2xl border-amber-200">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-bold uppercase flex items-center gap-2 text-amber-600"><CornerUpLeft className="h-6 w-6" /> Need Fixes</AlertDialogTitle>
                    <AlertDialogDescription className="text-base">Tell the Sales person what needs to be changed.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">What to fix?</Label>
                        <Textarea placeholder="e.g. ID is blurry" value={returnComment} onChange={(e) => setReturnComment(e.target.value)} className="min-h-[150px] rounded-xl border-amber-200" />
                    </div>
                </div>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel onClick={() => { setIsReturning(false); setReturnComment(''); }} className="h-12 rounded-xl font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { handleStatusChange('Pending Documents', returnComment); setIsReturning(false); }} className="h-12 rounded-xl bg-amber-600 text-white font-bold px-8" disabled={!returnComment.trim()}>SEND BACK</AlertDialogAction>
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
                            <DialogTitle className="text-xs uppercase font-bold tracking-[0.2em] text-primary">{previewDoc?.type}</DialogTitle>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase">{previewDoc?.fileName}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setPreviewDoc(null)} className="rounded-full"><X className="h-5 w-5" /></Button>
                </div>
                <div className="flex-1 bg-black/90 relative flex items-center justify-center overflow-hidden">
                    {previewDoc?.url && previewDoc.url !== '#' ? (
                        previewDoc.url.includes('application/pdf') || previewDoc.fileName.toLowerCase().endsWith('.pdf') ? (
                            <iframe src={previewDoc.url} className="w-full h-full border-none" title="File View" />
                        ) : <img src={previewDoc.url} alt="File" className="max-w-full max-h-full object-contain" />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-white/30 text-center max-w-xs">
                            <ShieldQuestion className="h-16 w-16 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-widest">File data not found.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>

        {/* Final Completion Dialog */}
        <Dialog open={isDispatching} onOpenChange={setIsDispatching}>
            <DialogContent className="bg-card border-primary/20 rounded-2xl shadow-2xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold uppercase tracking-tight text-primary"><Send className="h-6 w-6" /> Finish Setup</DialogTitle>
                    <CardDescription className="text-base mt-2">Validate accounts and finish the registry update.</CardDescription>
                </DialogHeader>
                <div className="py-8 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Bank Account Number (Core BR)</Label>
                        <Input placeholder="Enter 10-digit number..." value={dispatchBrAccountNumber} onChange={(e) => setDispatchBrAccountNumber(e.target.value)} className="h-12 font-mono text-center font-bold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Wallet Account Number (Mobile)</Label>
                        <Input placeholder="Enter 10-digit number..." value={dispatchWalletAccountNumber} onChange={(e) => setDispatchWalletAccountNumber(e.target.value)} className="h-12 font-mono text-center font-bold" />
                    </div>
                </div>
                <DialogFooter className="gap-3 sm:flex-col">
                    <Button onClick={handleDispatchAccount} className="w-full h-12 text-lg font-bold uppercase bg-primary text-primary-foreground">VALIDATE & FINISH</Button>
                    <Button variant="ghost" onClick={() => setIsDispatching(false)} className="w-full h-10 font-bold">Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <InternalSignatureDialog 
            isOpen={isExecutiveSigning}
            onClose={() => setIsExecutiveSigning(false)}
            onSign={handleExecutiveSignOff}
            title="Manager Sign-off"
            description="Apply your signature to finish the approval."
        />
      </div>
    </FormProvider>
  );
}
