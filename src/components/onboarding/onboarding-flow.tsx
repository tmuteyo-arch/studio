'use client';

import * as React from 'react';
import { FormProvider, useForm, type FieldName } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useAtom } from 'jotai';

import { OnboardingFormData, OnboardingFormSchema, Step, DirectorFormData } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressTracker } from './progress-tracker';

import StepAccountType from './steps/step-account-type';
import StepPersonalInfo from './steps/step-personal-info';
import StepDocumentUpload from './steps/step-document-upload';
import StepReview from './steps/step-review';
import { applicationsAtom } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/users';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { checkForDuplicates } from '@/lib/actions';


const baseSteps: Step[] = [
  { id: 'account-type', name: 'Account Type', fields: ['clientType'] },
  { id: 'personal-info', name: 'Applicant Info', fields: ['fullName', 'dateOfBirth', 'address', 'certificateOfIncorporationNumber'] },
  { id: 'document-upload', name: 'Document Upload', fields: ['document1Type', 'document2Type'] },
  { id: 'review-submit', name: 'Review & Submit', fields: ['signature', 'agreedToTerms'] },
];

const StepComponents: Record<string, React.ElementType> = {
  'account-type': StepAccountType,
  'personal-info': StepPersonalInfo,
  'document-upload': StepDocumentUpload,
  'review-submit': StepReview,
};

interface OnboardingFlowProps {
  onCancel: () => void;
  user: User;
}

type DuplicateInfo = {
  isDuplicate: boolean;
  message: string;
}

export default function OnboardingFlow({ onCancel, user }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const { toast } = useToast();
  const { firestore } = useFirestore();

  const [isCheckingDuplicates, setIsCheckingDuplicates] = React.useState(false);
  const [duplicateInfo, setDuplicateInfo] = React.useState<DuplicateInfo>({ isDuplicate: false, message: '' });

  const [, setApplications] = useAtom(applicationsAtom);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(OnboardingFormSchema),
    mode: 'onChange', // Validate on change to update submit button status
    defaultValues: {
      clientType: '',
      fullName: '',
      dateOfBirth: '',
      address: '',
      certificateOfIncorporationNumber: undefined,
      // Directors and corporate fields removed from default
      directors: [],
      document1Type: '',
      document2Type: '',
      signature: '',
      agreedToTerms: false,
    },
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const clientType = form.watch('clientType');
  const isCorporate = !['Personal Account', 'Proprietorship / Sole Trader'].includes(clientType) && clientType !== '';

  const steps = React.useMemo(() => {
    return baseSteps;
  }, [clientType]);
  
  const handleDuplicateCheck = async (): Promise<boolean> => {
    if (!firestore) return true; // Don't block if firebase isn't configured
    
    const currentStepId = steps[currentStep].id;
    const data = form.getValues();
    let checks: Promise<{ isDuplicate: boolean, message: string }>[] = [];

    if (currentStepId === 'personal-info') {
        if (!isCorporate) {
            checks.push(
                checkForDuplicates('fullName', data.fullName).then(res => ({...res, message: `A client with the name '${data.fullName}' already exists (ID: ${res.existingId}).`})),
            );
        } else if(data.fullName) {
             checks.push(
                checkForDuplicates('organisationLegalName', data.fullName).then(res => ({...res, message: `A company with the legal name '${data.fullName}' already exists (ID: ${res.existingId}).`})),
             );
        }
        if(isCorporate && data.certificateOfIncorporationNumber) {
            checks.push(
              checkForDuplicates('certificateOfIncorporationNumber', data.certificateOfIncorporationNumber).then(res => ({...res, message: `A company with the incorporation number '${data.certificateOfIncorporationNumber}' already exists (ID: ${res.existingId}).`}))
            )
        }
    }

    if (checks.length === 0) {
        return true; // No checks needed for this step
    }

    setIsCheckingDuplicates(true);
    const results = await Promise.all(checks);
    setIsCheckingDuplicates(false);

    const firstDuplicate = results.find(r => r.isDuplicate);

    if (firstDuplicate) {
        setDuplicateInfo({ isDuplicate: true, message: firstDuplicate.message });
        return false;
    }

    return true;
};

  const next = async () => {
    const stepFields = steps[currentStep].fields as FieldName<OnboardingFormData>[] | undefined;
    const isValid = await form.trigger(stepFields);
    
    if (!isValid) {
      toast({
        title: "Incomplete Information",
        description: "Please fill out all required fields before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    const canProceed = await handleDuplicateCheck();
    if (!canProceed) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
    }
  };


  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step + 1);
    }
  };
  
  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    
    // Final duplicate check before submission
    if (firestore) {
      const isDuplicateOnSubmit = !(await handleDuplicateCheck());
      if (isDuplicateOnSubmit) {
        setIsSubmitting(false);
        return; // The dialog will be shown by handleDuplicateCheck
      }
    }
    
    const newApplicationData = {
      id: `APP-${String(Date.now()).slice(-5)}`,
      clientName: data.fullName,
      clientType: data.clientType,
      status: 'Submitted',
      submittedDate: format(new Date(), 'yyyy-MM-dd'),
      lastUpdated: new Date().toISOString(),
      submittedBy: user.name,
      fcbStatus: 'Inclusive',
      details: {
        fullName: data.fullName,
        address: data.address,
        dateOfBirth: data.dateOfBirth || '',
        contactNumber: 'N/A', // To be filled by back-office
        email: 'N/A', // To be filled by back-office

        // Corporate details - initially minimal
        organisationLegalName: isCorporate ? data.fullName : null,
        dateOfIncorporation: isCorporate ? data.dateOfIncorporation : null,
        certificateOfIncorporationNumber: isCorporate ? data.certificateOfIncorporationNumber : null,
      },
       directors: [], // To be filled by back-office
      documents: [
        { type: data.document1Type, fileName: `${data.document1Type.toLowerCase().replace(/\s/g, '_')}.pdf`, url: '#' },
        { type: data.document2Type, fileName: `${data.document2Type.toLowerCase().replace(/\s/g, '_')}.pdf`, url: '#' },
      ].filter(doc => doc.type),
      history: [
        { action: 'Submitted', user: user.name, timestamp: new Date().toISOString() },
      ],
      comments: [],
    };
    
    // For demo purposes, update Jotai atom state
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
          description: "Could not submit application to the database. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    toast({
        title: "Application Submitted!",
        description: `Application for ${data.fullName} has been successfully created.`,
    });

    setTimeout(() => {
        onCancel();
    }, 1000);
  };

  const CurrentStepComponent = StepComponents[steps[currentStep].id];

  return (
    <FormProvider {...form}>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <ProgressTracker steps={steps} currentStep={currentStep} />
        <div className="flex-1 p-4 md:p-8">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="h-full"
            >
              <Card className="h-full flex flex-col">
                <CardContent className="flex-1 py-6">
                  <CurrentStepComponent />
                </CardContent>
                <CardFooter className="border-t px-6 py-4 justify-between">
                  <Button variant="outline" type="button" onClick={currentStep === 0 ? onCancel : prev}>
                     {currentStep > 0 && <ArrowLeft className="mr-2 h-4 w-4" />}
                    {currentStep === 0 ? 'Cancel' : 'Back'}
                  </Button>
                  {currentStep < steps.length - 1 && (
                     <Button type="button" onClick={next} disabled={isCheckingDuplicates}>
                      {isCheckingDuplicates ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isCheckingDuplicates ? 'Checking...' : 'Next'}
                    </Button>
                  )}
                  {currentStep === steps.length - 1 && (
                     <Button type="submit" disabled={!form.formState.isValid || isSubmitting}>
                       {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                       {isSubmitting ? 'Submitting...' : 'Submit Application'}
                     </Button>
                  )}
                </CardFooter>
              </Card>
            </form>
        </div>

         <AlertDialog open={duplicateInfo.isDuplicate} onOpenChange={(isOpen) => !isOpen && setDuplicateInfo({ isDuplicate: false, message: '' })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Potential Duplicate Found</AlertDialogTitle>
              <AlertDialogDescription>
                {duplicateInfo.message}
                <br /><br />
                Please review the existing application before proceeding. Do you want to continue creating this new application anyway?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDuplicateInfo({ isDuplicate: false, message: '' })}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                setDuplicateInfo({ isDuplicate: false, message: '' });
                if (currentStep < steps.length - 1) {
                  setCurrentStep((step) => step + 1);
                }
              }}>
                Continue Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </FormProvider>
  );
}
