'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { Info, Eye, Camera, Trash2, Upload, File, ScanLine, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDocumentRequirements } from '@/lib/document-requirements';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { validateImageQuality } from '@/ai/flows/validate-image-quality';

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
  const [isValidating, setIsValidating] = React.useState<string | null>(null);
  
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = React.useState<string | null>(null);

  const clientType = form.watch('clientType');
  const documentRequirements = React.useMemo(() => getDocumentRequirements(clientType), [clientType]);

  // Initialize state from form values
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
  }, [documentRequirements, form]);

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
    
    const currentVal = form.getValues('capturedDocuments') || [];
    if (JSON.stringify(currentVal) !== JSON.stringify(capturedDocs)) {
        form.setValue('capturedDocuments', capturedDocs, { shouldValidate: true });
    }
  }, [documents, form]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast({ variant: 'destructive', title: 'Bad File', description: 'Use image or PDF.' });
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUri = event.target?.result as string;
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';

      if (fileType === 'image') {
        setIsValidating(documentType);
        try {
          const result = await validateImageQuality({ imageDataUri: dataUri });
          if (!result.isValid) {
            toast({
              variant: 'destructive',
              title: 'Quality Check Failed',
              description: 'Image not clear. Please retake photo.',
            });
            setIsValidating(null);
            return;
          }
        } catch (error) {
          console.error('Validation error:', error);
        }
        setIsValidating(null);
      }

      setDocuments(prev => ({
        ...prev,
        [documentType]: { ...prev[documentType], pages: [{ source: 'upload', dataUri, file, type: fileType }] }
      }));
    };
    reader.readAsDataURL(file);
  };
  
  const removePageFromDocument = (documentType: string) => {
    setDocuments(prev => ({
        ...prev,
        [documentType]: { ...prev[documentType], pages: [] }
    }));
  };

  const startScan = async (docType: string) => {
    setIsScanning(docType);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (error) {
      console.error('Error:', error);
      setHasCameraPermission(false);
      setIsScanning(null);
      toast({ variant: 'destructive', title: 'Error', description: 'No camera access.' });
    }
  };

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUri = canvas.toDataURL('image/jpeg');
            const docType = isScanning;
            
            stopScan();
            setIsValidating(docType);
            
            try {
              const result = await validateImageQuality({ imageDataUri: dataUri });
              if (!result.isValid) {
                toast({
                  variant: 'destructive',
                  title: 'Quality Check Failed',
                  description: 'Image not clear. Please retake photo.',
                });
                setIsValidating(null);
                return;
              }
            } catch (error) {
              console.error('Validation error:', error);
            }
            
            setIsValidating(null);
            setDocuments(prev => ({
                ...prev,
                [docType]: { ...prev[docType], pages: [{ source: 'scan', dataUri, type: 'image' }] }
            }));
            toast({ title: 'Added', description: 'File added.' });
        }
    }
  };

  const stopScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(null);
  };

  return (
    <div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanLine className="h-6 w-6 text-primary" />
          Add Files
        </CardTitle>
        <CardDescription>Use camera or upload.</CardDescription>
      </CardHeader>
      <div className="space-y-6 px-6">
        
        <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4" />
            <AlertTitle>Need for {clientType}</AlertTitle>
            <AlertDescription>
                <div className="max-h-48 overflow-auto mt-2">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>File</TableHead>
                              <TableHead>Format</TableHead>
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
            const loading = isValidating === documentType;
            return (
                <div key={documentType} className="p-4 border rounded-lg hover:border-primary/50 transition-colors bg-card shadow-sm relative overflow-hidden">
                    {loading && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Checking Quality...</span>
                      </div>
                    )}
                    <div className='flex justify-between items-center mb-3'>
                        <h3 className="text-sm font-bold truncate max-w-[150px]" title={documentType}>{documentType}</h3>
                        <Badge variant={pages.length > 0 ? 'success' : 'outline'} className="text-[10px]">{pages.length} Pages</Badge>
                    </div>
                
                    <div className="space-y-2 mb-3">
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => startScan(documentType)} disabled={loading}><Camera className="mr-2 h-3 w-3"/>Scan</Button>
                            <Button asChild variant="outline" size="sm" className="flex-1" disabled={loading}>
                                <label className="cursor-pointer">
                                    <Upload className="mr-2 h-3 w-3"/>Upload
                                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileChange(e, documentType)} />
                                </label>
                            </Button>
                        </div>
                    </div>

                    {pages.length > 0 ? (
                        <div className="relative group border rounded h-24 bg-muted flex items-center justify-center overflow-hidden">
                            {pages[0].type === 'image' ? (
                                <img src={pages[0].dataUri} alt="doc" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-1">
                                    <File className="h-8 w-8 text-primary" />
                                    <span className="text-[10px] font-bold">PDF</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removePageFromDocument(documentType)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                    <div className="h-24 border-dashed border-2 rounded flex items-center justify-center text-muted-foreground text-[10px]">
                        Empty
                    </div>
                    )}
                    
                    {pages.length > 0 && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary" size="sm" className="w-full mt-2 h-8 text-xs font-bold">
                                <Eye className="mr-2 h-3 w-3"/>View
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Preview: {documentType}</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 min-h-0 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                                {pages[0].type === 'image' ? (
                                    <img src={pages[0].dataUri} alt="Preview" className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <iframe src={pages[0].dataUri} className="w-full h-full" title="PDF" />
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                    )}
                </div>
            );
          })}
        </div>
      </div>

       <Dialog open={!!isScanning} onOpenChange={(isOpen) => !isOpen && stopScan()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Scan: {isScanning}</DialogTitle>
                </DialogHeader>
                <div className="relative">
                    <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay playsInline muted />
                    <canvas ref={canvasRef} className="hidden" />
                    {hasCameraPermission === false && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                            <Alert variant="destructive" className="m-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Need Camera</AlertTitle>
                                <AlertDescription>Allow camera in browser.</AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={stopScan}>Cancel</Button>
                    <Button onClick={captureImage} disabled={!hasCameraPermission} className="font-bold">Take Photo</Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
