'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { Camera, Check, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFaceApi } from '@/hooks/use-face-api';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const LIVENESS_THRESHOLD = 0.8;

export default function StepLivenessCheck() {
  const { toast } = useToast();
  const { modelsLoaded, getFaceMatcher } = useFaceApi();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verificationResult, setVerificationResult] = React.useState<{ score: number; success: boolean } | null>(null);
  
  // Get ID document data from a previous step (assuming it's stored)
  // For now, we'll use a placeholder.
  const idPhotoDataUrl = 'data:image/jpeg;base64,...'; // Placeholder

  React.useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast({
            variant: 'destructive',
            title: 'Camera Not Supported',
            description: 'Your browser does not support camera access.',
        });
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
        setHasCameraPermission(false);
      }
    };

    if(modelsLoaded){
        getCameraPermission();
    }

    return () => {
      // Cleanup: stop video stream when component unmounts
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [modelsLoaded, toast]);

  const handleVerify = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) {
      toast({ title: 'Initialization incomplete. Please wait.' });
      return;
    }
    
    setIsVerifying(true);
    setVerificationResult(null);

    // Placeholder for actual face matching logic
    // This would involve capturing a frame, detecting a face, and comparing it
    // with the face from the uploaded ID document.
    setTimeout(() => {
        const mockScore = Math.random() * (0.95 - 0.7) + 0.7; // Simulate a realistic score
        const success = mockScore >= LIVENESS_THRESHOLD;
        setVerificationResult({ score: mockScore, success });
        setIsVerifying(false);
        toast({
            title: success ? 'Verification Successful' : 'Verification Failed',
            description: `Face match score: ${mockScore.toFixed(2)}`,
            variant: success ? 'default' : 'destructive',
        });
    }, 2000);
  };

  const resetVerification = () => {
      setVerificationResult(null);
      setIsVerifying(false);
  }

  if (!modelsLoaded) {
      return (
          <div>
            <CardHeader>
                <CardTitle>Loading Verification Models</CardTitle>
                <CardDescription>Please wait while we prepare the secure verification environment. This may take a moment.</CardDescription>
            </CardHeader>
            <div className="px-6 space-y-4">
                <Progress value={50} className="w-full" />
                <p className="text-center text-muted-foreground">Loading AI models...</p>
            </div>
          </div>
      )
  }

  return (
    <div>
      <CardHeader>
        <CardTitle>Liveness & Identity Verification</CardTitle>
        <CardDescription>
          Please look directly at the camera to verify your identity against your uploaded ID.
        </CardDescription>
      </CardHeader>
      <div className="space-y-6 px-6">
        <div className="relative aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden border">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {!hasCameraPermission && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center text-center p-4">
                     <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                     <h3 className="font-semibold">Camera Access Required</h3>
                     <p className="text-sm text-muted-foreground">Please grant camera permissions to continue with identity verification.</p>
                </div>
            )}
        </div>
        
        {verificationResult ? (
             <div className="text-center space-y-4">
                <Alert variant={verificationResult.success ? 'default' : 'destructive'}>
                    {verificationResult.success ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{verificationResult.success ? 'Verification Successful!' : 'Verification Failed'}</AlertTitle>
                    <AlertDescription>
                        Your identity has been {verificationResult.success ? 'successfully' : 'unsuccessfully'} verified with a confidence score of <strong>{verificationResult.score.toFixed(2)}</strong>.
                    </AlertDescription>
                </Alert>
                {!verificationResult.success &&
                    <Button variant="outline" onClick={resetVerification}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                }
            </div>
        ) : (
            <Button onClick={handleVerify} disabled={!hasCameraPermission || isVerifying} className="w-full max-w-md mx-auto flex">
              {isVerifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Camera className="mr-2 h-4 w-4" />
              )}
              {isVerifying ? 'Verifying...' : 'Verify My Identity'}
            </Button>
        )}
      </div>
    </div>
  );
}
