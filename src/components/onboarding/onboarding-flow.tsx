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
import { ArrowLeft, Loader2, AlertTriangle, Save, ShieldAlert, RotateCcw } from 'lucide-react';
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

type DuplicateCheckResult = {
  isDuplicate: boolean;
  field: string;
  value: string;
  existingId: string;
};

export default function OnboardingFlow({ onCancel, user, preselectedType, existingApplication }: OnboardingFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [applications, setApplications] = useAtom(applicationsAtom);
  const [, setActivityLogs] = useAtom(activityLogsAtom);
  const { toast } = useToast();

  const [isCheckingDuplicates, setIsCheckingDuplicates] = React.useState(false);
  const [duplicateResult, setDuplicateResult] = React.useState<DuplicateCheckResult | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [lastSubmissionFailed, setLastSubmissionFailed] = React.useState(false);

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

  const clientType = form.watch('clientType');
  
  const steps = React.useMemo(() => {
    if (!clientType) return [allSteps.find(s => s.id === 'account-type')!];

    const isPersonal = ['Individual Accounts', 'Minors'].includes(clientType);
    const isSoleTrader = clientType === 'Sole Trader';
    const isInstitution = ['NGO', 'Church', 'School', 'Societies', 'Club/ Association', 'Trust'].includes(clientType);
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

  // Auto-save effect
  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change' && !isSubmitting) {
        const timer = setTimeout(() => {
          const data = form.getValues();
          const appId = existingApplication?.id || generateAccountId();
          const clientName = data.organisationLegalName || `${data.individualFirstName || ''} ${data.individualSurname || ''}`.trim() || 'Untitled Draft';
          
          setApplications((prev) => {
            const exists = prev.find(a => a.id === appId);
            if (exists && exists.status === 'Draft') {
              return prev.map(a => a.id === appId ? { 
                ...a, 
                clientName, 
                details: data, 
                lastUpdated: new Date().toISOString() 
              } : a);
            }
            return prev;
          });
        }, 3000); // 3 second debounce
        return () => clearTimeout(timer);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, isSubmitting, existingApplication, setApplications]);

  const performDuplicateCheck = async (): Promise<boolean> => {
    const data = form.getValues();
    const currentId = existingApplication?.id;

    setIsCheckingDuplicates(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 800));

        const checkFields = [
          { label: 'National ID', value: data.individualIdNumber, field: 'individualIdNumber' },
          { label: 'Incorporation Number', value: data.certificateOfIncorporationNumber, field: 'certificateOfIncorporationNumber' },
          { label: 'Email Address', value: data.email, field: 'email' },
          { label: 'Phone Number', value: data.individualMobileNumber || data.businessTelNumber, field: 'phone' },
        ];

        for (const check of checkFields) {
          if (!check.value) continue;

          const duplicate = applications.find(app => {
            if (app.id === currentId) return false;
            const details = app.details;
            
            switch (check.field) {
              case 'individualIdNumber': return details.individualIdNumber === check.value;
              case 'certificateOfIncorporationNumber': return details.certificateOfIncorporationNumber === check.value;
              case 'email': return details.email?.toLowerCase() === check.value.toLowerCase();
              case 'phone': return details.individualMobileNumber === check.value || details.businessTelNumber === check.value;
              default: return false;
            }
          });

          if (duplicate) {
            setDuplicateResult({ isDuplicate: true, field: check.label, value: check.value, existingId: duplicate.id });
            return false;
          }
        }
        return true;
    } finally {
        setIsCheckingDuplicates(false);
    }
  };

  const next = async () => {
    const stepFields = currentStep.fields as FieldName<OnboardingFormData>[] | undefined;
    const isValid = await form.trigger(stepFields);
    
    if (!isValid) {
      toast({ title: "Incomplete", description: "Please fill in all required boxes.", variant: "destructive" });
      return;
    }

    if (currentStep.id === 'individual-info' || currentStep.id === 'corporate-info') {
      const isUnique = await performDuplicateCheck();
      if (!isUnique) return;
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStepIndex > 0) setCurrentStepIndex((step) => step - 1);
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

    toast({ title: "Draft Saved", description: "You can continue this later from your dashboard." });
    onCancel();
  };
  
  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    setLastSubmissionFailed(false);
    
    try {
        const isUnique = await performDuplicateCheck();
        if (!isUnique) return;

        const appId = existingApplication?.id || generateAccountId();
        const newApplication: Application = {
          id: appId,
          clientName: data.organisationLegalName || `${data.individualFirstName} ${data.individualSurname}`.trim(),
          clientType: data.clientType,
          region: data.region,
          status: 'Under Review',
          submittedDate: existingApplication?.submittedDate || format(new Date(), 'yyyy-MM-dd'),
          lastUpdated: new Date().toISOString(),
          submittedBy: user.name,
          fcbStatus: existingApplication?.fcbStatus || 'Inclusive',
          details: data,
          signatories: data.signatories || [],
          documents: data.capturedDocuments || [],
          history: [
            ...(existingApplication?.history || []),
            { action: 'Under Review', user: user.name, timestamp: new Date().toISOString(), notes: 'Application originated and submitted for review.' },
          ],
          comments: existingApplication?.comments || [],
        };
        
        setApplications((prev) => {
          const exists = prev.find(a => a.id === appId);
          if (exists) return prev.map(a => a.id === appId ? newApplication : a);
          return [newApplication, ...prev];
        });

        setActivityLogs(prev => [{
          id: `log-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          action: 'Account Created' as const,
          timestamp: new Date().toISOString()
        }, ...prev]);

        toast({ title: "Finished!", description: `Sent request for ${newApplication.clientName}.` });
        await new Promise(resolve => setTimeout(resolve, 800));
        onCancel();
    } catch (error) {
        console.error("Submission error:", error);
        setLastSubmissionFailed(true);
        toast({
            variant: 'destructive',
            title: 'Submission failed',
            description: "Submission failed. Please try again or contact support.",
        });
    } finally {
        setIsSubmitting(false);
    }
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
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="h-full">
              <Card className="h-full flex flex-col shadow-lg border-primary/10">
                <CardContent className="flex-1 py-6">
                  { CurrentStepComponent ? <CurrentStepComponent /> : <div>Step not found</div> }
                </CardContent>
                <CardFooter className="border-t px-6 py-4 justify-between bg-muted/10">
                  <Button variant="outline" type="button" onClick={currentStepIndex === 0 ? onCancel : prev} disabled={isSubmitting}>
                     {currentStepIndex > 0 && <ArrowLeft className="mr-2 h-4 w-4" />}
                    {currentStepIndex === 0 ? 'Cancel' : 'Back'}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="secondary" type="button" onClick={handleSaveDraft} className="font-bold border-primary/20" disabled={isSubmitting}>
                      <Save className="mr-2 h-4 w-4" /> Save Draft
                    </Button>
                    
                    {currentStepIndex < steps.length - 1 && (
                      <Button type="button" onClick={next} disabled={isCheckingDuplicates || isSubmitting} className="font-bold">
                        {isCheckingDuplicates ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Next'}
                      </Button>
                    )}
                    {currentStepIndex === steps.length - 1 && (
                      <Button type="submit" disabled={isSubmitting || isCheckingDuplicates} className="font-black px-8">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {lastSubmissionFailed ? <><RotateCcw className="mr-2 h-4 w-4" /> Retry</> : 'Finish'}
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </form>
        </div>

        <AlertDialog open={!!duplicateResult} onOpenChange={() => setDuplicateResult(null)}>
          <AlertDialogContent className="border-destructive/20 rounded-2xl shadow-2xl">
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2 text-destructive">
                <ShieldAlert className="h-8 w-8" />
                <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Duplicate Record Blocked</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-foreground text-base pt-2">
                A regulatory conflict has been detected. The following information already exists in the registry:
                <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border">
                  <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">{duplicateResult?.field}</p>
                  <p className="text-xl font-mono font-black text-foreground mt-1">{duplicateResult?.value}</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mt-4">Linked to Active File:</p>
                  <p className="text-xs font-mono font-bold text-primary">{duplicateResult?.existingId}</p>
                </div>
                <p className="mt-6 text-sm text-muted-foreground italic">
                  Multiple records for the same legal entity or identity are strictly prohibited by compliance. Please review the existing file or contact the Supervisor.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="pt-4">
              <AlertDialogAction onClick={() => setDuplicateResult(null)} className="h-12 bg-foreground text-background font-black uppercase tracking-widest px-8">Return to Form</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </FormProvider>
  );
}
