'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { useAtom } from 'jotai';
import { applicationsAtom, Application } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/users';
import { ArrowLeft, Loader2, FileUp, Camera, Upload, Trash2, File, ScanLine, Info, CheckCircle2, AlertCircle } from 'lucide-react';
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

type PageState = {
  source: 'scan' | 'upload';
  dataUri: string;
  file?: File;
  type: 'image' | 'pdf';
  documentType: string;
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

  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
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
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
      addPage({ source: 'upload', dataUri, file, type: fileType, documentType });
    };
    reader.readAsDataURL(file);
  };

  const addPage = (page: PageState) => {
    setPages(prev => [...prev, page]);
    toast({ title: 'Page Added', description: `Added a new page for ${clientName || 'this application'}.` });
  };

  const removePage = (pageIndex: number) => {
    setPages(prev => prev.filter((_, i) => i !== pageIndex));
  };

  const startScan = async () => {
    setIsScanning(true);
    if (hasCameraPermission === false) {
      toast({ variant: 'destructive', title: 'Camera Access Denied', description: 'Please enable camera permissions.' });
      setIsScanning(false);
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
      setIsScanning(false);
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access the camera.' });
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        addPage({ source: 'scan', dataUri, type: 'image', documentType });
      }
      stopScan();
    }
  };

  const stopScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const onSubmit = () => {
    if (!clientName.trim() || !clientType || pages.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Information',
        description: 'Please provide a client name, account type, and upload at least one document page.',
      });
      return;
    }

    setIsSubmitting(true);
    
    const newApplication = {
      id: `APP-ARCHIVED-${Date.now()}`,
      clientName: clientName.trim(),
      clientType: clientType,
      status: 'Archived',
      submittedDate: format(new Date(), 'yyyy-MM-dd'),
      lastUpdated: new Date().toISOString(),
      submittedBy: user.name,
      fcbStatus: 'Inclusive',
      details: {
        clientType: clientType,
        organisationLegalName: clientName,
        individualFirstName: clientName,
        address: 'N/A',
        dateOfBirth: '',
        contactNumber: 'N/A',
        email: 'N/A'
      },
      signatories: [],
      documents: pages.map((page, index) => ({
        type: page.documentType,
        fileName: page.file?.name || `scan_${index + 1}.jpg`,
        url: '#',
      })),
      history: [
        { action: 'Archived', user: user.name, timestamp: new Date().toISOString(), notes: `Digitalized from paper record. Account Type: ${clientType}` },
      ],
      comments: [],
    } as Application;

    setApplications(prev => [newApplication, ...prev]);

    toast({
      title: "Application Archived!",
      description: `The application for ${clientName} has been successfully digitized and saved.`,
    });

    setTimeout(() => {
        setIsSubmitting(false);
        onCancel();
    }, 1000);
  };

  const isRequirementMet = (reqName: string) => {
    return pages.some(p => p.documentType === reqName);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
          <Button variant="outline" type="button" onClick={onCancel}>
             <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                <CardTitle>Digitize Paper Application</CardTitle>
                <CardDescription>
                    Create a new digital archive for a paper-based application. Select account type, provide a name, and scan/upload all documents.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="client-type">Account Type</Label>
                        <Select value={clientType} onValueChange={setClientType}>
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
                        />
                    </div>
                </div>

                <div className="p-4 border rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        Captured Pages
                        <Badge variant="secondary" className="ml-2">{pages.length}</Badge>
                    </h3>
                    {pages.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                        {pages.map((page, index) => (
                            <div key={index} className="relative group border rounded-md p-1 h-32 flex flex-col justify-center bg-muted/30">
                            {page.type === 'image' ? (
                                <img src={page.dataUri} alt={`Page ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                            ) : (
                                <div className="flex flex-col items-center justify-center bg-muted rounded-md p-2 h-full">
                                    <File className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-[10px] text-muted-foreground mt-2 w-full text-center truncate" title={page.file?.name}>{page.file?.name || 'document.pdf'}</p>
                                </div>
                            )}
                            <div className="absolute top-1 left-1">
                                <Badge variant="secondary" className="text-[8px] px-1 py-0">{page.documentType}</Badge>
                            </div>
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removePage(index)}>
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-12 border-dashed border-2 rounded-lg bg-muted/10">
                            <ScanLine className="mx-auto h-12 w-12 opacity-20" />
                            <p className="mt-2">No pages added yet.</p>
                            <p className="text-xs">Start by scanning or uploading pages below.</p>
                        </div>
                    )}

                    <div className="space-y-4 bg-muted/20 p-4 rounded-md border border-primary/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="doc-type">Current Document Type</Label>
                                <Select value={documentType} onValueChange={setDocumentType}>
                                    <SelectTrigger id="doc-type">
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
                                <Button variant="outline" className="flex-1" onClick={startScan} disabled={!clientType}>
                                    <Camera className="mr-2 h-4 w-4"/>Scan Page
                                </Button>
                                <Button asChild variant="outline" className="flex-1" disabled={!clientType}>
                                    <label className="cursor-pointer flex items-center justify-center">
                                        <Upload className="mr-2 h-4 w-4"/>Upload File
                                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                                    </label>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 justify-end">
                <Button onClick={onSubmit} disabled={isSubmitting || !clientName.trim() || !clientType || pages.length === 0} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? 'Archiving...' : 'Save Archived Application'}
                </Button>
                </CardFooter>
            </Card>
        </div>

        <div className="space-y-6">
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" />
                        Requirements Checklist
                    </CardTitle>
                    <CardDescription className="text-xs">
                        {clientType ? `Mandatory docs for ${clientType}` : 'Select an account type to view requirements'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-[500px]">
                        <div className="p-4 space-y-3">
                            {clientType ? (
                                requirements.map((req) => {
                                    const met = isRequirementMet(req.document);
                                    return (
                                        <div 
                                            key={req.document} 
                                            className={`p-3 rounded-md border transition-all cursor-pointer ${met ? 'bg-green-500/10 border-green-500/20' : 'bg-card hover:border-primary/50'}`}
                                            onClick={() => setDocumentType(req.document)}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <p className={`text-sm font-bold ${met ? 'text-green-600' : ''}`}>{req.document}</p>
                                                    <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{req.comment}</p>
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
                                <div className="text-center py-12 text-muted-foreground">
                                    <p className="text-xs">Account type not selected.</p>
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
            <DialogTitle>Scan: {documentType}</DialogTitle>
          </DialogHeader>
          <div className="relative overflow-hidden rounded-lg border-2 border-primary/20 shadow-2xl">
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
            <Badge variant="secondary" className="font-mono">{documentType}</Badge>
            <div className="flex gap-2">
                <Button variant="outline" onClick={stopScan}>Cancel</Button>
                <Button onClick={captureImage} disabled={!hasCameraPermission} className="bg-primary text-primary-foreground font-bold">Capture Page</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
