'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { Info, Eye, Camera, Trash2, Upload, File, ScanLine, Loader2, AlertCircle, ChevronLeft, ChevronRight, Plus, ShieldAlert, Database } from 'lucide-react';

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
import { mergeToPdf, countPdfPages, validatePdf, getBase64Size } from '@/lib/pdf-utils';

type DocumentState = {
  documentType: string;
  pages: string[]; // array of data URIs
  pageCounts: number[]; // track individual page counts for display
  sizes: number[];
  corruptionStatus: boolean[];
};

export default function StepDocumentUpload({ disabled }: { disabled?: boolean }) {
  const { toast } = useToast();
  const form = useFormContext<OnboardingFormData>();
  const [documents, setDocuments] = React.useState<Record<string, DocumentState>>({});
  const [isValidating, setIsValidating] = React.useState<string | null>(null);
  const [isMerging, setIsMerging] = React.useState<boolean>(false);
  
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [isScanning, setIsScanning] = React.useState<string | null>(null);
  const [activeUploadType, setActiveUploadType] = React.useState<string | null>(null);

  const clientType = form.watch('clientType');
  const documentRequirements = React.useMemo(() => getDocumentRequirements(clientType), [clientType]);

  // Initialize state from form values
  React.useEffect(() => {
    const existingCaptured = form.getValues('capturedDocuments') || [];
    const initialDocs: Record<string, DocumentState> = {};

    documentRequirements.forEach(req => {
      const existing = existingCaptured.find(d => d.type === req.document);
      initialDocs[req.document] = { 
        documentType: req.document, 
        pages: existing?.pages || (existing ? [existing.url] : []),
        pageCounts: existing?.pages?.map(p => p.startsWith('data:application/pdf') ? (existing.pageCount || 1) : 1) || [],
        sizes: existing?.pages?.map(p => getBase64Size(p)) || [],
        corruptionStatus: existing?.pages?.map(() => false) || []
      };
    });
    setDocuments(initialDocs);
  }, [documentRequirements]);

  // Sync local documents state to main form with accurate page counting
  React.useEffect(() => {
    if (Object.keys(documents).length === 0) return;

    const syncToForm = async () => {
        setIsMerging(true);
        const capturedDocs = await Promise.all(
            Object.values(documents)
                .filter(doc => doc.pages.length > 0)
                .map(async (doc) => {
                    const result = await mergeToPdf(doc.pages);
                    return {
                        type: doc.documentType,
                        fileName: `${doc.documentType.toLowerCase().replace(/\s/g, '_')}.pdf`,
                        url: result.url,
                        pages: doc.pages,
                        pageCount: result.count,
                        fileSize: result.size
                    };
                })
        );
        
        const currentVal = form.getValues('capturedDocuments') || [];
        if (JSON.stringify(currentVal) !== JSON.stringify(capturedDocs)) {
            form.setValue('capturedDocuments', capturedDocs, { shouldValidate: true, shouldDirty: true });
        }
        setIsMerging(false);
    };

    const timer = setTimeout(syncToForm, 800);
    return () => clearTimeout(timer);
  }, [documents]);

  const handleUploadClick = (docType: string) => {
    if (disabled) return;
    setActiveUploadType(docType);
    setTimeout(() => {
        fileInputRef.current?.click();
    }, 0);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const documentType = activeUploadType;
    if (!file || !documentType) return;
    
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please use an image or PDF.' });
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUri = event.target?.result as string;
      const isImage = file.type.startsWith('image/');
      let pageCount = 1;
      let corruptionError = null;

      setIsValidating(documentType);
      
      if (isImage) {
        const result = await validateImageQualityHeuristic(dataUri);
        if (!result.isValid) {
          toast({ variant: 'destructive', title: 'Quality Check Failed', description: result.reason || 'Image not clear.' });
          setIsValidating(null);
          return;
        }
      } else {
        const validation = await validatePdf(dataUri);
        if (!validation.isValid) {
          corruptionError = validation.error;
          toast({ variant: 'destructive', title: 'Corruption Detected', description: validation.error });
          setIsValidating(null);
          return;
        }
        pageCount = await countPdfPages(dataUri);
      }

      const size = getBase64Size(dataUri);
      
      setDocuments(prev => ({
        ...prev,
        [documentType]: { 
            ...prev[documentType], 
            pages: [...prev[documentType].pages, dataUri],
            pageCounts: [...prev[documentType].pageCounts, pageCount],
            sizes: [...prev[documentType].sizes, size],
            corruptionStatus: [...prev[documentType].corruptionStatus, !!corruptionError]
        }
      }));
      
      setIsValidating(null);
      toast({ title: 'Added', description: `Entry added successfully (${pageCount} total pages, ${(size / 1024).toFixed(1)} KB).` });
      
      if (fileInputRef.current) fileInputRef.current.value = '';
      setActiveUploadType(null);
    };
    reader.readAsDataURL(file);
  };
  
  const removePage = (documentType: string, pageIndex: number) => {
    if (disabled) return;
    setDocuments(prev => ({
        ...prev,
        [documentType]: { 
            ...prev[documentType], 
            pages: prev[documentType].pages.filter((_, i) => i !== pageIndex),
            pageCounts: prev[documentType].pageCounts.filter((_, i) => i !== pageIndex),
            sizes: prev[documentType].sizes.filter((_, i) => i !== pageIndex),
            corruptionStatus: prev[documentType].corruptionStatus.filter((_, i) => i !== pageIndex)
        }
    }));
  };

  const movePage = (documentType: string, from: number, to: number) => {
    if (disabled) return;
    const doc = documents[documentType];
    const pages = [...doc.pages];
    const counts = [...doc.pageCounts];
    const sizes = [...doc.sizes];
    const corrupts = [...doc.corruptionStatus];
    
    if (to < 0 || to >= pages.length) return;
    
    const pageItem = pages.splice(from, 1)[0];
    pages.splice(to, 0, pageItem);
    
    const countItem = counts.splice(from, 1)[0];
    counts.splice(to, 0, countItem);

    const sizeItem = sizes.splice(from, 1)[0];
    sizes.splice(to, 0, sizeItem);

    const corruptItem = corrupts.splice(from, 1)[0];
    corrupts.splice(to, 0, corruptItem);

    setDocuments(prev => ({
        ...prev,
        [documentType]: { ...prev[documentType], pages, pageCounts: counts, sizes, corruptionStatus: corrupts }
    }));
  };

  const startScan = async (docType: string) => {
    if (disabled) return;
    setIsScanning(docType);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
      }, 300);
    } catch (error) {
      console.error('Camera Access Error:', error);
      setHasCameraPermission(false);
      setIsScanning(null);
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access the camera.' });
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
            if (!result.isValid) {
              toast({ variant: 'destructive', title: 'Quality Check Failed', description: 'Image not clear.' });
              setIsValidating(null);
              return;
            }
            
            const size = getBase64Size(dataUri);
            
            setDocuments(prev => ({
                ...prev,
                [docType]: { 
                    ...prev[docType], 
                    pages: [...prev[docType].pages, dataUri],
                    pageCounts: [...prev[docType].pageCounts, 1],
                    sizes: [...prev[docType].sizes, size],
                    corruptionStatus: [...prev[docType].corruptionStatus, false]
                }
            }));
            setIsValidating(null);
            toast({ title: 'Capture OK', description: 'Photo added to document.' });
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
    <div className="space-y-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanLine className="h-6 w-6 text-primary" />
          Regulatory Documents
        </CardTitle>
        <CardDescription>{disabled ? 'View application archives.' : 'Multi-page document capture with corruption scanning and metadata tracking.'}</CardDescription>
      </CardHeader>
      
      {!disabled && (
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden"
            onChange={handleFileChange} 
            accept="image/*,application/pdf"
        />
      )}

      <div className="space-y-6 px-6 pb-6">
        <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4" />
            <AlertTitle className="text-[10px] font-black uppercase tracking-widest">Requirement: {clientType}</AlertTitle>
            <AlertDescription>
                <div className="max-h-48 overflow-auto mt-2">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead className="text-[9px] uppercase font-black">Document Type</TableHead>
                              <TableHead className="text-[9px] uppercase font-black">Mandatory Format</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {documentRequirements.map((req) => (
                              <TableRow key={req.document}>
                                  <TableCell className="font-bold text-xs uppercase text-foreground/80">{req.document}</TableCell>
                                  <TableCell className="text-xs text-muted-foreground">{req.comment}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
                </div>
            </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-6">
          {Object.values(documents).map(({documentType, pages, pageCounts, sizes, corruptionStatus}) => {
            const loading = isValidating === documentType;
            const totalPages = pageCounts.reduce((a, b) => a + b, 0);
            const totalSize = sizes.reduce((a, b) => a + b, 0);
            const hasCorruption = corruptionStatus.some(c => c);

            return (
                <div key={documentType} className={`p-6 border rounded-2xl transition-all bg-card shadow-sm relative overflow-hidden ${hasCorruption ? 'border-destructive/50' : 'hover:border-primary/50'}`}>
                    {loading && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest text-primary">Scanning Document Data...</span>
                      </div>
                    )}
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight truncate max-w-[300px]" title={documentType}>{documentType}</h3>
                            <div className="flex items-center gap-3 mt-1.5">
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{disabled ? 'Archive State' : 'Metadata Engine Active'}</p>
                                {totalSize > 0 && <Badge variant="outline" className="text-[9px] font-mono py-0 h-4">{(totalSize / 1024).toFixed(1)} KB</Badge>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasCorruption && <Badge variant="destructive" className="font-black animate-pulse"><ShieldAlert className="mr-1 h-3 w-3" /> CORRUPT ENTRY</Badge>}
                            <Badge variant={totalPages > 0 ? 'success' : 'outline'} className="px-4 py-1.5 font-black uppercase tracking-widest text-xs">
                                {totalPages} {totalPages === 1 ? 'PAGE' : 'PAGES'} CAPTURED
                            </Badge>
                        </div>
                    </div>
                
                    <div className="flex flex-col lg:flex-row gap-6 mb-2">
                        <div className="flex-1">
                            {pages.length > 0 ? (
                                <ScrollArea className="w-full whitespace-nowrap rounded-xl border bg-muted/20 p-4 shadow-inner">
                                    <div className="flex w-max space-x-4">
                                        {pages.map((page, index) => (
                                            <div key={index} className={`relative w-36 h-48 rounded-lg border bg-background overflow-hidden group shadow-md transition-transform hover:scale-[1.02] ${corruptionStatus[index] ? 'border-destructive' : ''}`}>
                                                {page.startsWith('data:application/pdf') ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-muted/50">
                                                        <File className={`h-12 w-12 ${corruptionStatus[index] ? 'text-destructive' : 'text-primary'}`} />
                                                        <div className="text-center">
                                                            <span className="text-[8px] font-black uppercase block">Binary Stream</span>
                                                            <Badge variant="secondary" className="text-[8px] px-1 h-4 font-mono">{pageCounts[index]} Pgs</Badge>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <img src={page} alt={`Page ${index+1}`} className="w-full h-full object-cover" />
                                                )}
                                                <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded-full font-black border border-white/10">
                                                    #{index + 1}
                                                </div>
                                                {!disabled && (
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-opacity backdrop-blur-[2px]">
                                                        <div className="flex gap-2">
                                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => movePage(documentType, index, index - 1)} disabled={index === 0}>
                                                                <ChevronLeft className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => movePage(documentType, index, index + 1)} disabled={index === pages.length - 1}>
                                                                <ChevronRight className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <Button variant="destructive" size="icon" className="h-9 w-9 rounded-full shadow-lg" onClick={() => removePage(documentType, index)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {!disabled && (
                                            <div 
                                                className="w-36 h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center bg-muted/10 text-muted-foreground gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer group"
                                                onClick={() => handleUploadClick(documentType)}
                                            >
                                                <Plus className="h-8 w-8 opacity-20 group-hover:opacity-50 group-hover:scale-110 transition-all" />
                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Add Stream</span>
                                            </div>
                                        )}
                                    </div>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            ) : (
                                <div className="h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5 gap-4 shadow-inner">
                                    <Database className="h-12 w-12 opacity-10" />
                                    <div className="text-center">
                                        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Registry Block Empty</p>
                                        <p className="text-[10px] mt-1 opacity-30">Awaiting multi-page ingestion</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="w-full lg:w-56 flex flex-col gap-3">
                            {!disabled && (
                                <>
                                    <Button 
                                        variant="outline" 
                                        className="w-full h-12 font-black uppercase tracking-widest border-primary/20 hover:bg-primary/5 rounded-xl shadow-sm" 
                                        onClick={() => startScan(documentType)} 
                                        disabled={loading}
                                    >
                                        <Camera className="mr-2 h-4 w-4 text-primary"/>Capture Photo
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="w-full h-12 font-black uppercase tracking-widest border-primary/20 hover:bg-primary/5 rounded-xl shadow-sm" 
                                        onClick={() => handleUploadClick(documentType)} 
                                        disabled={loading}
                                    >
                                        <Upload className="mr-2 h-4 w-4 text-primary"/>Injest Data
                                    </Button>
                                </>
                            )}
                            {pages.length > 0 && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="secondary" className="w-full h-10 font-black uppercase text-[10px] tracking-widest rounded-xl">
                                            <Eye className="mr-2 h-3.5 w-3.5"/>Preview Forensic File
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-5xl h-[90vh] flex flex-col rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                                        <DialogHeader className="p-6 bg-background border-b flex flex-row justify-between items-center">
                                            <div>
                                                <DialogTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary">Technical Registry: {documentType}</DialogTitle>
                                                <p className="text-[10px] font-mono text-muted-foreground mt-1">Status: OK • Total Pages: {totalPages} • Total Volume: {(totalSize / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </DialogHeader>
                                        <div className="flex-1 min-h-0 bg-black overflow-hidden flex items-center justify-center relative">
                                            {isMerging && (
                                                <div className="absolute inset-0 bg-black/90 z-20 flex flex-col items-center justify-center text-white gap-4">
                                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                                    <div className="text-center">
                                                        <p className="text-sm font-black uppercase tracking-widest">Generating Regulatory PDF...</p>
                                                        <p className="text-[10px] text-white/40 mt-1 uppercase font-bold tracking-tighter">Merging multi-stream data points</p>
                                                    </div>
                                                </div>
                                            )}
                                            <iframe 
                                                src={form.getValues('capturedDocuments').find(d => d.type === documentType)?.url} 
                                                className="w-full h-full border-none" 
                                                title="Forensic PDF Preview" 
                                            />
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
            <DialogContent className="max-w-2xl bg-background border-primary/20 rounded-3xl p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b bg-muted/20">
                    <DialogTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight">
                        <Camera className="h-6 w-6 text-primary" />
                        Capture Page: {isScanning}
                    </DialogTitle>
                </DialogHeader>
                <div className="relative aspect-video bg-black shadow-inner">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-0 pointer-events-none border-[60px] border-black/40 flex items-center justify-center">
                        <div className="w-full h-full border-2 border-primary/50 border-dashed animate-pulse rounded-sm"></div>
                    </div>
                    {hasCameraPermission === false && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                            <Alert variant="destructive" className="max-w-sm border-destructive/20 shadow-2xl">
                                <AlertCircle className="h-5 w-5" />
                                <AlertTitle className="font-black uppercase text-xs tracking-widest">Camera Denied</AlertTitle>
                                <AlertDescription className="text-sm">Please allow hardware access in your browser to proceed with document scanning.</AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
                <div className="p-6 flex justify-between items-center bg-muted/10">
                    <Button variant="ghost" onClick={stopScan} className="font-bold hover:bg-destructive/10 hover:text-destructive px-8">ABORT</Button>
                    <Button onClick={captureImage} disabled={!hasCameraPermission} className="bg-primary text-primary-foreground font-black px-12 h-14 rounded-xl shadow-xl hover:scale-[1.02] transition-transform active:scale-95">TAKE SNAPSHOT</Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
