'use client';

import * as React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAtom } from 'jotai';
import { Application, applicationsAtom, Comment, HistoryLog, OnboardingFormData, Document } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Archive, ArrowLeft, Check, FileText, History, User, X, MessageSquare, Download, CornerUpLeft, CheckCircle2, AlertCircle, Loader2, Wand2, FileEdit, FileSignature, Eraser, UserCheck, Eye, ShieldCheck, ShieldAlert, Upload, ShieldQuestion, Send, Key, Fingerprint } from 'lucide-react';
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
  
  const [activeTab, setActiveTab] = React.useState("details");

  const [isRejecting, setIsRejecting] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [rejectionComment, setRejectionComment] = React.useState('');
  
  const [previewDoc, setPreviewDoc] = React.useState<Document | null>(null);

  // New Workflow States
  const [brIdentity, setBrIdentity] = React.useState(application.details.brIdentity || '');
  const [activationCode, setActivationCode] = React.useState(application.details.activationCode || '');
  const [dispatchAccountNumber, setDispatchAccountNumber] = React.useState('');
  const [isDispatching, setIsDispatching] = React.useState(false);

  // Sole Trader is grouped with Personal categories for detail rendering
  const isPersonalOrIndividual = ['Individual Accounts', 'Minors', 'Sole Trader'].includes(application.clientType);
  const isCorporate = !isPersonalOrIndividual;
  const needsMandate = !isPersonalOrIndividual;
  
  const uploadedDocumentTypes = application.documents.map(d => d.type);
  const documentRequirements = getDocumentRequirements(application.clientType);
  const missingDocs = documentRequirements.filter(req => !uploadedDocumentTypes.includes(req.document));
  const isMissingDocs = missingDocs.length > 0;
  
  const hasFcbReport = application.documents.some(d => d.type === 'FCB Report');

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
      notes: status === 'Returned to ATL' ? `Returned to ASL: ${notes}` : notes,
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
        toast({ variant: 'destructive', title: 'Action Required', description: 'Please provide the BR Identity first.' });
        return;
    }
    const notes = `BR Identity: ${brIdentity} created in legacy system. Forwarded for final audit.`;
    handleUpdateApplication({ 
        status: 'Pending Supervisor', 
        details: { ...application.details, brIdentity },
        history: [...application.history, { action: 'BR Identity Created', user: user.name, timestamp: new Date().toISOString(), notes }] 
    });
    toast({ title: "Forwarded to Supervisor", description: "Identity data has been sent for final audit." });
    setTimeout(() => onBack(), 500);
  };

  const handleSupervisorApproval = () => {
    if (!activationCode) {
        toast({ variant: 'destructive', title: 'Action Required', description: 'Please provide the Wallet Activation Code.' });
        return;
    }
    const notes = `Supervisor Audit Passed. Activation Code: ${activationCode} issued to Back Office.`;
    handleUpdateApplication({ 
        status: 'Approved', 
        details: { ...application.details, activationCode },
        history: [...application.history, { action: 'Approved & Activation Code Issued', user: user.name, timestamp: new Date().toISOString(), notes }] 
    });
    toast({ title: "Audit Approved", description: "Activation code has been issued to the Back Office team." });
    setTimeout(() => onBack(), 500);
  };

  const handleDispatchAccount = () => {
    if (!dispatchAccountNumber) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter an account number.' });
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
        notes: `Account Details [${dispatchAccountNumber}] forwarded to ASL digitally. Activation Code [${application.details.activationCode}] utilized.`
    };

    handleUpdateApplication({ status: 'Archived', details: newDetails, history: [...application.history, newHistoryLog] });
    toast({ title: "Account Created & Dispatched", description: `Account number ${dispatchAccountNumber} has been finalized and archived.` });
    setIsDispatching(false);
    setTimeout(() => onBack(), 500);
  };

  const handleRejection = () => {
    if (!rejectionReason || !rejectionComment) {
        toast({ variant: 'destructive', title: 'Rejection Failed', description: 'Please select a reason and provide a comment.' });
        return;
    }
    const notes = `Reason: ${rejectionReason} - ${rejectionComment}`;
    handleStatusChange('Rejected', notes);
    setIsRejecting(false);
    setRejectionReason('');
    setRejectionComment('');
  };

  const handleAddComment = () => {
    if (newComment.trim() === '') return;
    const newCommentObject: Comment = { id: `c${Date.now()}`, user: user.name, role: user.role as any, timestamp: new Date().toISOString(), content: newComment.trim() };
    handleUpdateApplication({ comments: [...application.comments, newCommentObject] });
    setNewComment('');
  };

  const handleDownloadPdf = async () => {
    const summaryElement = printRef.current;
    const resolutionElement = resolutionRef.current;
    const checklistElement = checklistRef.current;
    const agencyElement = agencyAgreementRef.current;
    const adlaElement = adlaRef.current;

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
    
    if (resolutionElement && needsMandate) await addCanvasToPdf(resolutionElement);
    if (isCorporate && checklistElement) await addCanvasToPdf(checklistElement);
    if (isCorporate && agencyElement) await addCanvasToPdf(agencyElement);
    if (isCorporate && adlaElement) await addCanvasToPdf(adlaElement);
    await addCanvasToPdf(summaryElement);

    pdf.save(`Application-${application.id}.pdf`);
    setIsPrinting(false);
  };

  const renderActions = () => {
    switch (user.role) {
      case 'back-office':
        if (application.status === 'Approved') {
            return <Button onClick={() => setIsDispatching(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg"><Send className="mr-2 h-4 w-4" />Create Account & Dispatch</Button>;
        }
        if (application.status === 'Submitted' || application.status === 'Returned to ATL') {
            return (
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleStatusChange('Returned to ATL')}><CornerUpLeft className="mr-2 h-4 w-4" />Return to ASL</Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleForwardToSupervisor}>
                        <ShieldCheck className="mr-2 h-4 w-4" /> Forward to Supervisor
                    </Button>
                </div>
            );
        }
        return null;
      case 'supervisor':
        if (application.status === 'Pending Supervisor') {
            return (
                <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => setIsRejecting(true)}><X className="mr-2 h-4 w-4" />Reject</Button>
                    <Button variant="outline" onClick={() => handleStatusChange('Pending Compliance')}><ShieldAlert className="mr-2 h-4 w-4" />Escalate to Compliance</Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleSupervisorApproval}>
                        <Check className="mr-2 h-4 w-4" /> Approve & Issue Code
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
              <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
              <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleDownloadPdf} disabled={isPrinting}><Download className="mr-2 h-4 w-4" />{isPrinting ? 'Generating...' : 'Download PDF'}</Button>
                  {renderActions()}
              </div>
          </div>
          <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
            <div ref={printRef}><ApplicationPrintView application={applicationForPrint} /></div>
            {needsMandate && (
                <>
                    <div ref={resolutionRef}><AccountResolutionPrintView application={applicationForPrint} /></div>
                    {isCorporate && (
                        <>
                            <div ref={checklistRef}><CorporateChecklist application={applicationForPrint} /></div>
                            <div ref={agencyAgreementRef}><AgencyAgreementPrintView data={applicationForPrint.details} /></div>
                            <div ref={adlaRef}><AdlaDeclarationPrintView data={applicationForPrint.details} /></div>
                        </>
                    )}
                </>
            )}
          </div>
          
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                  <CardTitle>Review Record: {application.id}</CardTitle>
                  <CardDescription>Reviewing record for <strong>{application.clientName}</strong>.</CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={ application.status === 'Archived' ? 'success' : application.status === 'Rejected' ? 'destructive' : 'secondary'}>{application.status}</Badge>
                {application.details.isDispatched && <Badge className="bg-primary text-primary-foreground font-black">Account Finalized</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
              {/* Process Specific Workflow Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b pb-6">
                  {/* Back Office: Identity Creation */}
                  {(user.role === 'back-office' && (application.status === 'Submitted' || application.status === 'Returned to ATL')) && (
                      <Card className="border-primary/20 bg-primary/5 shadow-sm">
                          <CardHeader className="pb-2">
                              <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                  <Fingerprint className="h-4 w-4" /> Step 1: BR Identity Creation
                              </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              <div className="space-y-2">
                                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Generated BR Identity</Label>
                                  <Input 
                                      placeholder="Type the Identity Code from BR..." 
                                      value={brIdentity} 
                                      onChange={(e) => setBrIdentity(e.target.value)}
                                      className="bg-background font-mono"
                                  />
                                  <p className="text-[10px] text-muted-foreground italic">Mandatory: Create the record in the banking system before forwarding for audit.</p>
                              </div>
                          </CardContent>
                      </Card>
                  )}

                  {/* Supervisor: Final Audit & Code Issuance */}
                  {(user.role === 'supervisor' && application.status === 'Pending Supervisor') && (
                      <Card className="border-green-500/20 bg-green-500/5 shadow-sm">
                          <CardHeader className="pb-2">
                              <CardTitle className="text-xs font-black uppercase tracking-widest text-green-600 flex items-center gap-2">
                                  <Key className="h-4 w-4" /> Step 2: Supervisor Audit & Access
                              </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Identity Linked</Label>
                                      <p className="font-mono text-sm bg-muted p-2 rounded border border-white/10">{application.details.brIdentity}</p>
                                  </div>
                                  <div className="space-y-2">
                                      <Label className="text-[10px] font-bold uppercase text-green-600">Wallet Activation Code</Label>
                                      <Input 
                                          placeholder="Enter Access Code..." 
                                          value={activationCode} 
                                          onChange={(e) => setActivationCode(e.target.value)}
                                          className="bg-background font-mono"
                                      />
                                  </div>
                              </div>
                              <p className="text-[10px] text-muted-foreground italic">Providing this code grants the clerk final authority to create the wallet account.</p>
                          </CardContent>
                      </Card>
                  )}

                  {/* Summary for other roles */}
                  {(application.details.brIdentity || application.details.activationCode) && (
                      <div className="col-span-full flex gap-4">
                          {application.details.brIdentity && (
                              <Badge variant="outline" className="flex gap-2 items-center bg-muted/50 border-dashed">
                                  <Fingerprint className="h-3 w-3" /> BR ID: {application.details.brIdentity}
                              </Badge>
                          )}
                          {application.details.activationCode && (
                              <Badge variant="outline" className="flex gap-2 items-center bg-green-50 text-green-700 border-green-200">
                                  <Key className="h-3 w-3" /> Auth Code: {application.details.activationCode}
                              </Badge>
                          )}
                      </div>
                  )}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList>
                      <TabsTrigger value="details"><User className="mr-2 h-4 w-4"/>Identity Details</TabsTrigger>
                      {(user.role === 'back-office' || (user.role === 'asl' && application.status !== 'Archived')) && <TabsTrigger value="form-data"><FileEdit className="mr-2 h-4 w-4"/>Edit Form</TabsTrigger>}
                      <TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4"/>Documents</TabsTrigger>
                      <TabsTrigger value="history"><History className="mr-2 h-4 w-4"/>Log</TabsTrigger>
                      <TabsTrigger value="comments"><MessageSquare className="mr-2 h-4 w-4"/>Comments</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="pt-4">
                    <Card>
                      <CardHeader><CardTitle>Applicant Overview</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <DetailItem label="Technical Type" value={application.clientType} />
                          <DetailItem label="Originating User" value={application.submittedBy} />
                          <DetailItem label="Region" value={application.region} />
                          <DetailItem label="Status" value={application.status} />
                        </div>
                        <Separator/>
                        {isPersonalOrIndividual ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Full Name" value={`${application.details.individualFirstName} ${application.details.individualSurname}`} />
                            <DetailItem label="ID Number" value={application.details.individualIdNumber} />
                            <DetailItem label="Address" value={application.details.individualAddress} />
                            <DetailItem label="Mobile Number" value={application.details.individualMobileNumber} />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Legal Name" value={application.details.organisationLegalName} />
                            <DetailItem label="Reg. Number" value={application.details.certificateOfIncorporationNumber} />
                            <DetailItem label="Address" value={application.details.physicalAddress} />
                          </div>
                        )}
                        {application.details.isDispatched && (
                            <>
                                <Separator />
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                    <h4 className="text-xs font-bold uppercase text-primary tracking-widest mb-2 flex items-center gap-2">
                                        <ShieldCheck className="h-3 w-3" />
                                        Dispatched Account Number
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <DetailItem label="New Wallet Account" value={application.details.accountNumber} />
                                        <DetailItem label="Date Opened" value={application.details.accountOpeningDate ? new Date(application.details.accountOpeningDate).toLocaleString() : '-'} />
                                    </div>
                                </div>
                            </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                   {(user.role === 'back-office' || user.role === 'asl') && application.status !== 'Archived' && (
                       <TabsContent value="form-data" className="pt-4">
                           <Card>
                               <CardContent className="pt-6">
                                   {isPersonalOrIndividual ? <StepIndividualInfo /> : <StepCorporateInfo />}
                                   {needsMandate && (
                                       <div className="mt-6">
                                           <StepSignatories />
                                       </div>
                                   )}
                               </CardContent>
                           </Card>
                       </TabsContent>
                   )}
                  <TabsContent value="documents" className="pt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle>Checklist</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {documentRequirements.map((req) => { 
                                        const isUploaded = uploadedDocumentTypes.includes(req.document); 
                                        return (
                                            <li key={req.document} className="flex items-center">
                                                {isUploaded ? <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" /> : <AlertCircle className="h-5 w-5 text-amber-500 mr-3" />}
                                                <span className="text-sm font-medium">{req.document}</span>
                                            </li>
                                        ); 
                                    })}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Uploaded Files</CardTitle></CardHeader>
                            <CardContent>
                                {application.documents.length > 0 ? (
                                    <ul className="space-y-3">
                                        {application.documents.map(doc => (
                                            <li key={doc.type} className="flex items-center justify-between p-3 rounded-md border">
                                                <div><p className="text-sm font-bold">{doc.type}</p><p className="text-xs text-muted-foreground">{doc.fileName}</p></div>
                                                <Button variant="outline" size="sm" onClick={() => setPreviewDoc(doc)}><Eye className="mr-2 h-4 w-4" />View</Button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-center py-12 text-muted-foreground">No documents uploaded.</p>}
                            </CardContent>
                        </Card>
                    </div>
                  </TabsContent>
                  <TabsContent value="history" className="pt-4"><Card><CardHeader><CardTitle>Activity Registry</CardTitle></CardHeader><CardContent><ul className="space-y-4">{application.history.map((entry, index) => (<li key={index} className="flex items-start"><div className="flex-shrink-0"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">{entry.action.includes('Identity') ? <Fingerprint className="h-4 w-4"/> : <User className="h-4 w-4"/>}</div></div><div className="ml-4"><p className="text-sm font-bold">{entry.action} by {entry.user}</p><p className="text-[10px] text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>{entry.notes && <p className="text-xs mt-1 p-2 bg-muted/50 rounded-md">{entry.notes}</p>}</div></li>))}</ul></CardContent></Card></TabsContent>
                  <TabsContent value="comments" className="pt-4"><Card><CardHeader><CardTitle>Internal Audit Comments</CardTitle></CardHeader><CardContent className="space-y-6"><div className="space-y-4">{application.comments.map((comment) => (<div key={comment.id} className="flex items-start gap-3"><Avatar className="h-8 w-8"><AvatarFallback>{comment.user.substring(0,2)}</AvatarFallback></Avatar><div className="flex-1 rounded-md border bg-card p-3"><div className="flex justify-between items-center"><p className="font-semibold text-sm">{comment.user}</p><p className="text-xs text-muted-foreground">{new Date(comment.timestamp).toLocaleString()}</p></div><p className="text-sm mt-1">{comment.content}</p></div></div>))}</div>{application.status !== 'Archived' && (<div className="space-y-2"><Textarea placeholder="Type audit note..." value={newComment} onChange={(e) => setNewComment(e.target.value)} /><Button onClick={handleAddComment}>Add Note</Button></div>)}</CardContent></Card></TabsContent>
              </Tabs>
          </CardContent>
        </Card>

        <AlertDialog open={isRejecting} onOpenChange={setIsRejecting}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Reject Record</AlertDialogTitle><AlertDialogDescription>Please provide a compliance reason for rejection.</AlertDialogDescription></AlertDialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label>Reason</Label><Select onValueChange={setRejectionReason} value={rejectionReason}><SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger><SelectContent>{rejectionReasons.map(reason => (<SelectItem key={reason} value={reason}>{reason}</SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label>Comment</Label><Textarea placeholder="Details..." value={rejectionComment} onChange={(e) => setRejectionComment(e.target.value)} /></div></div><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleRejection} disabled={!rejectionReason || !rejectionComment}>Confirm Reject</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

        <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
                <DialogHeader><DialogTitle>{previewDoc?.type}</DialogTitle></DialogHeader>
                <div className="flex-1 bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
                    {previewDoc?.url && previewDoc.url !== '#' ? (
                        previewDoc.url.includes('application/pdf') || previewDoc.fileName.toLowerCase().endsWith('.pdf') ? (
                            <object data={previewDoc.url} type="application/pdf" className="w-full h-full" />
                        ) : <img src={previewDoc.url} alt="Document" className="max-w-full max-h-full object-contain" />
                    ) : <div className="text-muted-foreground p-12 text-center"><p>No preview for mock document.</p></div>}
                </div>
            </DialogContent>
        </Dialog>

        <Dialog open={isDispatching} onOpenChange={setIsDispatching}>
            <DialogContent className="bg-card border-primary/20">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-primary" /> Finalize & Dispatch</DialogTitle>
                    <CardDescription>Supervisor has issued Activation Code: <strong>{application.details.activationCode}</strong>. Enter the final Wallet Account Number.</CardDescription>
                </DialogHeader>
                <div className="py-6 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest">New Wallet Account #</Label>
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
                    <Button onClick={handleDispatchAccount} className="bg-primary text-primary-foreground font-black">Finalize & Dispatch</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </FormProvider>
  );
}
