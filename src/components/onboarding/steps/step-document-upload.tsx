'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { Info, Eye, Camera, Trash2, Upload, File, ScanLine, Loader2, AlertCircle, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDocumentRequirements } from '@/lib/document-requirements';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { validateImageQualityHeuristic } from '@/lib/image-validation';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

type DocumentState = {
  documentType: string;
  pages: string[]; // array of data URIs
};

export default function StepDocumentUpload() {
  const { toast } = useToast();
  const form = useFormContext<OnboardingFormData>();
  const [documents, setDocuments] = React.useState<Record<string, DocumentState>>({});
  const [isValidating, setIsValidating] = React.useState<string | null>(null);
  const [isMerging, setIsMerging] = React.useState<boolean>(false);
  
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
        pages: existing?.pages || (existing ? [existing.url] : []) 
      };
    });
    setDocuments(initialDocs);
  }, [documentRequirements, form]);

  const generateMergedPdf = async (pages: string[]): Promise<string> => {
    if (pages.length === 0) return '';
    if (pages.length === 1 && pages[0].startsWith('data:application/pdf')) return pages[0];
    
    // Dynamic import for SSR safety
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage();
      const page = pages[i];
      if (page.startsWith('data:image')) {
        pdf.addImage(page, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }
    }
    return pdf.output('datauristring');
  };

  // Sync documents state to form value for submission
  React.useEffect(() => {
    if (Object.keys(documents).length === 0) return;

    const syncToForm = async () => {
        setIsMerging(true);
        const capturedDocs = await Promise.all(
            Object.values(documents)
                .filter(doc => doc.pages.length > 0)
                .map(async (doc) => {
                    const mergedUrl = await generateMergedPdf(doc.pages);
                    return {
                        type: doc.documentType,
                        fileName: `${doc.documentType.toLowerCase().replace(/\s/g, '_')}.pdf`,
                        url: mergedUrl,
                        pages: doc.pages
                    };
                })
        );
        
        const currentVal = form.getValues('capturedDocuments') || [];
        if (JSON.stringify(currentVal) !== JSON.stringify(capturedDocs)) {
            form.setValue('capturedDocuments', capturedDocs, { shouldValidate: true });
        }
        setIsMerging(false);
    };

    const timer = setTimeout(syncToForm, 500); // Debounce merging
    return () => clearTimeout(timer);
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
      const isImage = file.type.startsWith('image/');

      if (isImage) {
        setIsValidating(documentType);
        const result = await validateImageQualityHeuristic(dataUri);
        setIsValidating(null);

        if (!result.isValid) {
          toast({
            variant: 'destructive',
            title: 'Quality Check Failed',
            description: 'Image not clear. Please retake photo.',
          });
          return;
        }
      }

      setDocuments(prev => ({
        ...prev,
        [documentType]: { 
            ...prev[documentType], 
            pages: [...prev[documentType].pages, dataUri] 
        }
      }));
      toast({ title: 'Page Added', description: 'New page added to document.' });
    };
    reader.readAsDataURL(file);
  };
  
  const removePage = (documentType: string, pageIndex: number) => {
    setDocuments(prev => ({
        ...prev,
        [documentType]: { 
            ...prev[documentType], 
            pages: prev[documentType].pages.filter((_, i) => i !== pageIndex) 
        }
    }));
  };

  const movePage = (documentType: string, from: number, to: number) => {
    const pages = [...documents[documentType].pages];
    if (to < 0 || to >= pages.length) return;
    const item = pages.splice(from, 1)[0];
    pages.splice(to, 0, item);
    setDocuments(prev => ({
        ...prev,
        [documentType]: { ...prev[documentType], pages }
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
            
            const result = await validateImageQualityHeuristic(dataUri);
            setIsValidating(null);
            
            if (!result.isValid) {
              toast({
                variant: 'destructive',
                title: 'Quality Check Failed',
                description: 'Image not clear. Please retake photo.',
              });
              return;
            }
            
            setDocuments(prev => ({
                ...prev,
                [docType]: { 
                    ...prev[docType], 
                    pages: [...prev[docType].pages, dataUri] 
                }
            }));
            toast({ title: 'Page Added', description: 'Photo added as new page.' });
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
          Add Documents
        </CardTitle>
        <CardDescription>Capture multiple pages per document using camera or upload.</CardDescription>
      </CardHeader>
      <div className="space-y-6 px-6">
        
        <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4" />
            <AlertTitle>Required for {clientType}</AlertTitle>
            <AlertDescription>
                <div className="max-h-48 overflow-auto mt-2">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Document</TableHead>
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

        <div className="grid grid-cols-1 gap-6">
          {Object.values(documents).map(({documentType, pages}) => {
            const loading = isValidating === documentType;
            return (
                <div key={documentType} className="p-6 border rounded-xl hover:border-primary/50 transition-colors bg-card shadow-sm relative overflow-hidden">
                    {loading && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest text-primary">Checking Quality...</span>
                      </div>
                    )}
                    <div className='flex justify-between items-center mb-4'>
                        <div>
                            <h3 className="text-md font-bold truncate max-w-[250px]" title={documentType}>{documentType}</h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Multi-Page Support Active</p>
                        </div>
                        <Badge variant={pages.length > 0 ? 'success' : 'outline'} className="px-3 py-1 font-black">
                            {pages.length} {pages.length === 1 ? 'PAGE' : 'PAGES'}
                        </Badge>
                    </div>
                
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            {pages.length > 0 ? (
                                <ScrollArea className="w-full whitespace-nowrap rounded-lg border bg-muted/20 p-4">
                                    <div className="flex w-max space-x-4">
                                        {pages.map((page, index) => (
                                            <div key={index} className="relative w-32 h-44 rounded-md border bg-background overflow-hidden group shadow-sm">
                                                {page.startsWith('data:application/pdf') ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-muted/50">
                                                        <File className="h-10 w-10 text-primary" />
                                                        <span className="text-[8px] font-black">PDF PAGE</span>
                                                    </div>
                                                ) : (
                                                    <img src={page} alt={`Page ${index+1}`} className="w-full h-full object-cover" />
                                                )}
                                                <div className="absolute top-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">
                                                    #{index + 1}
                                                </div>
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity">
                                                    <div className="flex gap-1">
                                                        <Button variant="secondary" size="icon" className="h-6 w-6" onClick={() => movePage(documentType, index, index - 1)} disabled={index === 0}>
                                                            <ChevronLeft className="h-3 w-3" />
                                                        </Button>
                                                        <Button variant="secondary" size="icon" className="h-6 w-6" onClick={() => movePage(documentType, index, index + 1)} disabled={index === pages.length - 1}>
                                                            <ChevronRight className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => removePage(documentType, index)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="w-32 h-44 rounded-md border-2 border-dashed flex flex-col items-center justify-center bg-muted/10 text-muted-foreground gap-2">
                                            <Plus className="h-6 w-6 opacity-20" />
                                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Add Page</span>
                                        </div>
                                    </div>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            ) : (
                                <div className="h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5 gap-3">
                                    <File className="h-10 w-10 opacity-10" />
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-40">No pages added yet</p>
                                </div>
                            )}
                        </div>
                        <div className="w-full sm:w-48 space-y-2">
                            <Button variant="outline" className="w-full h-12 font-black uppercase tracking-widest border-primary/20 hover:bg-primary/5" onClick={() => startScan(documentType)} disabled={loading}>
                                <Camera className="mr-2 h-4 w-4 text-primary"/>Scan Page
                            </Button>
                            <Button asChild variant="outline" className="w-full h-12 font-black uppercase tracking-widest border-primary/20 hover:bg-primary/5" disabled={loading}>
                                <label className="cursor-pointer flex items-center justify-center">
                                    <Upload className="mr-2 h-4 w-4 text-primary"/>Upload Page
                                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileChange(e, documentType)} />
                                </label>
                            </Button>
                            {pages.length > 0 && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="secondary" className="w-full h-10 font-bold uppercase text-[10px] tracking-widest">
                                            <Eye className="mr-2 h-3 w-3"/>Preview Doc
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
                                        <DialogHeader>
                                            <DialogTitle>Document Preview: {documentType}</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex-1 min-h-0 bg-black rounded-md overflow-hidden flex items-center justify-center relative">
                                            {isMerging && (
                                                <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center text-white gap-4">
                                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                                    <p className="text-xs font-black uppercase tracking-widest">Merging Pages...</p>
                                                </div>
                                            )}
                                            <iframe src={form.getValues('capturedDocuments').find(d => d.type === documentType)?.url} className="w-full h-full" title="PDF Preview" />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>
                </div>
            );
          })}
        </div>
      </div>

       <Dialog open={!!isScanning} onOpenChange={(isOpen) => !isOpen && stopScan()}>
            <DialogContent className="max-w-xl bg-background border-primary/20">
                <DialogHeader>
                    <DialogTitle>Scan Page: {isScanning}</DialogTitle>
                </DialogHeader>
                <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 shadow-2xl">
                    <video ref={videoRef} className="w-full aspect-video bg-black" autoPlay playsInline muted />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40 flex items-center justify-center">
                        <div className="w-full h-full border-2 border-primary/50 border-dashed animate-pulse"></div>
                    </div>
                    {hasCameraPermission === false && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                            <Alert variant="destructive" className="m-4 max-w-xs">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Need Camera</AlertTitle>
                                <AlertDescription>Please allow camera access in your browser.</AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={stopScan} className="font-bold">Cancel</Button>
                    <Button onClick={captureImage} disabled={!hasCameraPermission} className="bg-primary text-primary-foreground font-black px-8">Take Photo</Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
