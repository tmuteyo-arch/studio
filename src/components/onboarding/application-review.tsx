'use client';

import * as React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAtom } from 'jotai';
import { Application, applicationsAtom, Comment, HistoryLog, OnboardingFormData, Document } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Archive, ArrowLeft, Check, FileText, History, User, X, MessageSquare, Download, CornerUpLeft, CheckCircle2, AlertCircle, Loader2, Wand2, FileEdit, FileSignature, Eraser, UserCheck, Eye, ShieldCheck, ShieldAlert, Upload, ShieldQuestion, Send, Key, Fingerprint, Wallet, MapPin } from 'lucide-react';
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
  
  const [previewDoc, setPreviewDoc] = React.useState<Document | null>(null);

  // Workflow States
  const [brIdentity, setBrIdentity] = React.useState(application.details.brIdentity || '');
  const [activationCode, setActivationCode] = React.useState(application.details.activationCode || '');
  const [dispatchAccountNumber, setDispatchAccountNumber] = React.useState('');
  const [isDispatching, setIsDispatching] = React.useState(false);

  // Logic: Sole Trader is same as Individual technical details
  const isPersonalOrIndividual = ['Individual Accounts', 'Minors', 'Sole Trader'].includes(application.clientType);
  const isCorporate = !isPersonalOrIndividual;
  const needsMandate = !isPersonalOrIndividual;
  
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
    const newHistoryLog: HistoryLog = {
      action: status,
      user: user.name,
      timestamp: new Date().toISOString(),
      notes: notes,
    };
    
    handleUpdateApplication({ status: status, history: [...application.history, newHistoryLog] });

    toast({
        title: `Application ${status}`,
        description: `Application for ${application.clientName} has been updated.`,
    });

     if (['Archived', 'Rejected', 'Pending Supervisor', 'Pending Compliance', 'Returned to ATL', 'Approved'].includes(status)) {
        setTimeout(() => onBack(), 500);
    }
  };

  const handleForwardToSupervisor = () => {
    if (!brIdentity) {
        toast({ variant: 'destructive', title: 'Technical ID Required', description: 'Please provide the internal BR Identity.' });
        return;
    }
    const notes = `Technical ID: ${brIdentity} created in registry. Escalate for activation.`;
    handleUpdateApplication({ 
        status: 'Pending Supervisor', 
        details: { ...application.details, brIdentity },
        history: [...application.history, { action: 'Registry Identity Created', user: user.name, timestamp: new Date().toISOString(), notes }] 
    });
    toast({ title: "Escalated to Supervisor", description: "Technical identity data has been queued for audit." });
    setTimeout(() => onBack(), 500);
  };

  const handleSupervisorApproval = () => {
    if (!activationCode) {
        toast({ variant: 'destructive', title: 'Action Required', description: 'Please enter the Activation Code.' });
        return;
    }
    const notes = `Supervisor audit successful. Activation Code issued.`;
    handleUpdateApplication({ 
        status: 'Approved', 
        details: { ...application.details, activationCode },
        history: [...application.history, { action: 'Audit Approved', user: user.name, timestamp: new Date().toISOString(), notes }] 
    });
    toast({ title: "Approved for Finalization", description: "Authorization code issued to clerk." });
    setTimeout(() => onBack(), 500);
  };

  const handleDispatchAccount = () => {
    if (!dispatchAccountNumber) {
        toast({ variant: 'destructive', title: 'Missing Account Number', description: 'Enter the finalized wallet account number.' });
        return;
    }

    const newDetails = { 
        ...application.details, 
        accountNumber: dispatchAccountNumber, 
        accountOpeningDate: new Date().toISOString(),
        isDispatched: true 
    };
    const newHistoryLog: HistoryLog = { 
        action: 'Account Details Dispatched', 
        user: user.name, 
        timestamp: new Date().toISOString(),
        notes: `Wallet [${dispatchAccountNumber}] and Identity [${application.details.brIdentity}] returned to ASL.`
    };

    handleUpdateApplication({ status: 'Archived', details: newDetails, history: [...application.history, newHistoryLog] });
    toast({ title: "Record Dispatched", description: `Wallet account ${dispatchAccountNumber} has been sent to the Sales Leader.` });
    setIsDispatching(false);
    setTimeout(() => onBack(), 500);
  };

  const handleRejection = () => {
    if (!rejectionReason || !rejectionComment) {
        toast({ variant: 'destructive', title: 'Rejection Error', description: 'Provide a reason and supporting comment.' });
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

  const renderActions = () => {
    switch (user.role) {
      case 'back-office':
        if (application.status === 'Approved') {
            return <Button onClick={() => setIsDispatching(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-black"><Send className="mr-2 h-4 w-4" />Dispatch Approved Account</Button>;
        }
        if (application.status === 'Submitted' || application.status === 'Returned to ATL') {
            return (
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleStatusChange('Returned to ATL')}><CornerUpLeft className="mr-2 h-4 w-4" />Correction Required</Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleForwardToSupervisor}>
                        <ShieldCheck className="mr-2 h-4 w-4" /> Escalate for Activation
                    </Button>
                </div>
            );
        }
        return null;
      case 'supervisor':
        if (application.status === 'Pending Supervisor') {
            return (
                <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => setIsRejecting(true)}><X className="mr-2 h-4 w-4" />Decline</Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleSupervisorApproval}>
                        <Check className="mr-2 h-4 w-4" /> Audit OK & Issue Code
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
      <div>
          <div className="mb-6 flex items-center justify-between">
              <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" />Back to List</Button>
              <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleDownloadPdf} disabled={isPrinting}><Download className="mr-2 h-4 w-4" />{isPrinting ? 'Preparing PDF...' : 'Download Record'}</Button>
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
          
        <Card className="border-primary/10 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tight">Record Audit: {application.id}</CardTitle>
                  <CardDescription>Legal Name: <strong>{application.clientName}</strong>.</CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className="font-bold uppercase tracking-widest">{application.status.replace('-', ' ')}</Badge>
                {application.details.isDispatched && <Badge variant="success" className="font-black animate-in fade-in">ACCOUNT DISPATCHED</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
              {/* Back Office: Technical Creation (Clerk only) */}
              {user.role === 'back-office' && (application.status === 'Submitted' || application.status === 'Returned to ATL') && (
                  <div className="mb-8 p-6 bg-primary/5 rounded-xl border border-primary/20 animate-in slide-in-from-top-4">
                      <h4 className="text-xs font-black uppercase text-primary tracking-widest mb-4 flex items-center gap-2">
                          <Fingerprint className="h-4 w-4" /> Step 1: Technical Registry Creation
                      </h4>
                      <div className="max-w-md space-y-4">
                          <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Internal Technical ID (BR)</Label>
                              <Input 
                                  placeholder="Type the BR identity code..." 
                                  value={brIdentity} 
                                  onChange={(e) => setBrIdentity(e.target.value)}
                                  className="bg-background font-mono h-12"
                              />
                              <p className="text-[10px] text-muted-foreground italic">Mandatory: Create the identity in the registry before escalating for activation.</p>
                          </div>
                      </div>
                  </div>
              )}

              {/* Supervisor: Final Audit (Supervisor only) */}
              {user.role === 'supervisor' && application.status === 'Pending Supervisor' && (
                  <div className="mb-8 p-6 bg-green-500/5 rounded-xl border border-green-500/20 animate-in slide-in-from-top-4">
                      <h4 className="text-xs font-black uppercase text-green-600 tracking-widest mb-4 flex items-center gap-2">
                          <Key className="h-4 w-4" /> Step 2: Regulatory Audit & Authorization
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                          <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Linked Identity</Label>
                              <div className="h-12 flex items-center px-4 bg-muted rounded border font-mono text-sm">{application.details.brIdentity}</div>
                          </div>
                          <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase text-green-600">Wallet Activation Code</Label>
                              <Input 
                                  placeholder="Enter authorization code..." 
                                  value={activationCode} 
                                  onChange={(e) => setActivationCode(e.target.value)}
                                  className="bg-background font-mono h-12"
                              />
                          </div>
                      </div>
                  </div>
              )}

              {/* ASL: Final Dispatch Summary (Visible only to ASL when finalized) */}
              {(user.role === 'asl' && application.status === 'Archived' && application.details.isDispatched) && (
                  <div className="mb-8 p-6 bg-primary/10 rounded-xl border border-primary/30 shadow-xl animate-in zoom-in-95">
                      <div className="flex items-center gap-4 mb-6">
                          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                              <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div>
                              <h4 className="text-lg font-black uppercase tracking-tight text-primary leading-none">Account Ready</h4>
                              <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest mt-1">Processed & Dispatched from Back Office</p>
                          </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="bg-background border-primary/20 shadow-sm">
                              <CardContent className="p-4 flex items-center gap-4">
                                  <Wallet className="h-8 w-8 text-primary" />
                                  <div>
                                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Wallet Account #</p>
                                      <p className="text-xl font-mono font-black text-foreground">{application.details.accountNumber}</p>
                                  </div>
                              </CardContent>
                          </Card>
                          <Card className="bg-background border-primary/20 shadow-sm">
                              <CardContent className="p-4 flex items-center gap-4">
                                  <Fingerprint className="h-8 w-8 text-primary" />
                                  <div>
                                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Technical Registry ID</p>
                                      <p className="text-xl font-mono font-black text-foreground">{application.details.brIdentity}</p>
                                  </div>
                              </CardContent>
                          </Card>
                      </div>
                  </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-muted/50 p-1 mb-6">
                      <TabsTrigger value="form-data"><FileEdit className="mr-2 h-4 w-4"/>Account Details</TabsTrigger>
                      <TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4"/>Technical Documents</TabsTrigger>
                      <TabsTrigger value="history"><History className="mr-2 h-4 w-4"/>Registry Log</TabsTrigger>
                      <TabsTrigger value="comments"><MessageSquare className="mr-2 h-4 w-4"/>Internal Notes</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="form-data" className="pt-2">
                      <Card>
                          <CardContent className="pt-6 space-y-8">
                              {/* High-level status summary for Account Details */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted/20 rounded-lg border border-primary/5">
                                  <DetailItem label="Technical Classification" value={application.clientType} />
                                  <DetailItem label="Operating Province" value={application.region} />
                                  <DetailItem label="Registry Status" value={application.status} />
                              </div>
                              <Separator />
                              {/* Full record details */}
                              <div className="space-y-6">
                                {isPersonalOrIndividual ? <StepIndividualInfo /> : <StepCorporateInfo />}
                                {needsMandate && <div className="mt-8"><StepSignatories /></div>}
                              </div>
                          </CardContent>
                      </Card>
                  </TabsContent>

                  <TabsContent value="documents" className="pt-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-widest">Mandatory Checklist</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {documentRequirements.map((req) => { 
                                        const isUploaded = uploadedDocumentTypes.includes(req.document); 
                                        return (
                                            <li key={req.document} className="flex items-start">
                                                {isUploaded ? <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5" /> : <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />}
                                                <div className="text-sm font-medium leading-tight">{req.document}</div>
                                            </li>
                                        ); 
                                    })}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-widest">Electronic Files</CardTitle></CardHeader>
                            <CardContent>
                                {application.documents.length > 0 ? (
                                    <ul className="space-y-3">
                                        {application.documents.map(doc => (
                                            <li key={doc.type} className="flex items-center justify-between p-3 rounded-md border border-primary/10 bg-muted/20">
                                                <div><p className="text-sm font-bold leading-none">{doc.type}</p><p className="text-[10px] text-muted-foreground mt-1">{doc.fileName}</p></div>
                                                <Button variant="outline" size="sm" onClick={() => setPreviewDoc(doc)}><Eye className="mr-2 h-4 w-4" />View</Button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <div className="text-sm text-center py-12 text-muted-foreground">No documents uploaded.</div>}
                            </CardContent>
                        </Card>
                    </div>
                  </TabsContent>
                  <TabsContent value="history" className="pt-2">
                      <Card>
                          <CardContent className="pt-6">
                              <ul className="space-y-6">
                                  {application.history.map((entry, index) => (
                                      <li key={index} className="flex items-start">
                                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border font-bold text-[10px]">{index + 1}</div>
                                          <div className="ml-4 flex-1">
                                              <p className="text-sm font-bold uppercase tracking-tight">{entry.action} <span className="text-[10px] font-normal text-muted-foreground lowercase ml-2">by {entry.user}</span></p>
                                              <p className="text-[10px] text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                                              {entry.notes && <p className="text-xs mt-2 p-3 bg-muted rounded-md italic text-muted-foreground border-l-2 border-primary/20">{entry.notes}</p>}
                                          </div>
                                      </li>
                                  ))}
                              </ul>
                          </CardContent>
                      </Card>
                  </TabsContent>
                  <TabsContent value="comments" className="pt-2">
                      <Card>
                          <CardContent className="pt-6 space-y-6">
                              <div className="space-y-4">
                                  {application.comments.map((comment) => (
                                      <div key={comment.id} className="flex items-start gap-3">
                                          <Avatar className="h-8 w-8"><AvatarFallback className="text-[10px]">{comment.user.substring(0,2)}</AvatarFallback></Avatar>
                                          <div className="flex-1 rounded-lg border bg-card p-4">
                                              <div className="flex justify-between items-center mb-1">
                                                  <p className="font-bold text-sm uppercase">{comment.user}</p>
                                                  <p className="text-[10px] text-muted-foreground">{new Date(comment.timestamp).toLocaleString()}</p>
                                              </div>
                                              <p className="text-sm">{comment.content}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                              {application.status !== 'Archived' && (
                                  <div className="space-y-3 pt-4 border-t">
                                      <Textarea placeholder="Type internal registry note..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="min-h-[100px]" />
                                      <Button onClick={handleAddComment} className="w-full">Post Note</Button>
                                  </div>
                              )}
                          </CardContent>
                      </Card>
                  </TabsContent>
              </Tabs>
          </CardContent>
        </Card>

        <AlertDialog open={isRejecting} onOpenChange={setIsRejecting}>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Regulatory Decline</AlertDialogTitle><AlertDialogDescription>Select a compliance reason for declining this record.</AlertDialogDescription></AlertDialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase">Decline Reason</Label>
                        <Select onValueChange={setRejectionReason} value={rejectionReason}>
                            <SelectTrigger><SelectValue placeholder="Select outcome..." /></SelectTrigger>
                            <SelectContent>{rejectionReasons.map(reason => (<SelectItem key={reason} value={reason}>{reason}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase">Supporting Notes</Label>
                        <Textarea placeholder="Detailed audit notes..." value={rejectionComment} onChange={(e) => setRejectionComment(e.target.value)} />
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRejection} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={!rejectionReason || !rejectionComment}>Confirm Decline</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
                <DialogHeader><DialogTitle className="text-sm uppercase font-black tracking-widest">{previewDoc?.type}</DialogTitle></DialogHeader>
                <div className="flex-1 bg-black rounded-md overflow-hidden relative flex items-center justify-center">
                    {previewDoc?.url && previewDoc.url !== '#' ? (
                        previewDoc.url.includes('application/pdf') || previewDoc.fileName.toLowerCase().endsWith('.pdf') ? (
                            <iframe src={previewDoc.url} className="w-full h-full" />
                        ) : <img src={previewDoc.url} alt="Document" className="max-w-full max-h-full object-contain" />
                    ) : <div className="text-muted-foreground p-12 text-center italic">Document preview not available for mock data.</div>}
                </div>
            </DialogContent>
        </Dialog>

        <Dialog open={isDispatching} onOpenChange={setIsDispatching}>
            <DialogContent className="bg-card border-primary/20">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 uppercase tracking-tight"><Send className="h-5 w-5 text-primary" /> Record Finalization</DialogTitle>
                    <CardDescription>Authorization Code confirmed. Enter the final Wallet Account Number to dispatch to Sales.</CardDescription>
                </DialogHeader>
                <div className="py-6 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest">Wallet Account Number</Label>
                        <Input 
                            placeholder="e.g. 1002345678"
                            value={dispatchAccountNumber}
                            onChange={(e) => setDispatchAccountNumber(e.target.value)}
                            className="h-12 text-lg font-mono"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDispatching(false)}>Cancel</Button>
                    <Button onClick={handleDispatchAccount} className="bg-primary text-primary-foreground font-black">Dispatch to ASL</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </FormProvider>
  );
}
