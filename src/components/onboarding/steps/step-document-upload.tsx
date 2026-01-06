'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { AlertCircle, CheckCircle2, FileUp, Info, Loader2, Eye, Camera, Trash2, PlusCircle, Upload } from 'lucide-react';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { verifyDocuments } from '@/lib/actions';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDocumentRequirements } from '@/lib/document-requirements';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// State for a single document, which can now have multiple pages
type DocumentState = {
  documentType: string;
  pages: { source: 'scan' | 'upload'; dataUri: string; file?: File }[];
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

  // Initialize state for each required document
  React.useEffect(() => {
    const initialDocs: Record<string, DocumentState> = {};
    documentRequirements.forEach(req => {
      initialDocs[req.document] = { documentType: req.document, pages: [] };
    });
    setDocuments(initialDocs);
    // Set form values for validation
    form.setValue('document1Type', documentRequirements[0]?.document || 'doc1');
    form.setValue('document2Type', documentRequirements[1]?.document || 'doc2');
  }, [clientType, documentRequirements, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload an image file (PNG, JPG, etc.).' });
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      addPageToDocument(documentType, { source: 'upload', dataUri, file });
    };
    reader.readAsDataURL(file);
  };
  
  const addPageToDocument = (documentType: string, page: { source: 'scan' | 'upload'; dataUri: string; file?: File }) => {
    setDocuments(prev => ({
        ...prev,
        [documentType]: {
            ...prev[documentType],
            pages: [...(prev[documentType]?.pages || []), page],
        }
    }));
  };

  const removePageFromDocument = (documentType: string, pageIndex: number) => {
    setDocuments(prev => ({
        ...prev,
        [documentType]: {
            ...prev[documentType],
            pages: prev[documentType].pages.filter((_, i) => i !== pageIndex),
        }
    }));
  };

  // CAMERA LOGIC
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
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access the camera.' });
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
            addPageToDocument(isScanning, { source: 'scan', dataUri });
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
        description: 'Please upload pages for at least the first two required documents.',
      });
      return;
    }

    setIsLoading(true);
    setValidationResult(null);

    const formData = form.getValues();
    const input = {
      document1DataUri: doc1.pages[0].dataUri, // Using first page for AI verification
      document1Type: doc1.documentType,
      document2DataUri: doc2.pages[0].dataUri, // Using first page for AI verification
      document2Type: doc2.documentType,
      formDataFields: {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
      },
    };

    const result = await verifyDocuments(input);
    setIsLoading(false);

    if (result.success && result.data) {
      setValidationResult(result.data.validationResult);
      // Pre-fill form with validated data
      Object.entries(result.data.validatedFields).forEach(([key, value]) => {
        form.setValue(key as keyof OnboardingFormData, value);
      });
      form.setValue('fcbStatus', result.data.fcbStatus);
       toast({
        title: 'Verification Complete',
        description: 'Your documents have been processed and form pre-filled.',
      });
    } else {
      setValidationResult(result.error || 'An unknown error occurred.');
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: result.error || 'An unknown error occurred.',
      });
    }
  };


  return (
    <div>
      <CardHeader>
        <CardTitle>Document Upload & Verification</CardTitle>
        <CardDescription>Scan or upload all required documents. You can add multiple pages to each document type.</CardDescription>
      </CardHeader>
      <div className="space-y-6 px-6">
        
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Document Requirements for: {clientType || 'Not Selected'}</AlertTitle>
            <AlertDescription>
                <Table className="mt-2">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Document Required</TableHead>
                            <TableHead>Comment</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documentRequirements.map((req) => (
                            <TableRow key={req.document}>
                                <TableCell className="font-medium">{req.document}<p className="text-xs text-muted-foreground font-normal">{req.details}</p></TableCell>
                                <TableCell>{req.comment}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {Object.values(documents).map(({documentType, pages}) => (
            <div key={documentType} className="p-4 border rounded-lg">
                <div className='flex justify-between items-center mb-2'>
                     <h3 className="font-semibold">{documentType}</h3>
                     <Badge variant={pages.length > 0 ? 'success' : 'outline'}>{pages.length} Page(s)</Badge>
                </div>
               
                {pages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                        {pages.map((page, index) => (
                            <div key={index} className="relative group border rounded-md p-1">
                                <img src={page.dataUri} alt={`Page ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removePageFromDocument(documentType, index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => startScan(documentType)}><Camera className="mr-2 h-4 w-4"/>Scan Page</Button>
                     <Button asChild variant="outline" size="sm">
                        <label className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4"/>Upload Page
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, documentType)} />
                        </label>
                    </Button>
                </div>
            </div>
          ))}
        </div>
        
        <Button onClick={handleVerification} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Verify Documents &amp; Pre-fill Form
        </Button>

        {validationResult && (
          <Alert variant={validationResult.includes('discrepancies') ? 'destructive' : 'default'}>
            {validationResult.includes('discrepancies') ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <AlertTitle>Validation Result</AlertTitle>
            <AlertDescription>{validationResult}</AlertDescription>
          </Alert>
        )}
      </div>

       <Dialog open={!!isScanning} onOpenChange={(isOpen) => !isOpen && stopScan()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Scan Document: {isScanning}</DialogTitle>
                </DialogHeader>
                <div className="relative">
                    <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay playsInline muted />
                    <canvas ref={canvasRef} className="hidden" />
                    {hasCameraPermission === false && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Alert variant="destructive" className="m-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Camera Access Denied</AlertTitle>
                                <AlertDescription>Please enable camera permissions in your browser settings to use this feature.</AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={stopScan}>Cancel</Button>
                    <Button onClick={captureImage} disabled={!hasCameraPermission}>Capture</Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}