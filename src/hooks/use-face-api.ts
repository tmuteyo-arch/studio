'use client';

import * as React from 'react';
import * as faceapi from 'face-api.js';
import { useToast } from './use-toast';

export function useFaceApi() {
    const [modelsLoaded, setModelsLoaded] = React.useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models'; // Models are in the public/models directory
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);
            } catch (error) {
                console.error("Error loading face-api models:", error);
                toast({
                    variant: 'destructive',
                    title: 'Model Load Error',
                    description: 'Could not load AI models for face verification. Please refresh the page.'
                });
            }
        };
        loadModels();
    }, [toast]);

    const getFaceMatcher = async (imageUrl: string, label: string) => {
        if (!modelsLoaded) return null;

        try {
            const img = await faceapi.fetchImage(imageUrl);
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            if (!detections) {
                return null;
            }
            return new faceapi.FaceMatcher([new faceapi.LabeledFaceDescriptors(label, [detections.descriptor])]);
        } catch (error) {
            console.error("Error creating face matcher:", error);
            return null;
        }
    };

    return { modelsLoaded, getFaceMatcher };
}
