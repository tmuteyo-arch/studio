
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
import StepIndividualInfo from './steps/step-individual-info';
import StepDocumentUpload from './steps/step-document-upload';
import StepReview from './steps/step-review';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/users';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
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
import StepSignatories from './steps/step-signatories';


const allSteps: Step[] = [
  { id: 'account-type', name: 'Start Here', fields: ['clientType', 'region'] },
  { id: 'individual-info', name: 'Your Details', fields: ['individualFirstName', 'individualSurname', 'individualDateOfBirth', 'individualIdNumber', 'individualAddress', 'individualMobileNumber'] },
  { id: 'corporate-info', name: 'Company Details', fields: ['organisationLegalName', 'natureOfBusiness', 'certificateOfIncorporationNumber', 'dateOfIncorporation', 'physicalAddress', 'businessTelNumber', 'email'] },
  { id: 'signatories', name: 'People Signing', fields: ['signatories', 'resolutionDate', 'signingInstruction'] },
  { id: 'document-upload', name: 'Add Photos/Files', fields: ['document1Type', 'document2Type'] },
  { id: 'review-submit', name: 'Final Check', fields: ['signature', 'agreedToTerms'] },
];

const StepComponents: Record<string, React.ElementType> = {
  'account-type': StepAccountType,
  'individual-info': StepIndividualInfo,
  'corporate-info': StepCorporateInfo,
  'signatories': StepSignatories,
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
    mode: 'onChange',
    defaultValues: {
      clientType: '',
      region: '',
      individualSurname: '',
      individualFirstName: '',
      individualDateOfBirth: '',
      individualIdNumber: '',
      individualAddress: '',
      individualMobileNumber: '',
      organisationLegalName: '',
      natureOfBusiness: '',
      physicalAddress: '',
      businessTelNumber: '',
      email: '',
      dateOfIncorporation: '',
      certificateOfIncorporationNumber: '',
      signatories: [],
      resolutionDate: '',
      signingInstruction: '',
      supervisorSignature: '',
      supervisorSignatureTimestamp: '',
      executiveSignature: '',
      executiveSignatureTimestamp: '',
      document1Type: '',
      document2Type: '',
      capturedDocuments: [],
      signature: '',
      agreedToTerms: false,
    },
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const clientType = form.watch('clientType');
  
  const steps = React.useMemo(() => {
    if (!clientType) return [allSteps.find(s => s.id === 'account-type')!];

    const isPersonal = clientType === 'Personal Account';
    const isSoleTrader = clientType === 'Proprietorship / Sole Trader';
    const isCorporate = !isPersonal && !isSoleTrader;

    if (isPersonal) {
      return allSteps.filter(step => ['account-type', 'individual-info', 'document-upload', 'review-submit'].includes(step.id));
    }
    
    if (isSoleTrader) {
      return allSteps.filter(step => ['account-type', 'individual-info', 'signatories', 'document-upload', 'review-submit'].includes(step.id));
    }

    if (isCorporate) {
      return allSteps.filter(step => step.id !== 'individual-info');
    }
    
    return [allSteps.find(s => s.id === 'account-type')!];
  }, [clientType]);

  const currentStep = steps[currentStepIndex];

  const handleDuplicateCheck = async (): Promise<boolean> => {
    const data = form.getValues();
    let nameToCheck = '';
    
    if (currentStep.id === 'corporate-info') {
        nameToCheck = data.organisationLegalName || '';
    } else if (currentStep.id === 'individual-info') {
         nameToCheck = `${data.individualFirstName || ''} ${data.individualSurname || ''}`.trim();
    }
    
    if (!nameToCheck) {
        return true;
    }

    setIsCheckingDuplicates(true);
    await new Promise(res => setTimeout(res, 600)); 
    setIsCheckingDuplicates(false);

    const duplicate = applications.find(app => app.clientName.toLowerCase() === nameToCheck.toLowerCase());

    if (duplicate) {
        setDuplicateInfo({ 
          isDuplicate: true, 
          message: `Someone named '${nameToCheck}' is already in the system. Please check if this is new or a mistake.` 
        });
        return false;
    }

    return true;
};

  const next = async () => {
    const stepFields = currentStep.fields as FieldName<OnboardingFormData>[] | undefined;
    const isValid = await form.trigger(stepFields);
    
    if (!isValid) {
      toast({
        title: "Almost Done",
        description: "Please fill in all the required boxes first.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep.id === 'corporate-info' || currentStep.id === 'individual-info') {
      const canProceed = await handleDuplicateCheck();
      if (!canProceed) return;
    }


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
      clientName: data.organisationLegalName || `${data.individualFirstName} ${data.individualSurname}`.trim(),
      clientType: data.clientType,
      region: data.region,
      status: 'Submitted',
      submittedDate: format(new Date(), 'yyyy-MM-dd'),
      lastUpdated: new Date().toISOString(),
      submittedBy: user.name,
      fcbStatus: 'Inclusive',
      details: data,
      signatories: data.signatories || [],
      documents: data.capturedDocuments || [],
      history: [
        { action: 'Request Sent', user: user.name, timestamp: new Date().toISOString() },
      ],
      comments: [],
    };
    
    setApplications((prev) => [newApplication, ...prev]);

    toast({
      title: "All Set!",
      description: `We've received the request for ${newApplication.clientName}.`,
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
              <Card className="h-full flex flex-col shadow-lg border-primary/10">
                <CardContent className="flex-1 py-6">
                  { CurrentStepComponent ? <CurrentStepComponent /> : <div>Step not found</div> }
                </CardContent>
                <CardFooter className="border-t px-6 py-4 justify-between bg-muted/10">
                  <Button variant="outline" type="button" onClick={currentStepIndex === 0 ? onCancel : prev}>
                     {currentStepIndex > 0 && <ArrowLeft className="mr-2 h-4 w-4" />}
                    {currentStepIndex === 0 ? 'Cancel' : 'Go Back'}
                  </Button>
                  {currentStepIndex < steps.length - 1 && (
                     <Button type="button" onClick={next} disabled={isCheckingDuplicates}>
                      {isCheckingDuplicates ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isCheckingDuplicates ? 'Checking...' : 'Next Step'}
                    </Button>
                  )}
                  {currentStepIndex === steps.length - 1 && (
                     <Button type="submit" disabled={!form.formState.isValid || isSubmitting}>
                       {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                       {isSubmitting ? 'Sending...' : 'Finish & Send'}
                     </Button>
                  )}
                </CardFooter>
              </Card>
            </form>
        </div>

         <AlertDialog open={duplicateInfo.isDuplicate} onOpenChange={(isOpen) => !isOpen && setDuplicateInfo({ isDuplicate: false, message: '' })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Duplicate Warning
              </AlertDialogTitle>
              <AlertDialogDescription className="text-foreground">
                {duplicateInfo.message}
                <br /><br />
                Do you still want to go ahead?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDuplicateInfo({ isDuplicate: false, message: '' })}>No, Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                setDuplicateInfo({ isDuplicate: false, message: '' });
                if (currentStepIndex < steps.length - 1) {
                  setCurrentStepIndex((step) => step + 1);
                }
              }}>
                Yes, Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </FormProvider>
  );
}
