'use client';

import * as React from 'react';
import { FormProvider, useForm, type FieldName } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSetAtom } from 'jotai';

import { OnboardingFormData, OnboardingFormSchema, Step } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressTracker } from './progress-tracker';

import StepAccountType from './steps/step-account-type';
import StepPersonalInfo from './steps/step-personal-info';
import StepCorporateInfo from './steps/step-corporate-info';
import StepDirectors from './steps/step-directors';
import StepDocumentUpload from './steps/step-document-upload';
import StepLivenessCheck from './steps/step-liveness-check';
import StepReview from './steps/step-review';
import { applicationsAtom, Application } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/users';
import { ArrowLeft } from 'lucide-react';

const baseSteps: Step[] = [
  { id: 'account-type', name: 'Account Type', fields: ['clientType'] },
  { id: 'personal-info', name: 'Applicant Info' },
  { id: 'corporate-info', name: 'Corporate Info', isDynamic: true },
  { id: 'directors-signatories', name: 'Directors', isDynamic: true, fields: ['directors'] },
  { id: 'document-upload', name: 'Document Upload', fields: ['document1Type', 'document2Type'] },
  { id: 'liveness-check', name: 'Liveness Check' },
  { id: 'review-submit', name: 'Review & Submit', fields: ['signature', 'agreedToTerms'] },
];

const StepComponents: Record<string, React.ElementType> = {
  'account-type': StepAccountType,
  'personal-info': StepPersonalInfo,
  'corporate-info': StepCorporateInfo,
  'directors-signatories': StepDirectors,
  'document-upload': StepDocumentUpload,
  'liveness-check': StepLivenessCheck,
  'review-submit': StepReview,
};

interface OnboardingFlowProps {
  onCancel: () => void;
  user: User;
}

export default function OnboardingFlow({ onCancel, user }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const { toast } = useToast();
  const setApplications = useSetAtom(applicationsAtom);


  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(OnboardingFormSchema),
    mode: 'onChange', // Validate on change to update submit button status
    defaultValues: {
      clientType: '',
      fullName: '',
      dateOfBirth: '',
      address: '',
      directors: [],
      document1Type: '',
      document2Type: '',
      signature: '',
      agreedToTerms: false,
    },
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const clientType = form.watch('clientType');
  const isCorporate = ['Company (Private / Public Limited)', 'PBC Account', 'Partnership'].includes(clientType);

  const steps = React.useMemo(() => {
    let newSteps = [...baseSteps];

    if (isCorporate) {
        const personalInfoStep = newSteps.find(step => step.id === 'personal-info');
        if (personalInfoStep) {
            personalInfoStep.name = 'Applicant Details';
            personalInfoStep.fields = ['fullName', 'dateOfBirth', 'address'];
        }
    } else {
        const personalInfoStep = newSteps.find(step => step.id === 'personal-info');
        if (personalInfoStep) {
            personalInfoStep.name = 'Personal Info';
            personalInfoStep.fields = ['fullName', 'dateOfBirth', 'address'];
        }
    }

    return newSteps.filter(step => {
      if (step.isDynamic) {
        return isCorporate;
      }
      return true;
    });
  }, [clientType, isCorporate]);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  };
  
  const onSubmit = (data: OnboardingFormData) => {
    setIsSubmitting(true);
    
    const newApplication: Application = {
      id: `APP${String(Date.now()).slice(-4)}`,
      clientName: data.fullName,
      clientType: data.clientType as any, // Simplified for now
      status: 'Submitted',
      submittedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      submittedBy: user.name,
      fcbStatus: 'Inclusive',
      details: {
        address: data.address,
        dateOfBirth: data.dateOfBirth,
        contactNumber: data.directors?.[0]?.phoneNumber || 'N/A',
        email: data.email || 'N/A',
      },
      documents: [
        { type: data.document1Type, fileName: `${data.document1Type.toLowerCase().replace(/\s/g, '_')}.pdf`, url: '#' },
        { type: data.document2Type, fileName: `${data.document2Type.toLowerCase().replace(/\s/g, '_')}.pdf`, url: '#' },
      ],
      history: [
        { action: 'Submitted', user: user.name, timestamp: new Date().toISOString() },
      ],
      comments: [],
    };

    setApplications(prev => [...prev, newApplication]);
    
    toast({
        title: "Application Submitted!",
        description: `Application for ${data.fullName} has been successfully created.`,
    });

    // This will trigger the success view in the StepReview component
    // And after a delay, we can close the flow.
    setTimeout(() => {
        onCancel();
    }, 4000);
  };

  const CurrentStepComponent = StepComponents[steps[currentStep].id];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <ProgressTracker steps={steps} currentStep={currentStep} />
      <div className="flex-1 p-4 md:p-8">
        <FormProvider {...form}>
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
                  <Button type="button" onClick={next}>
                    Next
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                   <Button type="submit" disabled={!form.formState.isValid || isSubmitting}>
                     {isSubmitting ? 'Submitting...' : 'Submit Application'}
                   </Button>
                )}
              </CardFooter>
            </Card>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
