'use client';

import * as React from 'react';
import * as faceapi from 'face-api.js';
import { Camera, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface StepFacialRecognitionProps {
  next: () => void;
}

export default function StepFacialRecognition({ next }: StepFacialRecognitionProps) {
  const { toast } = useToast();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const loadModelsAndCamera = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error initializing camera or models:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      } finally {
        setIsInitializing(false);
      }
    };

    loadModelsAndCamera();
    
    return () => {
        const stream = videoRef.current?.srcObject as MediaStream;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [toast]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
      }
    }
  };
  
  const handleRetake = () => {
      setCapturedImage(null);
  }

  return (
    <div>
      <CardHeader>
        <CardTitle>Facial Recognition</CardTitle>
        <CardDescription>
          Please look directly at the camera. We need to capture your photo for identity verification.
        </CardDescription>
      </CardHeader>
      <div className="px-6 space-y-4">
        <div className="w-full aspect-video rounded-md border bg-muted flex items-center justify-center overflow-hidden relative">
            {isInitializing ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Initializing Camera...</p>
                </div>
            ) : hasCameraPermission === false ? (
                 <Alert variant="destructive" className="w-auto">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access to use this feature.
                    </AlertDescription>
                </Alert>
            ) : (
                <>
                    <video 
                        ref={videoRef} 
                        className={`w-full h-full object-cover ${capturedImage ? 'hidden' : 'block'}`} 
                        autoPlay 
                        muted 
                        playsInline
                    />
                    {capturedImage && <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />}
                     <canvas ref={canvasRef} className="hidden" />
                </>
            )}
        </div>

        <div className="flex justify-center gap-4">
            {!capturedImage ? (
                <Button onClick={handleCapture} disabled={isInitializing || !hasCameraPermission}>
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Photo
                </Button>
            ) : (
                <>
                    <Button variant="outline" onClick={handleRetake}>
                       <RefreshCw className="mr-2 h-4 w-4" />
                       Retake
                    </Button>
                    <Button onClick={next}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirm and Continue
                    </Button>
                </>
            )}
        </div>
      </div>
    </div>
  );
}
