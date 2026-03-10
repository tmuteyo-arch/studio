
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
  { id: 'account-type', name: 'Account Type', fields: ['clientType', 'region'] },
  { id: 'individual-info', name: 'Applicant Details', fields: ['individualFirstName', 'individualSurname', 'individualDateOfBirth', 'individualIdNumber', 'individualAddress', 'individualMobileNumber'] },
  { id: 'corporate-info', name: 'Corporate Details', fields: ['organisationLegalName', 'natureOfBusiness', 'certificateOfIncorporationNumber', 'dateOfIncorporation', 'physicalAddress', 'businessTelNumber', 'email'] },
  { id: 'signatories', name: 'Mandate & Signatories', fields: ['signatories', 'resolutionDate', 'signingInstruction'] },
  { id: 'document-upload', name: 'Documents', fields: ['document1Type', 'document2Type'] },
  { id: 'review-submit', name: 'Review & Submit', fields: ['signature', 'agreedToTerms'] },
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
      // Personal accounts do not need Corporate Details or Mandate & Signatories step
      return allSteps.filter(step => ['account-type', 'individual-info', 'document-upload', 'review-submit'].includes(step.id));
    }
    
    if (isSoleTrader) {
      // Sole Trader needs Applicant Details AND Mandate & Signatories
      return allSteps.filter(step => ['account-type', 'individual-info', 'signatories', 'document-upload', 'review-submit'].includes(step.id));
    }

    if (isCorporate) {
      // Corporate accounts do not need Applicant Details (Individual info) step as it uses Corporate Details
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
          message: `An existing application for '${nameToCheck}' was found in the system (App ID: ${duplicate.id}). Please verify if this is a new request or a duplicate.` 
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
        title: "Incomplete Information",
        description: "Please fill out all mandatory fields before proceeding.",
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
      description: `Application for ${newApplication.clientName} has been successfully created.`,
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
                    {currentStepIndex === 0 ? 'Cancel' : 'Back'}
                  </Button>
                  {currentStepIndex < steps.length - 1 && (
                     <Button type="button" onClick={next} disabled={isCheckingDuplicates}>
                      {isCheckingDuplicates ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isCheckingDuplicates ? 'Validating...' : 'Next'}
                    </Button>
                  )}
                  {currentStepIndex === steps.length - 1 && (
                     <Button type="submit" disabled={!form.formState.isValid || isSubmitting}>
                       {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                       {isSubmitting ? 'Finalizing...' : 'Submit Application'}
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
                Do you want to continue with this application?
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
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </FormProvider>
  );
}
