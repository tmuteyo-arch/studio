'use client';

import * as React from 'react';
import { FormProvider, useForm, type FieldName } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useAtom } from 'jotai';

import { OnboardingFormData, OnboardingFormSchema, Step } from '@/lib/types';
import { applicationsAtom, activityLogsAtom, Application } from '@/lib/mock-data';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressTracker } from './progress-tracker';
import { generateAccountId } from '@/lib/utils';

import StepAccountType from './steps/step-account-type';
import StepIndividualInfo from './steps/step-individual-info';
import StepDocumentUpload from './steps/step-document-upload';
import StepReview from './steps/review-step';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/users';
import { ArrowLeft, Loader2, AlertTriangle, Save } from 'lucide-react';
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
import StepAgreements from './steps/step-agreements';


const allSteps: Step[] = [
  { id: 'account-type', name: 'Account Type', fields: ['clientType', 'relationshipType', 'region', 'tinNumber'] },
  { id: 'individual-info', name: 'Personal', fields: ['individualFirstName', 'individualSurname', 'individualDateOfBirth', 'individualIdNumber', 'individualAddress', 'individualMobileNumber', 'nationality', 'gender', 'maritalStatus'] },
  { id: 'corporate-info', name: 'Business', fields: ['organisationLegalName', 'natureOfBusiness', 'certificateOfIncorporationNumber', 'dateOfIncorporation', 'physicalAddress', 'businessTelNumber', 'email'] },
  { id: 'signatories', name: 'Signatories', fields: ['signatories', 'resolutionDate', 'signingInstruction'] },
  { id: 'document-upload', name: 'Documents', fields: ['capturedDocuments'] },
  { id: 'agreements', name: 'InnBucks Agreement', fields: ['agreement1Accepted', 'agreement1Signature', 'agreement1Pages', 'agreement2Accepted', 'agreement2Signature', 'agreement2Pages', 'adlaAccepted', 'adlaSignature', 'adlaPages'] },
  { id: 'review-submit', name: 'Review', fields: ['signature', 'agreedToTerms'] },
];

const StepComponents: Record<string, React.ElementType> = {
  'account-type': StepAccountType,
  'individual-info': StepIndividualInfo,
  'corporate-info': StepCorporateInfo,
  'signatories': StepSignatories,
  'document-upload': StepDocumentUpload,
  'agreements': StepAgreements,
  'review-submit': StepReview,
};

interface OnboardingFlowProps {
  onCancel: () => void;
  user: User;
  preselectedType?: string | null;
  existingApplication?: Application | null;
}

type DuplicateInfo = {
  isDuplicate: boolean;
  message: string;
}

export default function OnboardingFlow({ onCancel, user, preselectedType, existingApplication }: OnboardingFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [applications, setApplications] = useAtom(applicationsAtom);
  const [, setActivityLogs] = useAtom(activityLogsAtom);
  const { toast } = useToast();

  const [isCheckingDuplicates, setIsCheckingDuplicates] = React.useState(false);
  const [duplicateInfo, setDuplicateInfo] = React.useState<DuplicateInfo>({ isDuplicate: false, message: '' });

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(OnboardingFormSchema),
    mode: 'onChange',
    defaultValues: existingApplication ? existingApplication.details : {
      clientType: preselectedType || '',
      relationshipType: 'Agency',
      region: '',
      tinNumber: '',
      individualSurname: '',
      individualFirstName: '',
      individualDateOfBirth: '',
      individualIdNumber: '',
      individualAddress: '',
      individualMobileNumber: '',
      nationality: '',
      gender: '',
      maritalStatus: '',
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
      capturedDocuments: [],
      signature: '',
      agreedToTerms: false,
      agreement1Method: 'digital',
      agreement1Accepted: false,
      agreement1Pages: [],
      agreement2Method: 'digital',
      agreement2Accepted: false,
      agreement2Pages: [],
      adlaMethod: 'digital',
      adlaAccepted: false,
      adlaPages: [],
    },
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const clientType = form.watch('clientType');
  
  const steps = React.useMemo(() => {
    if (!clientType) return [allSteps.find(s => s.id === 'account-type')!];

    const isPersonal = ['Individual Accounts', 'Minors'].includes(clientType);
    const isSoleTrader = clientType === 'Sole Trader';
    const isInstitution = ['NGO', 'Church', 'School', 'Society', 'Club/ Association', 'Trust'].includes(clientType);
    const isCorporate = !isPersonal && !isSoleTrader && !isInstitution;

    if (isPersonal) {
      const personalSteps = ['account-type', 'individual-info', 'document-upload', 'review-submit'];
      return allSteps.filter(step => personalSteps.includes(step.id));
    }
    
    if (isSoleTrader) {
      const soleTraderSteps = ['account-type', 'individual-info', 'signatories', 'document-upload', 'agreements', 'review-submit'];
      return allSteps.filter(step => soleTraderSteps.includes(step.id));
    }
    
    if (isCorporate) {
      const corporateSteps = ['account-type', 'corporate-info', 'signatories', 'document-upload', 'agreements', 'review-submit'];
      return allSteps.filter(step => corporateSteps.includes(step.id));
    }

    if (isInstitution) {
      const institutionSteps = ['account-type', 'corporate-info', 'signatories', 'document-upload', 'review-submit'];
      return allSteps.filter(step => institutionSteps.includes(step.id));
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

    const duplicate = applications.find(app => 
      app.clientName.toLowerCase() === nameToCheck.toLowerCase() && 
      app.id !== existingApplication?.id
    );

    if (duplicate) {
        setDuplicateInfo({ 
          isDuplicate: true, 
          message: `'${nameToCheck}' is already in the system.` 
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
        title: "Incomplete",
        description: "Please fill in all required boxes.",
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

  const handleSaveDraft = () => {
    const data = form.getValues();
    const appId = existingApplication?.id || generateAccountId();
    
    const draftApp: Application = {
      id: appId,
      clientName: data.organisationLegalName || `${data.individualFirstName || ''} ${data.individualSurname || ''}`.trim() || 'Untitled Draft',
      clientType: data.clientType,
      region: data.region || 'Unknown',
      status: 'Draft',
      submittedDate: existingApplication?.submittedDate || format(new Date(), 'yyyy-MM-dd'),
      lastUpdated: new Date().toISOString(),
      submittedBy: user.name,
      fcbStatus: existingApplication?.fcbStatus || 'Inclusive',
      details: data,
      signatories: data.signatories || [],
      documents: data.capturedDocuments || [],
      history: existingApplication ? existingApplication.history : [
        { action: 'Draft Saved', user: user.name, timestamp: new Date().toISOString() },
      ],
      comments: existingApplication?.comments || [],
    };

    setApplications((prev) => {
      const exists = prev.find(a => a.id === appId);
      if (exists) {
        return prev.map(a => a.id === appId ? draftApp : a);
      }
      return [draftApp, ...prev];
    });

    toast({
      title: "Draft Saved",
      description: "You can continue this later from your dashboard.",
    });
    
    onCancel();
  };
  
  const onSubmit = (data: OnboardingFormData) => {
    setIsSubmitting(true);
    const appId = existingApplication?.id || generateAccountId();

    const newApplication: Application = {
      id: appId,
      clientName: data.organisationLegalName || `${data.individualFirstName} ${data.individualSurname}`.trim(),
      clientType: data.clientType,
      region: data.region,
      status: 'Submitted',
      submittedDate: existingApplication?.submittedDate || format(new Date(), 'yyyy-MM-dd'),
      lastUpdated: new Date().toISOString(),
      submittedBy: user.name,
      fcbStatus: existingApplication?.fcbStatus || 'Inclusive',
      details: data,
      signatories: data.signatories || [],
      documents: data.capturedDocuments || [],
      history: [
        ...(existingApplication?.history || []),
        { action: 'Request Sent', user: user.name, timestamp: new Date().toISOString() },
      ],
      comments: existingApplication?.comments || [],
    };
    
    setApplications((prev) => {
      const exists = prev.find(a => a.id === appId);
      if (exists) {
        return prev.map(a => a.id === appId ? newApplication : a);
      }
      return [newApplication, ...prev];
    });

    const logEntry = {
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      action: 'Account Created' as const,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [logEntry, ...prev]);

    toast({
      title: "Finished!",
      description: `Sent request for ${newApplication.clientName}.`,
    });
    
     setTimeout(() => {
        setIsSubmitting(false);
        onCancel();
    }, 1000);
  };

  const onInvalid = () => {
    toast({
      variant: 'destructive',
      title: 'Missing Details',
      description: 'Please check the review page for errors before finishing.',
    });
  };

  const CurrentStepComponent = StepComponents[currentStep.id];

  return (
    <FormProvider {...form}>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <ProgressTracker steps={steps} currentStepIndex={currentStepIndex} />
        <div className="flex-1 p-4 md:p-8">
            <form
              onSubmit={form.handleSubmit(onSubmit, onInvalid)}
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
                  
                  <div className="flex gap-2">
                    <Button variant="secondary" type="button" onClick={handleSaveDraft} className="font-bold border-primary/20">
                      <Save className="mr-2 h-4 w-4" /> Save Draft
                    </Button>
                    
                    {currentStepIndex < steps.length - 1 && (
                      <Button type="button" onClick={next} disabled={isCheckingDuplicates} className="font-bold">
                        {isCheckingDuplicates ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Next'}
                      </Button>
                    )}
                    {currentStepIndex === steps.length - 1 && (
                      <Button type="submit" disabled={isSubmitting} className="font-black px-8">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Finish'}
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </form>
        </div>

         <AlertDialog open={duplicateInfo.isDuplicate} onOpenChange={(isOpen) => !isOpen && setDuplicateInfo({ isDuplicate: false, message: '' })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Duplicate Found
              </AlertDialogTitle>
              <AlertDialogDescription className="text-foreground">
                {duplicateInfo.message}
                <br /><br />
                Continue anyway?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDuplicateInfo({ isDuplicate: false, message: '' })}>No</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                setDuplicateInfo({ isDuplicate: false, message: '' });
                if (currentStepIndex < steps.length - 1) {
                  setCurrentStepIndex((step) => step + 1);
                }
              }}>
                Yes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </FormProvider>
  );
}
