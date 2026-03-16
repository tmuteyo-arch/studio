
'use client';

import * as React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAtom } from 'jotai';
import { Application, applicationsAtom, Comment, HistoryLog, OnboardingFormData, Document } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Archive, ArrowLeft, Check, FileText, History, User, X, MessageSquare, Download, Send, CornerUpLeft, CheckCircle2, AlertCircle, Loader2, Wand2, FileEdit, FileSignature, Eraser, UserCheck, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '../ui/textarea';
import ApplicationPrintView from './application-print-view';
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
import { generateApplicationSummary } from '@/lib/actions';
import { Alert, AlertDescription as AlertDescriptionComponent, AlertTitle as AlertTitleComponent } from '../ui/alert';
import StepCorporateInfo from './steps/step-corporate-info';
import StepSignatories from './steps/step-signatories';
import StepIndividualInfo from './steps/step-individual-info';
import AccountResolutionPrintView from './account-resolution-print-view';
import SignatureCanvas from 'react-signature-canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

const SignatureField = ({ onSave }: { onSave: (data: string) => void }) => {
  const sigPadRef = React.useRef<SignatureCanvas | null>(null);

  const handleClear = () => sigPadRef.current?.clear();
  
  const handleSave = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataUrl = sigPadRef.current.toDataURL();
      onSave(dataUrl);
    } else {
      alert("Please provide a signature first.");
    }
  };

  return (
    <div className="space-y-2">
      <Label>Your Digital Signature</Label>
      <div className="w-full border rounded-md bg-white p-2">
        <SignatureCanvas ref={sigPadRef} penColor="black" canvasProps={{ className: 'w-full h-32' }} />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleClear}><Eraser className="mr-2 h-4 w-4" />Clear</Button>
        <Button type="button" size="sm" onClick={handleSave}>Confirm Signature</Button>
      </div>
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
  const [activeTab, setActiveTab] = React.useState("details");

  const [isRejecting, setIsRejecting] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [rejectionComment, setRejectionComment] = React.useState('');
  
  const [isGeneratingSummary, setIsGeneratingSummary] = React.useState(false);
  const [aiSummary, setAiSummary] = React.useState<string | null>(null);
  
  const [previewDoc, setPreviewDoc] = React.useState<Document | null>(null);

  const isCorporate = !['Personal Account', 'Proprietorship / Sole Trader'].includes(application.clientType);
  const isPersonalOrIndividual = ['Personal Account', 'Proprietorship / Sole Trader'].includes(application.clientType);
  const needsMandate = application.clientType !== 'Personal Account';
  
  const uploadedDocumentTypes = application.documents.map(d => d.type);
  const documentRequirements = getDocumentRequirements(application.clientType);

  const form = useForm<OnboardingFormData>({ defaultValues: application.details });

  const handleUpdateApplication = (newData: Partial<Application>) => {
    setApplications(prev => prev.map(app => 
      app.id === application.id 
      ? { ...app, ...newData, lastUpdated: new Date().toISOString(), details: { ...app.details, ...form.getValues() } } 
      : app
    ));
    setApplication(prev => ({...prev, ...newData}));
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

     if (status === 'Signed' || status === 'Rejected' || status === 'Pending Supervisor' || status === 'Returned to ATL' || status === 'Archived') {
        setTimeout(() => onBack(), 500);
    }
  };

  const handleClaimLead = () => {
    const newHistoryLog: HistoryLog = {
        action: 'Application Accepted & Verified',
        user: user.name,
        timestamp: new Date().toISOString(),
        notes: `ASL team has verified the customer sign up and forwarded it to Back Office.`,
    };
    handleUpdateApplication({
        submittedBy: user.name,
        status: 'Submitted',
        history: [...application.history, newHistoryLog]
    });
    toast({
        title: "Sign Up Accepted",
        description: "Customer sign up has been accepted and forwarded to Back Office.",
    });
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

  const handleFcbStatusChange = (fcbStatus: Application['fcbStatus']) => {
     handleUpdateApplication({ fcbStatus });
  };

  const handleAddComment = () => {
    if (newComment.trim() === '') return;
    const newCommentObject: Comment = { id: `c${Date.now()}`, user: user.name, role: user.role as any, timestamp: new Date().toISOString(), content: newComment.trim() };
    handleUpdateApplication({ comments: [...application.comments, newCommentObject] });
    setNewComment('');
  };

  const handleDownloadPdf = async () => {
    const checklistElement = checklistRef.current;
    const summaryElement = printRef.current;
    const resolutionElement = resolutionRef.current;

    if (!summaryElement) { console.error("Required print element not found"); return; }
    setIsPrinting(true);
    
    const appDataForPrint = { ...application, details: { ...application.details, ...form.getValues() } };
    setApplication(appDataForPrint);
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
    await addCanvasToPdf(summaryElement);

    pdf.save(`Application-${application.id}.pdf`);
    setIsPrinting(false);
  };

  const handleSupervisorSign = (signatureData: string) => {
    const newDetails = { ...application.details, supervisorSignature: signatureData, supervisorSignatureTimestamp: new Date().toISOString() };
    const newHistoryLog: HistoryLog = { action: 'Agreement Finalized by Supervisor', user: user.name, timestamp: new Date().toISOString() };
    handleUpdateApplication({ details: newDetails, status: 'Signed', history: [...application.history, newHistoryLog] });
    toast({ title: "Agreement Finalized", description: "Agency agreement has been signed and finalized."});
    setTimeout(() => onBack(), 500);
  };


  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    setAiSummary(null);
    const summaryInput = { clientType: application.clientType, clientName: application.clientName, status: application.status, fcbStatus: application.fcbStatus, documents: application.documents, history: application.history };
    const result = await generateApplicationSummary(summaryInput);
    setIsGeneratingSummary(false);
    if (result.success && result.data) {
      setAiSummary(result.data.summary);
      toast({ title: 'AI Summary Generated', description: 'The application summary and risk assessment is ready.' });
    } else {
      toast({ variant: 'destructive', title: 'Summary Failed', description: result.error || 'Could not generate AI summary.' });
    }
  };

  const renderActions = () => {
    const isSalesRole = user.role === 'asl';
    
    switch (user.role) {
      case 'asl':
        if (application.submittedBy === 'Customer' && application.status === 'Submitted') {
            return <Button onClick={handleClaimLead}><UserCheck className="mr-2 h-4 w-4" />Accept & Claim Sign Up</Button>;
        }
        return null;
      case 'back-office':
        if (application.status === 'Signed') {
            return <div className="space-x-2"><Button onClick={() => handleStatusChange('Archived')}><Archive className="mr-2 h-4 w-4" />Archive Record</Button></div>;
        }
        if (['Archived', 'Pending Supervisor', 'Rejected'].includes(application.status)) return null;
        if(application.status === 'Submitted' || application.status === 'Returned to ATL') {
            return <div className="space-x-2"><Button variant="outline" onClick={() => handleStatusChange('Returned to ATL')}><CornerUpLeft className="mr-2 h-4 w-4" />Return to ASL</Button><Button onClick={() => handleStatusChange('Pending Supervisor')}><Send className="mr-2 h-4 w-4" />Send to Supervisor</Button></div>;
        }
        return null;
      case 'supervisor':
        if(application.status === 'Pending Supervisor') {
            return <div className="space-x-2">
                <Button variant="destructive" onClick={() => setIsRejecting(true)}><X className="mr-2 h-4 w-4" />Reject</Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => setActiveTab('sign-agreement')}><FileSignature className="mr-2 h-4 w-4" />Review & Sign Agreement</Button>
            </div>;
        }
        return null;
      default: return null;
    }
  };
  
  const supervisorForChecklist = application.history.find(h => h.action.includes('Supervisor'))?.user;
  const applicationForPrint = { ...application, details: { ...application.details, ...form.getValues() }};
  const isSigningStep = user.role === 'supervisor' && application.status === 'Pending Supervisor';
  const isSalesRole = user.role === 'asl';

  return (
    <FormProvider {...form}>
      <div>
          <div className="mb-6 flex items-center justify-between">
              <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Button>
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
                    {isCorporate && <div ref={checklistRef}><CorporateChecklist application={applicationForPrint} supervisor={supervisorForChecklist} /></div>}
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
                <Badge variant={ application.status === 'Signed' ? 'success' : application.status === 'Rejected' ? 'destructive' : 'secondary'}>{application.status}</Badge>
                {application.submittedBy === 'Customer' && <Badge variant="outline" className="bg-blue-50 text-blue-700">Self-Service Sign Up</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
              <div className='flex justify-end mb-4'>
                  <Button variant="secondary" onClick={handleGenerateSummary} disabled={isGeneratingSummary}>{isGeneratingSummary ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}{isGeneratingSummary ? 'Generating...' : 'Generate AI Summary'}</Button>
              </div>
              
              {aiSummary && (<Alert className="mb-6 bg-secondary/50"><Wand2 className="h-4 w-4" /><AlertTitleComponent>AI Summary & Risk Assessment</AlertTitleComponent><AlertDescriptionComponent>{aiSummary}</AlertDescriptionComponent></Alert>)}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList>
                      <TabsTrigger value="details"><User className="mr-2 h-4 w-4"/>Mandatory Details</TabsTrigger>
                      {(user.role === 'back-office' || (isSalesRole && application.submittedBy !== 'Customer')) && <TabsTrigger value="form-data"><FileEdit className="mr-2 h-4 w-4"/>Edit Form</TabsTrigger>}
                      <TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4"/>Documents</TabsTrigger>
                      <TabsTrigger value="history"><History className="mr-2 h-4 w-4"/>Activity Log</TabsTrigger>
                      <TabsTrigger value="comments"><MessageSquare className="mr-2 h-4 w-4"/>Comments</TabsTrigger>
                      {isSigningStep && <TabsTrigger value="sign-agreement"><FileSignature className="mr-2 h-4 w-4" />Sign Agreement</TabsTrigger>}
                  </TabsList>
                  <TabsContent value="details" className="pt-4">
                    <Card>
                      <CardHeader><CardTitle>Mandatory Application Details</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <DetailItem label="Client Name" value={application.clientName} />
                          <DetailItem label="Client Type" value={application.clientType} />
                          <DetailItem label="Originating Submitter" value={application.submittedBy} />
                          <DetailItem label="Region" value={application.region} />
                          <DetailItem label="Submission Date" value={application.submittedDate} />
                          <DetailItem label="Status" value={application.status} />
                        </div>
                        <Separator/>
                        {isPersonalOrIndividual ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Full Name" value={`${application.details.individualFirstName} ${application.details.individualSurname}`} />
                            <DetailItem label="ID Number" value={application.details.individualIdNumber} />
                            <DetailItem label="Address" value={application.details.individualAddress} />
                            <DetailItem label="Mobile" value={application.details.individualMobileNumber} />
                            <DetailItem label="Date of Birth" value={application.details.individualDateOfBirth} />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Legal Name" value={application.details.organisationLegalName} />
                            <DetailItem label="Reg. Number" value={application.details.certificateOfIncorporationNumber} />
                            <DetailItem label="Inc. Date" value={application.details.dateOfIncorporation} />
                            <DetailItem label="Address" value={application.details.physicalAddress} />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    {user.role === 'back-office' && (
                      <Card className="mt-6">
                        <CardHeader><CardTitle>FCB Safety Check</CardTitle><CardDescription>Confirm the applicant's status from the Financial Clearing Bureau.</CardDescription></CardHeader>
                        <CardContent>
                          <RadioGroup defaultValue={application.fcbStatus} onValueChange={(value: Application['fcbStatus']) => handleFcbStatusChange(value)} className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center space-x-3 space-y-0"><RadioGroupItem value="Inclusive" id="fcb-inclusive" /><Label htmlFor="fcb-inclusive" className="font-normal">Inclusive</Label></div>
                            <div className="flex items-center space-x-3 space-y-0"><RadioGroupItem value="Good" id="fcb-good" /><Label htmlFor="fcb-good" className="font-normal">Good</Label></div>
                            <div className="flex items-center space-x-3 space-y-0"><RadioGroupItem value="Adverse" id="fcb-adverse" /><Label htmlFor="fcb-adverse" className="font-normal">Adverse</Label></div>
                            <div className="flex items-center space-x-3 space-y-0"><RadioGroupItem value="Prior Adverse" id="fcb-prior-adverse" /><Label htmlFor="fcb-prior-adverse" className="font-normal">Prior Adverse</Label></div>
                            <div className="flex items-center space-x-3 space-y-0"><RadioGroupItem value="PEP" id="fcb-pep" /><Label htmlFor="fcb-pep" className="font-normal">PEP</Label></div>
                          </RadioGroup>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                   {(user.role === 'back-office' || (isSalesRole && application.submittedBy !== 'Customer')) && (
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
                  <TabsContent value="documents" className="pt-4"><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Card><CardHeader><CardTitle>Document Checklist</CardTitle></CardHeader><CardContent><ul className="space-y-3">{documentRequirements.map((req) => { const isUploaded = uploadedDocumentTypes.includes(req.document); return (<li key={req.document} className="flex items-center">{isUploaded ? (<CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />) : (<AlertCircle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />)}<div><p className="font-medium">{req.document}</p></div></li>); })}</ul></CardContent></Card><Card><CardHeader><CardTitle>Uploaded Documents</CardTitle></CardHeader><CardContent>{application.documents.length > 0 ? (<ul className="space-y-3">{application.documents.map(doc => (<li key={doc.type} className="flex items-center justify-between p-3 rounded-md border"><div><p className="font-medium">{doc.type}</p><p className="text-sm text-muted-foreground">{doc.fileName}</p></div><Button variant="outline" size="sm" onClick={() => setPreviewDoc(doc)}><Eye className="mr-2 h-4 w-4" />View</Button></li>))}</ul>) : (<p className="text-sm text-muted-foreground text-center py-8">No documents uploaded.</p>)}</CardContent></Card></div></TabsContent>
                  <TabsContent value="history" className="pt-4"><Card><CardHeader><CardTitle>Activity Log</CardTitle></CardHeader><CardContent><ul className="space-y-4">{application.history.map((entry, index) => (<li key={index} className="flex items-start"><div className="flex-shrink-0"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">{entry.action.includes('Submitted') ? <FileText className="h-5 w-5"/> : <User className="h-5 w-5"/>}</div></div><div className="ml-4"><p className="font-medium">{entry.action} by {entry.user}</p><p className="text-sm text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>{entry.notes && <p className="text-sm mt-1 p-2 bg-muted/50 rounded-md">{entry.notes}</p>}</div></li>))}</ul></CardContent></Card></TabsContent>
                  <TabsContent value="comments" className="pt-4"><Card><CardHeader><CardTitle>Internal Comments</CardTitle></CardHeader><CardContent className="space-y-6"><div className="space-y-4">{application.comments.map((comment) => (<div key={comment.id} className="flex items-start gap-3"><Avatar className="h-8 w-8"><AvatarFallback>{comment.user.substring(0,2)}</AvatarFallback></Avatar><div className="flex-1 rounded-md border bg-card p-3"><div className="flex justify-between items-center"><p className="font-semibold text-sm">{comment.user} <span className="text-xs font-normal text-muted-foreground capitalize">({comment.role.replace('-', ' ')})</span></p><p className="text-xs text-muted-foreground">{new Date(comment.timestamp).toLocaleString()}</p></div><p className="text-sm mt-1">{comment.content}</p></div></div>))}{application.comments.length === 0 && (<p className="text-sm text-center text-muted-foreground py-4">No comments.</p>)}</div>{application.status !== 'Signed' && (<div className="space-y-2"><Textarea placeholder="Type your comment here..." value={newComment} onChange={(e) => setNewComment(e.target.value)} /><Button onClick={handleAddComment}>Add Comment</Button></div>)}</CardContent></Card></TabsContent>
                   {isSigningStep && (
                       <TabsContent value="sign-agreement" className="pt-4"><Card>
                           <CardHeader><CardTitle>Sign Agency Agreement</CardTitle></CardHeader>
                           <CardContent className="space-y-6">
                               <div className="scale-75 origin-top-left">
                                   {needsMandate ? (
                                       <AccountResolutionPrintView application={applicationForPrint} />
                                   ) : (
                                       <div className="p-8 border bg-white text-black min-h-[200px] w-[210mm]">
                                           <h2 className="text-xl font-bold mb-4">Agency Approval: {application.clientName}</h2>
                                           <p>Onboarding approval for Personal/Individual account type.</p>
                                           <div className="mt-8 grid grid-cols-2 gap-4">
                                               <DetailItem label="Full Name" value={`${application.details.individualFirstName} ${application.details.individualSurname}`} />
                                               <DetailItem label="ID Number" value={application.details.individualIdNumber} />
                                           </div>
                                       </div>
                                   )}
                               </div>
                               <Separator />
                                <div className="max-w-md">
                                    <SignatureField onSave={handleSupervisorSign} />
                                </div>
                           </CardContent>
                       </Card></TabsContent>
                   )}
              </Tabs>
          </CardContent>
        </Card>

        <AlertDialog open={isRejecting} onOpenChange={setIsRejecting}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Reject Application</AlertDialogTitle><AlertDialogDescription>Please provide a reason for rejection.</AlertDialogDescription></AlertDialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label htmlFor="rejection-reason">Rejection Reason</Label><Select onValueChange={setRejectionReason} value={rejectionReason}><SelectTrigger id="rejection-reason"><SelectValue placeholder="Select a reason" /></SelectTrigger><SelectContent>{rejectionReasons.map(reason => (<SelectItem key={reason} value={reason}>{reason}</SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="rejection-comment">Comment</Label><Textarea id="rejection-comment" placeholder="Explanation..." value={rejectionComment} onChange={(e) => setRejectionComment(e.target.value)} /></div></div><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleRejection} disabled={!rejectionReason || !rejectionComment}>Confirm Rejection</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

        <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{previewDoc?.type}: {previewDoc?.fileName}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 bg-muted rounded-md overflow-hidden relative flex items-center justify-center min-h-0">
                    {previewDoc?.url && previewDoc.url !== '#' ? (
                        previewDoc.url.includes('application/pdf') || previewDoc.fileName.toLowerCase().endsWith('.pdf') ? (
                            <object data={previewDoc.url} type="application/pdf" className="w-full h-full">
                                <div className="p-12 text-center">
                                    <FileText className="h-16 w-16 mx-auto opacity-20 mb-4" />
                                    <p>Viewing PDF content...</p>
                                    <Button asChild variant="outline" className="mt-4"><a href={previewDoc.url} download={previewDoc.fileName}><Download className="mr-2 h-4 w-4" />Download to View</a></Button>
                                </div>
                            </object>
                        ) : (
                            <img src={previewDoc.url} alt="Document" className="max-w-full max-h-full object-contain" />
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground p-12">
                            <FileText className="h-12 w-12 mb-4 opacity-20" />
                            <p>No preview available for this mock document.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>

      </div>
    </FormProvider>
  );
}
