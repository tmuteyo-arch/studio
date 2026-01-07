'use client';

import * as React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Application, Comment, HistoryLog } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Check, FileText, History, User, X, MessageSquare, Download, Send, CornerUpLeft, Mail, CheckCircle2, AlertCircle, Loader2, Wand2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '../ui/textarea';
import ApplicationPrintView from './application-print-view';
import { useToast } from '@/hooks/use-toast';
import { User as UserProfile } from '@/lib/users';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { getDocumentRequirements } from '@/lib/document-requirements';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { FormItem } from '../ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { rejectionReasons } from '@/lib/types';
import CorporateChecklist from './corporate-checklist';
import { Badge } from '@/components/ui/badge';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { generateApplicationSummary } from '@/lib/actions';
import { Alert, AlertDescription as AlertDescriptionComponent, AlertTitle as AlertTitleComponent } from '../ui/alert';


interface ApplicationReviewProps {
  application: Application;
  onBack: () => void;
  user: UserProfile;
}

const DetailItem = ({ label, value }: { label: string; value: string | undefined }) => (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || '-'}</p>
    </div>
);

export default function ApplicationReview({ application: initialApplication, onBack, user }: ApplicationReviewProps) {
  const { toast } = useToast();
  const { firestore } = useFirestore();
  const [application, setApplication] = React.useState(initialApplication);
  const [newComment, setNewComment] = React.useState('');
  const [isPrinting, setIsPrinting] = React.useState(false);
  const printRef = React.useRef<HTMLDivElement>(null);
  const checklistRef = React.useRef<HTMLDivElement>(null);

  const [brNumber, setBrNumber] = React.useState('');
  const [walletAccount, setWalletAccount] = React.useState('');
  const [isRejecting, setIsRejecting] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [rejectionComment, setRejectionComment] = React.useState('');
  
  const [isGeneratingSummary, setIsGeneratingSummary] = React.useState(false);
  const [aiSummary, setAiSummary] = React.useState<string | null>(null);

  const documentRequirements = getDocumentRequirements(application.clientType);
  const uploadedDocumentTypes = application.documents.map(d => d.type);

  const handleStatusChange = async (status: Application['status'], notes?: string) => {
    // With mock data, we just update the state
    const newHistoryLog: HistoryLog = {
      action: status,
      user: user.name,
      timestamp: new Date().toISOString(),
      notes: notes,
    };
    
    setApplication(prev => ({
        ...prev,
        status: status,
        history: [...prev.history, newHistoryLog],
        lastUpdated: new Date().toISOString(),
    }));

    toast({
        title: `Application ${status}`,
        description: `Application for ${application.clientName} has been updated.`,
    });

    if (status === 'Approved' || status === 'Rejected' || status === 'Pending Supervisor' || status === 'Returned to ATL') {
        setTimeout(() => onBack(), 500);
    }
  };

  const handleRejection = () => {
    if (!rejectionReason || !rejectionComment) {
        toast({
            variant: 'destructive',
            title: 'Rejection Failed',
            description: 'Please select a reason and provide a comment.',
        });
        return;
    }
    const notes = `Reason: ${rejectionReason} - ${rejectionComment}`;
    handleStatusChange('Rejected', notes);
    setIsRejecting(false);
    setRejectionReason('');
    setRejectionComment('');
};

  const handleFcbStatusChange = async (status: Application['fcbStatus']) => {
     setApplication(prev => ({...prev, fcbStatus: status}));
  };


  const handleAddComment = async () => {
    if (newComment.trim() === '') return;

    const newCommentObject: Comment = {
      id: `c${Date.now()}`,
      user: user.name,
      role: user.role,
      timestamp: new Date().toISOString(),
      content: newComment.trim(),
    };
    
    setApplication(prev => ({...prev, comments: [...prev.comments, newCommentObject]}));
    setNewComment('');
  };

  const handleDownloadPdf = async () => {
    const checklistElement = checklistRef.current;
    const summaryElement = printRef.current;

    if (!summaryElement) {
        console.error("Summary element not found");
        return;
    }

    setIsPrinting(true);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const addCanvasToPdf = async (element: HTMLElement, isFirstPage: boolean) => {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        
        if (!isFirstPage) {
            pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
    };

    if (application.clientType === 'Company (Private / Public Limited)' && checklistElement) {
        await addCanvasToPdf(checklistElement, true);
        await addCanvasToPdf(summaryElement, false);
    } else {
        await addCanvasToPdf(summaryElement, true);
    }

    // Add 10 sample pages
    for (let i = 1; i <= 10; i++) {
        pdf.addPage();
        pdf.setFontSize(40);
        pdf.text('INNBUCKS ONBOARDING', pdfWidth / 2, pdfHeight / 2, { align: 'center' });
        pdf.setFontSize(10);
        pdf.text(`Sample Page ${i}`, pdfWidth / 2, pdfHeight / 2 + 10, { align: 'center' });
    }


    pdf.save(`Application-${application.id}.pdf`);
    setIsPrinting(false);
  };
  
  const handleSendEmail = () => {
    if (!brNumber || !walletAccount) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter both BR Number and Wallet Account before sending.',
      });
      return;
    }

    const subject = `Account Creation for Application: ${application.id}`;
    const body = `Please create an account for the following applicant:\n\nClient Name: ${application.clientName}\nApplication ID: ${application.id}\n\nBR Number: ${brNumber}\nWallet Account: ${walletAccount}\n\nThank you.`;
    const mailtoLink = `mailto:tmateoro@inbucks.co.zw?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;

     toast({
        title: 'Redirecting to Email Client',
        description: 'Please complete and send the email to finalize the account creation request.',
    });
  }

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    setAiSummary(null);

    const summaryInput = {
      clientType: application.clientType,
      clientName: application.clientName,
      status: application.status,
      fcbStatus: application.fcbStatus,
      documents: application.documents,
      history: application.history,
    };
    
    const result = await generateApplicationSummary(summaryInput);
    setIsGeneratingSummary(false);

    if (result.success && result.data) {
      setAiSummary(result.data.summary);
      toast({
        title: 'AI Summary Generated',
        description: 'The application summary and risk assessment is ready.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Summary Failed',
        description: result.error || 'Could not generate AI summary.',
      });
    }
  };

  const renderActions = () => {
    switch (user.role) {
      case 'back-office':
        if(application.status === 'Approved' || application.status === 'Pending Supervisor') return null;
        return (
          <div className="space-x-2">
            <Button variant="outline" onClick={() => handleStatusChange('Returned to ATL')}>
              <CornerUpLeft className="mr-2 h-4 w-4" />Return to ATL
            </Button>
            <Button onClick={() => handleStatusChange('Pending Supervisor')}>
              <Send className="mr-2 h-4 w-4" />Send to Supervisor
            </Button>
          </div>
        );
      case 'supervisor':
        if(application.status === 'Approved' || application.status === 'Rejected') return null;
        return (
          <div className="space-x-2">
            <Button variant="destructive" onClick={() => setIsRejecting(true)}><X className="mr-2 h-4 w-4" />Reject</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('Approved')}><Check className="mr-2 h-4 w-4" />Approve</Button>
          </div>
        );
      default:
        return null;
    }
  };
  
  const supervisor = application.history.find(h => h.action === 'Approved')?.user;

  return (
    <div>
        <div className="mb-6 flex items-center justify-between">
            <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
                 <Button variant="outline" onClick={handleDownloadPdf} disabled={isPrinting}>
                    <Download className="mr-2 h-4 w-4" />
                    {isPrinting ? 'Generating...' : 'Download PDF'}
                </Button>
                {renderActions()}
            </div>
        </div>
        <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
          <div ref={printRef}>
              <ApplicationPrintView application={application} />
          </div>
           {application.clientType === 'Company (Private / Public Limited)' && (
             <div ref={checklistRef}>
               <CorporateChecklist application={application} supervisor={supervisor} />
             </div>
           )}
        </div>
        
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
                <CardTitle>Review Application: {application.id}</CardTitle>
                <CardDescription>
                    Reviewing application for <strong>{application.clientName}</strong> submitted on {application.submittedDate}.
                </CardDescription>
            </div>
            <Badge variant={
                application.status === 'Approved' ? 'success' 
                : application.status === 'Rejected' ? 'destructive' 
                : 'secondary'
            }>{application.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
            <div className='flex justify-end mb-4'>
                <Button variant="secondary" onClick={handleGenerateSummary} disabled={isGeneratingSummary}>
                    {isGeneratingSummary ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {isGeneratingSummary ? 'Generating...' : 'Generate AI Summary'}
                </Button>
            </div>
            
            {aiSummary && (
                <Alert className="mb-6 bg-secondary/50">
                    <Wand2 className="h-4 w-4" />
                    <AlertTitleComponent>AI Summary & Risk Assessment</AlertTitleComponent>
                    <AlertDescriptionComponent>{aiSummary}</AlertDescriptionComponent>
                </Alert>
            )}

             <Tabs defaultValue="details" className="w-full">
                <TabsList>
                    <TabsTrigger value="details"><User className="mr-2 h-4 w-4"/>Customer Details</TabsTrigger>
                    <TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4"/>Documents</TabsTrigger>
                    <TabsTrigger value="history"><History className="mr-2 h-4 w-4"/>Activity Log</TabsTrigger>
                    <TabsTrigger value="comments"><MessageSquare className="mr-2 h-4 w-4"/>Comments</TabsTrigger>
                    {user.role === 'back-office' && application.status !== 'Approved' && <TabsTrigger value="account-creation"><Mail className="mr-2 h-4 w-4" />Account Creation</TabsTrigger>}
                </TabsList>
                <TabsContent value="details" className="pt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Applicant Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             <DetailItem label="Client Name" value={application.clientName} />
                             <DetailItem label="Client Type" value={application.clientType} />
                             <DetailItem label="Submission Date" value={application.submittedDate} />
                             <DetailItem label="Submitted By" value={application.submittedBy} />
                             <DetailItem label="Status" value={application.status} />
                             <DetailItem label="Last Updated" value={new Date(application.lastUpdated).toLocaleString()} />
                           </div>
                           <Separator/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <DetailItem label="Address" value={application.details.address} />
                               <DetailItem label="Date of Birth" value={application.details.dateOfBirth} />
                               <DetailItem label="Contact Number" value={application.details.contactNumber} />
                               <DetailItem label="Email" value={application.details.email} />
                            </div>
                        </CardContent>
                    </Card>
                     {user.role === 'back-office' && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>FCB Status Check</CardTitle>
                                <CardDescription>Confirm the applicant's status from the Financial Clearing Bureau.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup 
                                    defaultValue={application.fcbStatus}
                                    onValueChange={(value: Application['fcbStatus']) => handleFcbStatusChange(value)}
                                    className="flex flex-col sm:flex-row gap-4">
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <RadioGroupItem value="Inclusive" id="fcb-inclusive" />
                                        <Label htmlFor="fcb-inclusive" className="font-normal">Inclusive</Label>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <RadioGroupItem value="Good" id="fcb-good" />
                                        <Label htmlFor="fcb-good" className="font-normal">Good</Label>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <RadioGroupItem value="Adverse" id="fcb-adverse" />
                                        <Label htmlFor="fcb-adverse" className="font-normal">Adverse</Label>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <RadioGroupItem value="Prior Adverse" id="fcb-prior-adverse" />
                                        <Label htmlFor="fcb-prior-adverse" className="font-normal">Prior Adverse</Label>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <RadioGroupItem value="PEP" id="fcb-pep" />
                                        <Label htmlFor="fcb-pep" className="font-normal">PEP</Label>
                                    </FormItem>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
                <TabsContent value="documents" className="pt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Document Requirements</CardTitle>
                                <CardDescription>Checklist for '{application.clientType}' account.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {documentRequirements.map((req) => {
                                        const isUploaded = uploadedDocumentTypes.includes(req.document);
                                        return (
                                            <li key={req.document} className="flex items-center">
                                                {isUploaded ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                                ) : (
                                                    <AlertCircle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                                                )}
                                                <div>
                                                    <p className="font-medium">{req.document}</p>
                                                    <p className="text-sm text-muted-foreground">{req.comment}</p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Uploaded Documents</CardTitle>
                                <CardDescription>Files submitted by the applicant.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {application.documents.length > 0 ? (
                                    <ul className="space-y-3">
                                        {application.documents.map(doc => (
                                            <li key={doc.type} className="flex items-center justify-between p-3 rounded-md border">
                                                <div>
                                                    <p className="font-medium">{doc.type}</p>
                                                    <p className="text-sm text-muted-foreground">{doc.fileName}</p>
                                                </div>
                                                <Button variant="outline" size="sm">View Document</Button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">No documents were uploaded for this application.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="history" className="pt-4">
                   <Card>
                        <CardHeader>
                            <CardTitle>Application History</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ul className="space-y-4">
                                {application.history.map((entry, index) => (
                                    <li key={index} className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                                                {entry.action === 'Submitted' ? <FileText className="h-5 w-5"/> : <User className="h-5 w-5"/>}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="font-medium">{entry.action} by {entry.user}</p>
                                            <p className="text-sm text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                                            {entry.notes && <p className="text-sm mt-1 p-2 bg-muted/50 rounded-md">{entry.notes}</p>}
                                        </div>
                                    </li>

                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="comments" className="pt-4">
                   <Card>
                        <CardHeader>
                            <CardTitle>Internal Comments & Feedback</CardTitle>
                             <CardDescription>Discuss the application with team members. Comments are not visible to the client.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                {application.comments.map((comment) => (
                                    <div key={comment.id} className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{comment.user.substring(0,2)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 rounded-md border bg-card p-3">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-sm">{comment.user} <span className="text-xs font-normal text-muted-foreground capitalize">({comment.role.replace('-', ' ')})</span></p>
                                                <p className="text-xs text-muted-foreground">{new Date(comment.timestamp).toLocaleString()}</p>
                                            </div>
                                            <p className="text-sm mt-1">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {application.comments.length === 0 && (
                                    <p className="text-sm text-center text-muted-foreground py-4">No comments yet.</p>
                                )}
                            </div>
                            {application.status !== 'Approved' && (
                                <div className="space-y-2">
                                    <Textarea 
                                        placeholder="Type your comment here..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <Button onClick={handleAddComment}>Add Comment</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                {user.role === 'back-office' && application.status !== 'Approved' && (
                    <TabsContent value="account-creation" className="pt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Creation Details</CardTitle>
                                <CardDescription>
                                    Enter the branch and wallet information, then send to the account creation team.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="br-number">BR Number</Label>
                                        <Input
                                            id="br-number"
                                            placeholder="Enter BR number"
                                            value={brNumber}
                                            onChange={(e) => setBrNumber(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="wallet-account">Wallet Account</Label>
                                        <Input
                                            id="wallet-account"
                                            placeholder="Enter wallet account number"
                                            value={walletAccount}
                                            onChange={(e) => setWalletAccount(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleSendEmail}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send for Account Creation
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={isRejecting} onOpenChange={setIsRejecting}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Reject Application</AlertDialogTitle>
            <AlertDialogDescription>
                Please provide a reason and a comment for rejecting this application. This will be logged and sent back to the ATL.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="rejection-reason">Rejection Reason</Label>
                    <Select onValueChange={setRejectionReason} value={rejectionReason}>
                        <SelectTrigger id="rejection-reason">
                            <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                            {rejectionReasons.map(reason => (
                                <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rejection-comment">Comment</Label>
                    <Textarea 
                        id="rejection-comment"
                        placeholder="Provide a detailed explanation for the rejection..."
                        value={rejectionComment}
                        onChange={(e) => setRejectionComment(e.target.value)}
                    />
                </div>
            </div>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRejection} disabled={!rejectionReason || !rejectionComment}>
                Confirm Rejection
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}

    