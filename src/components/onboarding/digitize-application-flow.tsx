'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { useAtom } from 'jotai';
import { applicationsAtom, Application } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/users';
import { ArrowLeft, Loader2, FileUp, Camera, Upload, Trash2, File, ScanLine } from 'lucide-react';
import { useFirestore, useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '../ui/badge';

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
  const { firestore } = useFirebase();
  const [, setApplications] = useAtom(applicationsAtom);

  const [clientName, setClientName] = React.useState('');
  const [documentType, setDocumentType] = React.useState('Other Document');
  const [pages, setPages] = React.useState<PageState[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = React.useState<boolean>(false);

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

  // CAMERA LOGIC
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

  const onSubmit = async () => {
    if (!clientName.trim() || pages.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Information',
        description: 'Please provide a client name and upload at least one document page.',
      });
      return;
    }

    setIsSubmitting(true);

    const newApplicationData: Application = {
      id: `ARC-${String(Date.now()).slice(-6)}`,
      clientName: clientName.trim(),
      clientType: 'Archived',
      status: 'Archived',
      submittedDate: format(new Date(), 'yyyy-MM-dd'),
      lastUpdated: new Date().toISOString(),
      submittedBy: user.name,
      fcbStatus: 'Inclusive',
      details: {
        fullName: clientName, // Use client name as primary contact
        address: 'N/A',
        dateOfBirth: '',
        contactNumber: 'N/A',
        email: 'N/A'
      },
      directors: [],
      documents: pages.map((page, index) => ({
        type: page.documentType,
        fileName: page.file?.name || `scan_${index + 1}.jpg`,
        url: '#', // Placeholder URL
      })),
      history: [
        { action: 'Archived', user: user.name, timestamp: new Date().toISOString(), notes: 'Digitalized from paper record.' },
      ],
      comments: [],
    };

    setApplications(prev => [newApplicationData, ...prev]);

    if (firestore) {
      try {
        const { id, ...appDataForFirebase } = newApplicationData;
        await addDoc(collection(firestore, 'applications'), {
          ...appDataForFirebase,
          lastUpdated: serverTimestamp()
        });
      } catch (error) {
        console.error("Error adding document: ", error);
        toast({
          title: "Submission Failed",
          description: "Could not save archived application to the database.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    toast({
      title: "Application Archived!",
      description: `The application for ${clientName} has been successfully digitized and saved.`,
    });

    setTimeout(() => {
      onCancel();
    }, 1000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
          <Button variant="outline" type="button" onClick={onCancel}>
             <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Digitize Paper Application</CardTitle>
          <CardDescription>
            Create a new digital archive for a paper-based application. Provide a client name, then scan or upload all relevant documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="client-name">Client Name or Company Name</Label>
            <Input
              id="client-name"
              placeholder="Enter the name on the application"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <div className="p-4 border rounded-lg space-y-4">
             <h3 className="font-semibold text-lg">Documents</h3>
              {pages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                  {pages.map((page, index) => (
                    <div key={index} className="relative group border rounded-md p-1 h-28 flex flex-col justify-center">
                      {page.type === 'image' ? (
                        <img src={page.dataUri} alt={`Page ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <div className="flex flex-col items-center justify-center bg-muted rounded-md p-2 h-full">
                            <File className="h-8 w-8 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground mt-2 w-full text-center truncate" title={page.file?.name}>{page.file?.name || 'document.pdf'}</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removePage(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8 border-dashed border-2 rounded-lg">
                    <ScanLine className="mx-auto h-12 w-12" />
                    <p>No documents added yet.</p>
                    <p className="text-xs">Start by scanning or uploading pages.</p>
                </div>
              )}

             <div className="flex gap-4 items-center">
                <div className="space-y-2">
                    <Label htmlFor="doc-type">Current Document Type</Label>
                    <Input id="doc-type" value={documentType} onChange={e => setDocumentType(e.target.value)} placeholder="e.g., Passport, CR14"/>
                </div>
                <div className="flex gap-2 border-l pl-4 mt-6">
                    <Button variant="outline" size="sm" onClick={startScan}><Camera className="mr-2 h-4 w-4"/>Scan Page</Button>
                     <Button asChild variant="outline" size="sm">
                        <label className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4"/>Upload Page
                            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                        </label>
                    </Button>
                </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 justify-end">
          <Button onClick={onSubmit} disabled={isSubmitting || !clientName.trim() || pages.length === 0}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? 'Saving...' : 'Save Archived Application'}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isScanning} onOpenChange={(isOpen) => !isOpen && stopScan()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Scan Document Page</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Alert variant="destructive" className="m-4">
                  <AlertDescription>Camera access is required. Please enable it in your browser settings.</AlertDescription>
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
