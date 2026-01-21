'use client';

import * as React from 'react';
import { FormProvider, useForm, type FieldName } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useAtom } from 'jotai';

import { OnboardingFormData, OnboardingFormSchema, Step } from '@/lib/types';
import { applicationsAtom } from '@/lib/mock-data';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressTracker } from './progress-tracker';

import StepAccountType from './steps/step-account-type';
import StepPersonalInfo from './steps/step-personal-info';
import StepDocumentUpload from './steps/step-document-upload';
import StepReview from './steps/step-review';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/users';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
import StepCorporateInfo from './steps/step-corporate-info';
import StepDirectors from './steps/step-directors';


const allSteps: Step[] = [
  { id: 'account-type', name: 'Account Type', fields: ['clientType'] },
  { id: 'personal-info', name: 'Applicant Info', fields: ['fullName', 'dateOfBirth', 'address'] },
  { id: 'corporate-info', name: 'Corporate Details', fields: ['organisationLegalName', 'certificateOfIncorporationNumber', 'countryOfIncorporation', 'dateOfIncorporation'] },
  { id: 'directors', name: 'Directors', fields: [] },
  { id: 'document-upload', name: 'Document Upload', fields: ['document1Type', 'document2Type'] },
  { id: 'review-submit', name: 'Review & Submit', fields: ['signature', 'agreedToTerms'] },
];

const StepComponents: Record<string, React.ElementType> = {
  'account-type': StepAccountType,
  'personal-info': StepPersonalInfo,
  'corporate-info': StepCorporateInfo,
  'directors': StepDirectors,
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
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [applications, setApplications] = useAtom(applicationsAtom);
  const { toast } = useToast();

  const [isCheckingDuplicates, setIsCheckingDuplicates] = React.useState(false);
  const [duplicateInfo, setDuplicateInfo] = React.useState<DuplicateInfo>({ isDuplicate: false, message: '' });

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(OnboardingFormSchema),
    mode: 'onChange', // Validate on change to update submit button status
    defaultValues: {
      clientType: '',
      fullName: '',
      dateOfBirth: '',
      address: '',
      organisationLegalName: '',
      tradeName: '',
      physicalAddress: '',
      postalAddress: '',
      webAddress: '',
      businessTelNumber: '',
      faxNumber: '',
      email: '',
      natureOfBusiness: '',
      sourceOfWealth: '',
      typeOfBusiness: '',
      noOfEmployees: undefined,
      economicSector: '',
      authorisedCapital: '',
      taxPayerNumber: '',
      dateOfIncorporation: '',
      countryOfIncorporation: '',
      certificateOfIncorporationNumber: '',
      otherAccountNumbers: '',
      premisesOtherDetails: '',
      otherBank1Name: '',
      otherBank1AccName: '',
      otherBank1AccNumber: '',
      document1Type: '',
      document2Type: '',
      signature: '',
      agreedToTerms: false,
      directors: [], // Start with an empty array for directors
    },
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const clientType = form.watch('clientType');
  const isCorporate = !['Personal Account', 'Proprietorship / Sole Trader'].includes(clientType) && clientType !== '';
  
  const steps = React.useMemo(() => {
    if (isCorporate) {
      return allSteps;
    }
    return allSteps.filter(step => step.id !== 'corporate-info' && step.id !== 'directors');
  }, [isCorporate]);

  const currentStep = steps[currentStepIndex];

  const handleDuplicateCheck = async (): Promise<boolean> => {
    // In-memory duplicate check
    const data = form.getValues();
    let nameToCheck = '';
    
    if (currentStep.id === 'corporate-info') {
        nameToCheck = data.organisationLegalName || '';
    } else if (currentStep.id === 'personal-info' && !isCorporate) {
         nameToCheck = data.fullName;
    }
    
    if (!nameToCheck) {
        return true;
    }

    setIsCheckingDuplicates(true);
    // Simulate async check
    await new Promise(res => setTimeout(res, 300));
    setIsCheckingDuplicates(false);

    const duplicate = applications.find(app => app.clientName.toLowerCase() === nameToCheck.toLowerCase());

    if (duplicate) {
        setDuplicateInfo({ isDuplicate: true, message: `An application with the name '${nameToCheck}' already exists (ID: ${duplicate.id}).` });
        return false;
    }

    return true;
};

  const next = async () => {
    const stepFields = currentStep.fields as FieldName<OnboardingFormData>[] | undefined;
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


    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((step) => step + 1);
    }
  };


  const prev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((step) => step - 1);
    }
  };
  
  const onSubmit = (data: OnboardingFormData) => {
    setIsSubmitting(true);
    
    const newApplication = {
      id: `APP-${Date.now()}`,
      clientName: data.organisationLegalName || data.fullName,
      clientType: data.clientType,
      status: 'Submitted',
      submittedDate: format(new Date(), 'yyyy-MM-dd'),
      lastUpdated: new Date().toISOString(),
      submittedBy: user.name,
      fcbStatus: 'Inclusive',
      details: {
        ...data
      },
      directors: data.directors || [],
      documents: [
        { type: data.document1Type, fileName: `${data.document1Type.toLowerCase().replace(/\s/g, '_')}.pdf`, url: '#' },
        { type: data.document2Type, fileName: `${data.document2Type.toLowerCase().replace(/\s/g, '_')}.pdf`, url: '#' },
      ].filter(doc => doc.type),
      history: [
        { action: 'Submitted', user: user.name, timestamp: new Date().toISOString() },
      ],
      comments: [],
    };
    
    setApplications((prev) => [newApplication, ...prev]);

    toast({
      title: "Application Submitted!",
      description: `Application for ${data.organisationLegalName || data.fullName} has been successfully created.`,
    });
    
     setTimeout(() => {
        setIsSubmitting(false);
        onCancel();
    }, 1000);
  };

  const CurrentStepComponent = StepComponents[currentStep.id];

  return (
    <FormProvider {...form}>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <ProgressTracker steps={steps} currentStepIndex={currentStepIndex} />
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
                  <Button variant="outline" type="button" onClick={currentStepIndex === 0 ? onCancel : prev}>
                     {currentStepIndex > 0 && <ArrowLeft className="mr-2 h-4 w-4" />}
                    {currentStepIndex === 0 ? 'Cancel' : 'Back'}
                  </Button>
                  {currentStepIndex < steps.length - 1 && (
                     <Button type="button" onClick={next} disabled={isCheckingDuplicates}>
                      {isCheckingDuplicates ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isCheckingDuplicates ? 'Checking...' : 'Next'}
                    </Button>
                  )}
                  {currentStepIndex === steps.length - 1 && (
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
                if (currentStepIndex < steps.length - 1) {
                  setCurrentStepIndex((step) => step + 1);
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
