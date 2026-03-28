'use client';

import * as React from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useAtom } from 'jotai';
import { Application, applicationsAtom, Comment, HistoryLog, OnboardingFormData, Document as AppDocument } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Archive, ArrowLeft, Check, FileText, History, User, X, MessageSquare, Download, CornerUpLeft, CheckCircle2, AlertCircle, Loader2, Wand2, FileEdit, FileSignature, Eraser, UserCheck, Eye, ShieldCheck, ShieldAlert, Upload, ShieldQuestion, Send, Key, Fingerprint, Wallet, MapPin, Sparkles } from 'lucide-react';
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
import { Alert, AlertDescription as AlertDescriptionComponent, AlertTitle as AlertTitleComponent } from '../ui/alert';
import StepCorporateInfo from './steps/step-corporate-info';
import StepSignatories from './steps/step-signatories';
import StepIndividualInfo from './steps/step-individual-info';
import AccountResolutionPrintView from './account-resolution-print-view';
import SignatureCanvas from 'react-signature-canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { extractAndValidateData } from '@/ai/flows/extract-and-validate-data';

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
  
  const [previewDoc, setPreviewDoc] = React.useState<AppDocument | null>(null);

  // Workflow States
  const [brIdentity, setBrIdentity] = React.useState(application.details.brIdentity || '');
  const [activationCode, setActivationCode] = React.useState(application.details.activationCode || '');
  const [dispatchAccountNumber, setDispatchAccountNumber] = React.useState('');
  const [isDispatching, setIsDispatching] = React.useState(false);
  const [isAiProcessing, setIsAiProcessing] = React.useState(false);

  // Logic: Sole Trader is same as Individual technical details but needs mandate
  const isPersonalOrIndividual = ['Individual Accounts', 'Minors', 'Sole Trader'].includes(application.clientType);
  const isCorporate = !isPersonalOrIndividual;
  const needsMandate = application.clientType !== 'Individual Accounts' && application.clientType !== 'Minors';
  
  const uploadedDocumentTypes = application.documents.map(d => d.type);
  const documentRequirements = getDocumentRequirements(application.clientType);
  
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

    // If forwarding a lead, ensure ASL is assigned as owner so they can track it in "My Applications"
    if (isForwarding && application.submittedBy === 'Customer') {
        updateData.submittedBy = user.name;
    }
    
    handleUpdateApplication(updateData);

    toast({
        title: `Updated: ${status}`,
        description: `Update for ${application.clientName} is done.`,
    });

     if (['Archived', 'Rejected', 'Pending Supervisor', 'Sent to Supervisor', 'Pending Compliance', 'Returned to ATL', 'Returned to ASL', 'Approved', 'Sent to Back Office', 'Claimed by ASL', 'Rejected by ASL', 'Returned to Back Office', 'Sent to Risk & Compliance', 'Approved by Supervisor', 'Rejected by Supervisor'].includes(status)) {
        setTimeout(() => onBack(), 500);
    }
  };

  const handleClaimLead = () => {
    handleUpdateApplication({ 
        status: 'Claimed by ASL', 
        submittedBy: user.name,
        history: [...application.history, { action: 'Lead Claimed', user: user.name, timestamp: new Date().toISOString() }] 
    });
    toast({ title: "Taken", description: `You now own ${application.clientName}.` });
    setTimeout(() => onBack(), 500);
  };

  const handleRejectLead = () => {
    handleUpdateApplication({ 
        status: 'Rejected by ASL', 
        submittedBy: 'Customer', // Return to public pool
        history: [...application.history, { action: 'Lead Rejected', user: user.name, timestamp: new Date().toISOString() }] 
    });
    toast({ title: "Rejected", description: "Record sent back to pool." });
    setTimeout(() => onBack(), 500);
  };

  const handleForwardToSupervisor = () => {
    if (!brIdentity) {
        toast({ variant: 'destructive', title: 'Code Needed', description: 'Please provide the BR ID.' });
        return;
    }
    const notes = `BR ID: ${brIdentity}. Sent for check.`;
    handleUpdateApplication({ 
        status: 'Sent to Supervisor', 
        details: { ...application.details, brIdentity },
        history: [...application.history, { action: 'ID Created', user: user.name, timestamp: new Date().toISOString(), notes }] 
    });
    toast({ title: "Sent", description: "Sent to Supervisor." });
    setTimeout(() => onBack(), 500);
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

  const handleSupervisorApproval = () => {
    if (!activationCode) {
        toast({ variant: 'destructive', title: 'Code Needed', description: 'Please enter the code.' });
        return;
    }
    const notes = `Audit OK. Code issued.`;
    handleUpdateApplication({ 
        status: 'Approved by Supervisor', 
        details: { ...application.details, activationCode },
        history: [...application.history, { action: 'Audit OK', user: user.name, timestamp: new Date().toISOString(), notes }] 
    });
    toast({ title: "Approved", description: "Audit complete." });
    setTimeout(() => onBack(), 500);
  };

  const handleDispatchAccount = () => {
    if (!dispatchAccountNumber) {
        toast({ variant: 'destructive', title: 'Number Needed', description: 'Enter the account number.' });
        return;
    }

    const newDetails = { 
        ...application.details, 
        accountNumber: dispatchAccountNumber, 
        accountOpeningDate: new Date().toISOString(),
        isDispatched: true 
    };
    const newHistoryLog: HistoryLog = { 
        action: 'Dispatched', 
        user: user.name, 
        timestamp: new Date().toISOString(),
        notes: `Account [${dispatchAccountNumber}] and ID [${application.details.brIdentity}] sent.`
    };

    handleUpdateApplication({ status: 'Archived', details: newDetails, history: [...application.history, newHistoryLog] });
    toast({ title: "Sent", description: `Account ${dispatchAccountNumber} is sent.` });
    setIsDispatching(false);
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

  const handleDownloadPdf = async () => {
    const summaryElement = printRef.current;
    if (!summaryElement) return;
    setIsPrinting(true);
    
    await new Promise(resolve => setTimeout(resolve, 100));

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
    setIsPrinting(false);
  };

  const handleGeminiVerification = async () => {
    if (application.documents.length < 2) {
        toast({
            variant: 'destructive',
            title: 'Files Needed',
            description: 'AI check needs at least two files.'
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
            description: 'AI failed to check files.'
        });
    } finally {
        setIsAiProcessing(false);
    }
  };

  const renderActions = () => {
    switch (user.role) {
      case 'asl':
        const isLead = application.submittedBy === 'Customer';
        
        if (isLead) {
            return (
                <div className="flex gap-2">
                    <Button onClick={handleClaimLead} className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-all active:scale-95">
                        <UserCheck className="mr-2 h-4 w-4" /> Take Lead
                    </Button>
                    <Button onClick={handleRejectLead} variant="destructive" className="font-bold shadow-md transition-all active:scale-95">
                        <X className="mr-2 h-4 w-4" /> Reject Lead
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
            return <Button onClick={() => setIsDispatching(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg px-8 transition-all active:scale-95"><Send className="mr-2 h-4 w-4" /> Dispatch Account</Button>;
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
        if (application.status === 'Pending Supervisor' || application.status === 'Sent to Supervisor') {
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
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-black shadow-lg px-8 transition-all active:scale-95" onClick={handleSupervisorApproval}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> APPROVE & ISSUE CODE
                    </Button>
                </div>
            );
        }
        return null;
      default: return null;
    }
  };
  
  const applicationForPrint = { ...application, details: { ...application.details, ...form.getValues() }};

  return (
    <FormProvider {...form}>
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <Button variant="ghost" onClick={onBack} className="hover:bg-muted text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
              <div className="flex items-center gap-3 w-full md:w-auto">
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
              {/* Back Office: Technical Creation (Clerk only) */}
              {user.role === 'back-office' && (application.status === 'Submitted' || application.status === 'Returned to ATL' || application.status === 'Returned to ASL' || application.status === 'Sent to Back Office' || application.status === 'Claimed by ASL' || application.status === 'Returned to Back Office') && (
                  <div className="mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/20 animate-in zoom-in-95 shadow-inner">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                          <h4 className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
                              <Fingerprint className="h-4 w-4" /> Action: Create ID
                          </h4>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-white border-primary/20 text-primary font-black hover:bg-primary/5 transition-all shadow-md active:scale-95 h-10 px-6"
                            onClick={handleGeminiVerification}
                            disabled={isAiProcessing || application.documents.length < 2}
                          >
                            {isAiProcessing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4 text-primary fill-primary/20" />
                            )}
                            {isAiProcessing ? 'Checking...' : 'AI Check'}
                          </Button>
                      </div>
                      <div className="max-w-md space-y-4">
                          <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider ml-1">Internal ID (BR)</Label>
                              <Input 
                                  placeholder="Type the BR ID code..." 
                                  value={brIdentity} 
                                  onChange={(e) => setBrIdentity(e.target.value)}
                                  className="bg-background font-mono h-12 text-lg focus:ring-primary border-primary/20 shadow-sm"
                              />
                              <p className="text-[10px] text-muted-foreground italic flex items-center gap-1.5 ml-1 mt-1.5">
                                <AlertCircle className="h-3 w-3" /> Mandatory: Create ID before sending.
                              </p>
                          </div>
                      </div>
                  </div>
              )}

              {/* Supervisor: Final Audit (Supervisor only) */}
              {user.role === 'supervisor' && (application.status === 'Pending Supervisor' || application.status === 'Sent to Supervisor') && (
                  <div className="mb-8 p-6 bg-green-500/5 rounded-2xl border border-green-500/20 animate-in zoom-in-95 shadow-inner">
                      <h4 className="text-xs font-black uppercase text-green-600 tracking-widest mb-6 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm w-fit">
                          <Key className="h-4 w-4" /> Action: Check & Approve
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                          <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider ml-1">BR ID</Label>
                              <div className="h-12 flex items-center px-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20 font-mono text-lg font-bold text-foreground/70">
                                {application.details.brIdentity || 'NONE'}
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-green-600 tracking-wider ml-1">Activation Code</Label>
                              <Input 
                                  placeholder="Enter code..." 
                                  value={activationCode} 
                                  onChange={(e) => setActivationCode(e.target.value)}
                                  className="bg-background font-mono h-12 text-lg border-green-200 focus:ring-green-500 shadow-sm"
                              />
                          </div>
                      </div>
                  </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-muted/50 p-1.5 mb-8 rounded-xl w-full sm:w-auto overflow-x-auto">
                      <TabsTrigger value="form-data" className="px-6 rounded-lg data-[state=active]:shadow-md"><FileEdit className="mr-2 h-4 w-4"/>Profile</TabsTrigger>
                      <TabsTrigger value="documents" className="px-6 rounded-lg data-[state=active]:shadow-md"><FileText className="mr-2 h-4 w-4"/>Files</TabsTrigger>
                      <TabsTrigger value="comments" className="px-6 rounded-lg data-[state=active]:shadow-md font-black"><Wallet className="mr-2 h-4 w-4"/>WALLET INFO</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="form-data" className="pt-2 animate-in fade-in-50 duration-300">
                      <Card className="border-none shadow-none bg-transparent">
                          <CardContent className="p-0 space-y-8">
                              {/* High-level status summary for Account Details */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-muted/20 rounded-2xl border border-primary/5">
                                  <DetailItem label="Account Type" value={application.clientType} />
                                  <DetailItem label="Region" value={application.region} />
                                  <DetailItem label="Status" value={application.status.toUpperCase()} />
                              </div>
                              <Separator className="opacity-50" />
                              {/* Full record details */}
                              <div className="space-y-10">
                                {isPersonalOrIndividual ? <StepIndividualInfo /> : <StepCorporateInfo />}
                                {needsMandate && (
                                    <div className="mt-8 bg-muted/10 p-6 rounded-2xl border border-white/10">
                                        <StepSignatories />
                                    </div>
                                )}
                              </div>
                          </CardContent>
                      </Card>
                  </TabsContent>

                  <TabsContent value="documents" className="pt-2 animate-in fade-in-50 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="border-primary/5 bg-muted/5 rounded-2xl">
                            <CardHeader className="pb-4"><CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Checklist</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {documentRequirements.map((req) => { 
                                        const isUploaded = uploadedDocumentTypes.includes(req.document); 
                                        return (
                                            <li key={req.document} className="flex items-start p-3 rounded-lg hover:bg-white/5 transition-colors">
                                                {isUploaded ? <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" /> : <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 shrink-0" />}
                                                <div className="text-sm font-bold leading-tight text-foreground/80">{req.document}</div>
                                            </li>
                                        ); 
                                    })}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="border-primary/5 bg-muted/5 rounded-2xl">
                            <CardHeader className="pb-4"><CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Uploaded Files</CardTitle></CardHeader>
                            <CardContent>
                                {application.documents.length > 0 ? (
                                    <ul className="space-y-3">
                                        {application.documents.map(doc => (
                                            <li key={doc.type} className="flex items-center justify-between p-4 rounded-xl border border-primary/10 bg-background/50 shadow-sm group hover:border-primary/30 transition-all">
                                                <div>
                                                    <p className="text-sm font-black leading-none text-foreground">{doc.type}</p>
                                                    <p className="text-[10px] text-muted-foreground mt-1.5 uppercase font-mono tracking-tighter">{doc.fileName}</p>
                                                </div>
                                                <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg font-bold border-primary/10 hover:bg-primary/5" onClick={() => setPreviewDoc(doc)}><Eye className="mr-2 h-4 w-4" />View</Button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <div className="text-sm text-center py-16 text-muted-foreground italic border-2 border-dashed rounded-2xl">No files uploaded.</div>}
                            </CardContent>
                        </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="comments" className="pt-2 animate-in fade-in-50 duration-300">
                      <Card className="border-none bg-transparent shadow-none">
                          <CardContent className="p-0 space-y-10">
                              {/* Accounts only appear when APPROVED and SENT BACK (Archived & Dispatched) */}
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
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <Card className="bg-background border-primary/20 shadow-md rounded-xl overflow-hidden">
                                              <CardContent className="p-6 flex items-center gap-5">
                                                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Wallet className="h-6 w-6" /></div>
                                                  <div>
                                                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Account #</p>
                                                      <p className="text-2xl font-mono font-black text-foreground tracking-tighter">{application.details.accountNumber}</p>
                                                  </div>
                                              </CardContent>
                                          </Card>
                                          <Card className="bg-background border-primary/20 shadow-md rounded-xl overflow-hidden">
                                              <CardContent className="p-6 flex items-center gap-5">
                                                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Fingerprint className="h-6 w-6" /></div>
                                                  <div>
                                                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">BR ID</p>
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
                            <iframe src={previewDoc.url} className="w-full h-full border-none" />
                        ) : <img src={previewDoc.url} alt="Document" className="max-w-full max-h-full object-contain animate-in zoom-in-95" />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-white/30 text-center max-w-xs animate-pulse">
                            <ShieldQuestion className="h-16 w-16 opacity-20" />
                            <p className="text-sm font-black uppercase tracking-widest leading-relaxed">File data missing.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>

        <Dialog open={isDispatching} onOpenChange={setIsDispatching}>
            <DialogContent className="bg-card border-primary/20 rounded-2xl shadow-2xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-primary">
                        <Send className="h-6 w-6" /> Finish
                    </DialogTitle>
                    <CardDescription className="text-base mt-2">Enter the final 10-digit Account Number.</CardDescription>
                </DialogHeader>
                <div className="py-8 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Account Number</Label>
                        <Input 
                            placeholder="e.g. 1002345678"
                            value={dispatchAccountNumber}
                            onChange={(e) => setDispatchAccountNumber(e.target.value)}
                            className="h-14 text-2xl font-mono text-center tracking-[0.3em] font-black rounded-xl border-primary/30 focus:ring-primary shadow-inner"
                        />
                    </div>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary leading-relaxed flex items-start gap-3">
                        <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Done: Finishing this will archive the record.</span>
                    </div>
                </div>
                <DialogFooter className="gap-3 sm:flex-col sm:gap-3">
                    <Button onClick={handleDispatchAccount} className="w-full h-12 text-lg font-black uppercase tracking-widest shadow-lg bg-primary text-primary-foreground hover:scale-[1.02] transition-transform">Finish</Button>
                    <Button variant="ghost" onClick={() => setIsDispatching(false)} className="w-full h-10 font-bold text-muted-foreground hover:bg-muted">Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </FormProvider>
  );
}