
'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { AlertCircle, CheckCircle2, Info, Loader2, Eye, Camera, Trash2, Upload, File, ScanLine, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { verifyDocuments } from '@/lib/actions';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDocumentRequirements } from '@/lib/document-requirements';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

type PageState = {
  source: 'scan' | 'upload';
  dataUri: string;
  file?: File;
  type: 'image' | 'pdf';
};

type DocumentState = {
  documentType: string;
  pages: PageState[];
};

export default function StepDocumentUpload() {
  const { toast } = useToast();
  const form = useFormContext<OnboardingFormData>();
  const [documents, setDocuments] = React.useState<Record<string, DocumentState>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [validationResult, setValidationResult] = React.useState<string | null>(null);
  
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = React.useState<string | null>(null);

  const clientType = form.watch('clientType');
  const documentRequirements = getDocumentRequirements(clientType);

  // Initialize state from form values to prevent data loss on step switch
  React.useEffect(() => {
    const initialDocs: Record<string, DocumentState> = {};
    const existingCaptured = form.getValues('capturedDocuments') || [];

    documentRequirements.forEach(req => {
      const existing = existingCaptured.find(d => d.type === req.document);
      initialDocs[req.document] = { 
        documentType: req.document, 
        pages: existing ? [{
            source: 'upload',
            dataUri: existing.url,
            type: existing.url.includes('application/pdf') || existing.fileName?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'
        }] : [] 
      };
    });
    setDocuments(initialDocs);
  }, [clientType, documentRequirements, form]);

  // Sync documents state to form value for submission
  React.useEffect(() => {
    if (Object.keys(documents).length === 0) return;

    const capturedDocs = Object.values(documents)
      .filter(doc => doc.pages.length > 0)
      .map(doc => ({
        type: doc.documentType,
        fileName: doc.pages[0].file?.name || `${doc.documentType.toLowerCase().replace(/\s/g, '_')}_1.${doc.pages[0].type === 'pdf' ? 'pdf' : 'jpg'}`,
        url: doc.pages[0].dataUri
      }));
    
    // Only update if something actually changed to avoid form reset loops
    const currentVal = form.getValues('capturedDocuments') || [];
    if (JSON.stringify(currentVal) !== JSON.stringify(capturedDocs)) {
        form.setValue('capturedDocuments', capturedDocs);
    }
  }, [documents, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload an image or PDF file.' });
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
      addPageToDocument(documentType, { source: 'upload', dataUri, file, type: fileType });
    };
    reader.readAsDataURL(file);
  };
  
  const addPageToDocument = (documentType: string, page: PageState) => {
    setDocuments(prev => ({
        ...prev,
        [documentType]: {
            ...prev[documentType],
            pages: [page], // Limiting to 1 page for now as per form schema
        }
    }));
  };

  const removePageFromDocument = (documentType: string, pageIndex: number) => {
    setDocuments(prev => ({
        ...prev,
        [documentType]: {
            ...prev[documentType],
            pages: [],
        }
    }));
  };

  const startScan = async (docType: string) => {
    setIsScanning(docType);
    if (hasCameraPermission === false) {
      toast({ variant: 'destructive', title: 'Camera Access Denied', description: 'Please enable camera permissions to scan documents.' });
      setIsScanning(null);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      setIsScanning(null);
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access the camera. Check your browser settings.' });
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUri = canvas.toDataURL('image/jpeg');
            addPageToDocument(isScanning, { source: 'scan', dataUri, type: 'image' });
            toast({ title: 'Page Captured', description: `Added a new page to ${isScanning}.` });
        }
        stopScan();
    }
  };

  const stopScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(null);
  };
  
   const handleVerification = async () => {
    const doc1 = documents[documentRequirements[0]?.document];
    const doc2 = documents[documentRequirements[1]?.document];
    
    if (!doc1?.pages?.length || !doc2?.pages?.length) {
      toast({
        variant: 'destructive',
        title: 'Missing Documents',
        description: 'Please capture/upload pages for at least the first two required documents.',
      });
      return;
    }

    setIsLoading(true);
    setValidationResult(null);

    const formData = form.getValues();
    const input = {
      document1DataUri: doc1.pages[0].dataUri,
      document1Type: doc1.documentType,
      document2DataUri: doc2.pages[0].dataUri,
      document2Type: doc2.documentType,
      formDataFields: {
        fullName: formData.individualFirstName ? `${formData.individualFirstName} ${formData.individualSurname}` : formData.organisationLegalName || '',
        dateOfBirth: formData.individualDateOfBirth || formData.dateOfIncorporation || '',
        address: formData.individualAddress || formData.physicalAddress || '',
      },
    };

    const result = await verifyDocuments(input);
    setIsLoading(false);

    if (result.success && result.data) {
      setValidationResult(result.data.validationResult);
      Object.entries(result.data.validatedFields).forEach(([key, value]) => {
        form.setValue(key as keyof OnboardingFormData, value);
      });
      form.setValue('fcbStatus', result.data.fcbStatus);
       toast({
        title: 'Verification Complete',
        description: 'AI has processed your documents and pre-filled the form.',
      });
    } else {
      setValidationResult(result.error || 'An unknown error occurred.');
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: result.error || 'An unknown error occurred during AI processing.',
      });
    }
  };

  return (
    <div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanLine className="h-6 w-6 text-primary" />
          Document Capture & AI Verification
        </CardTitle>
        <CardDescription>Capture required documents using your camera or upload existing files.</CardDescription>
      </CardHeader>
      <div className="space-y-6 px-6">
        
        <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4" />
            <AlertTitle>Requirements for {clientType}</AlertTitle>
            <AlertDescription>
                <div className="max-h-48 overflow-auto mt-2">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Document</TableHead>
                              <TableHead>Required Format</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {documentRequirements.map((req) => (
                              <TableRow key={req.document}>
                                  <TableCell className="font-medium text-xs">{req.document}</TableCell>
                                  <TableCell className="text-xs">{req.comment}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
                </div>
            </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(documents).map(({documentType, pages}) => {
            return (
                <div key={documentType} className="p-4 border rounded-lg hover:border-primary/50 transition-colors bg-card shadow-sm">
                    <div className='flex justify-between items-center mb-3'>
                        <h3 className="text-sm font-bold truncate max-w-[150px]" title={documentType}>{documentType}</h3>
                        <Badge variant={pages.length > 0 ? 'success' : 'outline'} className="text-[10px]">{pages.length} Pages</Badge>
                    </div>
                
                    <div className="space-y-2 mb-3">
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => startScan(documentType)}><Camera className="mr-2 h-3 w-3"/>Scan</Button>
                            <Button asChild variant="outline" size="sm" className="flex-1">
                                <label className="cursor-pointer">
                                    <Upload className="mr-2 h-3 w-3"/>Upload
                                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileChange(e, documentType)} />
                                </label>
                            </Button>
                        </div>
                    </div>

                    {pages.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1 h-24 overflow-hidden">
                            {pages.map((page, index) => (
                                <div key={index} className="relative group border rounded h-24 bg-muted flex items-center justify-center overflow-hidden">
                                    {page.type === 'image' ? (
                                        <img src={page.dataUri} alt="doc" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1">
                                            <File className="h-8 w-8 text-primary" />
                                            <span className="text-[10px] font-bold">PDF FILE</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removePageFromDocument(documentType, index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                    <div className="h-24 border-dashed border-2 rounded flex items-center justify-center text-muted-foreground text-[10px]">
                        No pages added
                    </div>
                    )}
                    
                    {pages.length > 0 && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary" size="sm" className="w-full mt-2 h-8 text-xs font-bold">
                                <Eye className="mr-2 h-3 w-3"/>View Document
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Document Preview: {documentType}</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 min-h-0 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                                {pages[0].type === 'image' ? (
                                    <img src={pages[0].dataUri} alt="Preview" className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <iframe src={pages[0].dataUri} className="w-full h-full" title="PDF Preview" />
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                    )}
                </div>
            );
          })}
        </div>
        
        <div className="bg-secondary/20 p-4 rounded-lg border border-secondary">
          <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
            <Loader2 className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            AI Document Verification
          </h4>
          <p className="text-xs text-muted-foreground mb-4">Click below to have Gemini analyze the first pages of your main documents (ID/Registration). It will attempt to verify information across the files.</p>
          <Button onClick={handleVerification} disabled={isLoading} className="w-full font-bold">
            {isLoading ? 'AI is analyzing documents...' : 'Run AI Pre-fill & Validation'}
          </Button>
        </div>

        {validationResult && (
          <Alert variant={validationResult.includes('discrepancies') || validationResult.includes('concerns') ? 'destructive' : 'default'} className="animate-in fade-in slide-in-from-top-2">
            {validationResult.includes('discrepancies') || validationResult.includes('concerns') ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <AlertTitle>AI Insights</AlertTitle>
            <AlertDescription className="text-xs">{validationResult}</AlertDescription>
          </Alert>
        )}
      </div>

       <Dialog open={!!isScanning} onOpenChange={(isOpen) => !isOpen && stopScan()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Capture Document: {isScanning}</DialogTitle>
                </DialogHeader>
                <div className="relative">
                    <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay playsInline muted />
                    <canvas ref={canvasRef} className="hidden" />
                    {hasCameraPermission === false && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                            <Alert variant="destructive" className="m-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>Please allow camera access in your browser settings to scan documents directly.</AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={stopScan}>Cancel</Button>
                    <Button onClick={captureImage} disabled={!hasCameraPermission} className="font-bold">Capture Page</Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
