'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { useAtom } from 'jotai';
import { applicationsAtom, Application } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/users';
import { ArrowLeft, Loader2, FileUp, Camera, Upload, Trash2, File, ScanLine, Info, CheckCircle2, AlertCircle, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { accountTypes } from '@/lib/types';
import { getDocumentRequirements } from '@/lib/document-requirements';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { validateImageQualityHeuristic } from '@/lib/image-validation';
import { generateAccountId } from '@/lib/utils';
import { mergeToPdf, countPdfPages } from '@/lib/pdf-utils';

type PageState = {
  source: 'scan' | 'upload';
  dataUri: string;
  file?: File;
  type: 'image' | 'pdf';
  documentType: string;
  pageCount: number;
};

interface DigitizeApplicationFlowProps {
  onCancel: () => void;
  user: User;
}

export default function DigitizeApplicationFlow({ onCancel, user }: DigitizeApplicationFlowProps) {
  const { toast } = useToast();
  const [applications, setApplications] = useAtom(applicationsAtom);

  const [clientName, setClientName] = React.useState('');
  const [clientType, setClientType] = React.useState<string>('');
  const [documentType, setDocumentType] = React.useState('Other Document');
  const [pages, setPages] = React.useState<PageState[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isValidating, setIsValidating] = React.useState(false);
  const [previewPage, setPreviewPage] = React.useState<PageState | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = React.useState<boolean>(false);

  const requirements = React.useMemo(() => {
    return clientType ? getDocumentRequirements(clientType) : [];
  }, [clientType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload an image or PDF file.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUri = event.target?.result as string;
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
      let pageCount = 1;

      if (fileType === 'image') {
        setIsValidating(true);
        try {
            const result = await validateImageQualityHeuristic(dataUri);
            if (!result.isValid) {
              toast({
                variant: 'destructive',
                title: 'Quality Check Failed',
                description: result.reason || 'Image not clear. Please retake photo.',
              });
              return;
            }
        } finally {
            setIsValidating(false);
        }
      } else {
        setIsValidating(true);
        try {
            pageCount = await countPdfPages(dataUri);
        } finally {
            setIsValidating(false);
        }
      }

      addPage({ source: 'upload', dataUri, file, type: fileType, documentType, pageCount });
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const addPage = (page: PageState) => {
    setPages(prev => [...prev, page]);
    toast({ title: 'Added', description: `Detected ${page.pageCount} page(s) for ${documentType}.` });
  };

  const removePage = (pageIndex: number) => {
    setPages(prev => prev.filter((_, i) => i !== pageIndex));
  };

  const movePage = (from: number, to: number) => {
    if (to < 0 || to >= pages.length) return;
    const newPages = [...pages];
    const item = newPages.splice(from, 1)[0];
    newPages.splice(to, 0, item);
    setPages(newPages);
  };

  const startScan = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
      }, 300);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      setIsScanning(false);
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access the camera.' });
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
        try {
            const result = await validateImageQualityHeuristic(dataUri);
            if (!result.isValid) {
              toast({
                variant: 'destructive',
                title: 'Quality Check Failed',
                description: result.reason || 'Image not clear. Please retake photo.',
              });
              return;
            }
            addPage({ source: 'scan', dataUri, type: 'image', documentType, pageCount: 1 });
        } finally {
            setIsValidating(false);
        }
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

  const onSubmit = async () => {
    if (!clientName.trim() || !clientType || pages.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Information',
        description: 'Please provide a client name, account type, and capture at least one document page.',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
        const groupedPages = pages.reduce((acc, page) => {
            if (!acc[page.documentType]) acc[page.documentType] = [];
            acc[page.documentType].push(page.dataUri);
            return acc;
        }, {} as Record<string, string[]>);

        const mergedDocuments = await Promise.all(
            Object.entries(groupedPages).map(async ([type, typePages]) => {
                const result = await mergeToPdf(typePages);
                return {
                    type,
                    fileName: `${type.toLowerCase().replace(/\s/g, '_')}.pdf`,
                    url: result.url,
                    pages: typePages,
                    pageCount: result.count
                };
            })
        );
        
        const newApplication = {
          id: generateAccountId(),
          clientName: clientName.trim(),
          clientType: clientType,
          status: 'Archived',
          submittedDate: format(new Date(), 'yyyy-MM-dd'),
          lastUpdated: new Date().toISOString(),
          submittedBy: user.name,
          region: 'N/A',
          fcbStatus: 'Inclusive',
          details: {
            clientType: clientType,
            region: 'N/A',
            organisationLegalName: clientName,
            individualFirstName: clientName,
            physicalAddress: 'N/A',
            individualAddress: 'N/A',
            capturedDocuments: mergedDocuments,
            agreedToTerms: true,
            signature: user.name
          },
          signatories: [],
          documents: mergedDocuments,
          history: [
            { action: 'Digitalized Application', user: user.name, timestamp: new Date().toISOString(), notes: `Digitalized Application from paper record. Account Type: ${clientType}` },
          ],
          comments: [],
        } as Application;

        setApplications(prev => [newApplication, ...prev]);

        toast({
          title: "Application Archived!",
          description: `The application for ${clientName} has been successfully digitized and saved.`,
        });

        await new Promise(resolve => setTimeout(resolve, 800));
        onCancel();
    } catch (error) {
        console.error("Digitization error:", error);
        toast({
            variant: 'destructive',
            title: 'Submission failed',
            description: "Submission failed. Please try again or contact support.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const isRequirementMet = (reqName: string) => {
    return pages.some(p => p.documentType === reqName);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*,application/pdf" 
        className="hidden" 
      />

      <div className="mb-6">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isValidating || isSubmitting}>
             <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card className="relative overflow-hidden">
                {(isValidating || isSubmitting) && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="space-y-1">
                      <p className="text-xl font-black uppercase tracking-tight">{isSubmitting ? 'Archiving...' : 'Processing File'}</p>
                      <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">{isSubmitting ? 'Finalizing legal record...' : 'Checking quality & detecting pages...'}</p>
                    </div>
                  </div>
                )}
                <CardHeader>
                <CardTitle>Digitize Paper Application</CardTitle>
                <CardDescription>
                    Create a new digital archive. Select account type, provide a name, and capture multiple pages for each document.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="client-type">Account Type</Label>
                        <Select value={clientType} onValueChange={setClientType} disabled={isValidating || isSubmitting}>
                            <SelectTrigger id="client-type">
                                <SelectValue placeholder="Select account type..." />
                            </SelectTrigger>
                            <SelectContent>
                                {accountTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client-name">Client or Company Name</Label>
                        <Input
                        id="client-name"
                        placeholder="Enter name on application"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        disabled={isValidating || isSubmitting}
                        />
                    </div>
                </div>

                <div className="p-4 border rounded-lg space-y-4 bg-muted/5">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        Captured Pages
                        <Badge variant="secondary" className="ml-2">
                            {pages.reduce((acc, p) => acc + p.pageCount, 0)} Total
                        </Badge>
                    </h3>
                    {pages.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                        {pages.map((page, index) => (
                            <div key={index} className="relative group border rounded-xl overflow-hidden h-40 bg-background shadow-sm">
                            {page.type === 'image' ? (
                                <img src={page.dataUri} alt={`Page ${index + 1}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center bg-muted h-full gap-2">
                                    <File className="h-10 w-10 text-primary" />
                                    <p className="text-[8px] font-black uppercase text-center px-2 truncate w-full mt-2">{page.file?.name || 'document.pdf'}</p>
                                    <Badge variant="outline" className="text-[8px] h-4">{page.pageCount} Pgs</Badge>
                                </div>
                            )}
                            <div className="absolute top-1 left-1 flex flex-col gap-1">
                                <Badge variant="secondary" className="text-[8px] px-1.5 py-0.5 uppercase font-black">{page.documentType}</Badge>
                                <Badge className="text-[8px] px-1.5 py-0.5 bg-black/60 text-white border-none">#{index + 1}</Badge>
                            </div>
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-1">
                                    <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => movePage(index, index - 1)} disabled={index === 0}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => movePage(index, index + 1)} disabled={index === pages.length - 1}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => setPreviewPage(page)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removePage(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-16 border-dashed border-2 rounded-xl bg-muted/10">
                            <ScanLine className="mx-auto h-12 w-12 opacity-10" />
                            <p className="mt-4 font-bold uppercase text-xs tracking-widest opacity-40">No pages captured</p>
                            <p className="text-[10px] mt-1 italic">Use the section below to add pages.</p>
                        </div>
                    )}

                    <div className="space-y-4 bg-muted/20 p-6 rounded-xl border border-primary/10 shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="doc-type" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Document Type</Label>
                                <Select value={documentType} onValueChange={setDocumentType} disabled={isValidating || isSubmitting}>
                                    <SelectTrigger id="doc-type" className="h-12 bg-background border-primary/20">
                                        <SelectValue placeholder="Select type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Other Document">Other Document</SelectItem>
                                        {requirements.map(req => (
                                            <SelectItem key={req.document} value={req.document}>{req.document}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 h-12 font-black uppercase tracking-widest border-primary/20 hover:bg-primary/5" onClick={startScan} disabled={!clientType || isValidating || isSubmitting}>
                                    <Camera className="mr-2 h-4 w-4 text-primary"/>Add Scan
                                </Button>
                                <Button variant="outline" className="flex-1 h-12 font-black uppercase tracking-widest border-primary/20 hover:bg-primary/5" onClick={() => fileInputRef.current?.click()} disabled={!clientType || isValidating || isSubmitting}>
                                    <Upload className="mr-2 h-4 w-4 text-primary"/>Add File
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-6 justify-end bg-muted/5">
                <Button onClick={onSubmit} disabled={isSubmitting || isValidating || !clientName.trim() || !clientType || pages.length === 0} className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-10 h-14 rounded-xl shadow-xl active:scale-95 transition-all">
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    {isSubmitting ? 'SAVING...' : 'ARCHIVE APPLICATION'}
                </Button>
                </CardFooter>
            </Card>
        </div>

        <div className="space-y-6">
            <Card className="h-full flex flex-col shadow-lg border-primary/5">
                <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-primary">
                        <Info className="h-4 w-4" />
                        Checklist
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">
                        {clientType ? `Needed for ${clientType}` : 'Select type to view'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-[600px]">
                        <div className="p-4 space-y-3">
                            {clientType ? (
                                requirements.map((req) => {
                                    const met = isRequirementMet(req.document);
                                    const pageCount = pages.filter(p => p.documentType === req.document).reduce((a, b) => a + b.pageCount, 0);
                                    return (
                                        <div 
                                            key={req.document} 
                                            className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm ${met ? 'bg-green-500/5 border-green-500/20' : 'bg-card hover:border-primary/50'}`}
                                            onClick={() => !isValidating && !isSubmitting && setDocumentType(req.document)}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <p className={`text-sm font-black uppercase tracking-tight ${met ? 'text-green-600' : 'text-foreground/80'}`}>{req.document}</p>
                                                    <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight font-medium">{req.comment}</p>
                                                    {met && (
                                                        <Badge variant="success" className="mt-2 text-[8px] font-black uppercase tracking-tighter">
                                                            {pageCount} {pageCount === 1 ? 'PAGE' : 'PAGES'} DETECTED
                                                        </Badge>
                                                    )}
                                                </div>
                                                {met ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                                ) : (
                                                    <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 opacity-20" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-24 text-muted-foreground opacity-20">
                                    <ScanLine className="h-12 w-12 mx-auto mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Select Type</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </div>

      <Dialog open={isScanning} onOpenChange={(isOpen) => !isOpen && stopScan()}>
        <DialogContent className="max-w-xl bg-background border-primary/20">
          <DialogHeader>
            <DialogTitle>Scan Page: {documentType}</DialogTitle>
          </DialogHeader>
          <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 shadow-2xl">
            <video ref={videoRef} className="w-full aspect-video bg-black" autoPlay playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40 flex items-center justify-center">
                <div className="w-full h-full border-2 border-primary/50 border-dashed animate-pulse"></div>
            </div>
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <Alert variant="destructive" className="max-w-xs">
                  <AlertTitle>Camera Required</AlertTitle>
                  <AlertDescription>Please enable camera permissions in your browser.</AlertDescription>
                </Alert>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center gap-2">
            <Badge variant="secondary" className="font-black uppercase text-[10px] tracking-widest">{documentType}</Badge>
            <div className="flex gap-2">
                <Button variant="outline" onClick={stopScan} className="font-bold">Cancel</Button>
                <Button onClick={captureImage} disabled={!hasCameraPermission} className="bg-primary text-primary-foreground font-black px-8">Take Photo</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewPage} onOpenChange={(open) => !open && setPreviewPage(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col rounded-2xl overflow-hidden border-none p-0">
            <div className="bg-muted/50 p-6 border-b flex justify-between items-center">
                <div>
                    <DialogTitle className="text-xs font-black uppercase tracking-widest text-primary">Preview: {previewPage?.documentType}</DialogTitle>
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">{previewPage?.file?.name || 'Scan Capture'}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setPreviewPage(null)} className="rounded-full"><Trash2 className="h-4 w-4" /></Button>
            </div>
            <div className="flex-1 bg-black relative flex items-center justify-center min-h-0">
                {previewPage?.type === 'image' ? (
                    <img src={previewPage.dataUri} alt="Preview" className="max-w-full max-h-full object-contain" />
                ) : (
                    <object
                        data={previewPage?.dataUri}
                        type="application/pdf"
                        className="w-full h-full"
                    >
                        <div className="flex flex-col items-center justify-center p-6 text-center text-white/40">
                            <File className="h-16 w-16 mb-4 opacity-20" />
                            <p className="font-black uppercase tracking-widest text-xs">PDF Preview Not Available</p>
                            <Button asChild variant="outline" className="mt-6 border-white/10 hover:bg-white/5">
                                <a href={previewPage?.dataUri} download="document.pdf"><Download className="mr-2 h-4 w-4" />Download to View</a>
                            </Button>
                        </div>
                    </object>
                )}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
