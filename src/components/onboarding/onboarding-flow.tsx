'use client';

import * as React from 'react';
import { FormProvider, useForm, type FieldName } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { OnboardingFormData, OnboardingFormSchema, Step } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressTracker } from './progress-tracker';

import StepAccountType from './steps/step-account-type';
import StepPersonalInfo from './steps/step-personal-info';
import StepCorporateInfo from './steps/step-corporate-info'; // NEW
import StepDocumentUpload from './steps/step-document-upload';
import StepComplianceCheck from './steps/step-compliance-check';
import StepDigitalSignature from './steps/step-digital-signature';
import StepReview from './steps/step-review';

const baseSteps: Step[] = [
  { id: 'account-type', name: 'Account Type', fields: ['clientType'] },
  { id: 'personal-info', name: 'Personal Info', fields: ['fullName', 'dateOfBirth', 'address'] },
  { id: 'corporate-info', name: 'Corporate Info', isDynamic: true }, // NEW: Dynamic step
  { id: 'document-upload', name: 'Document Upload', fields: ['document1Type', 'document2Type'] },
  { id: 'compliance-check', name: 'Compliance Check' },
  { id: 'digital-signature', name: 'Digital Signature', fields: ['signature', 'agreedToTerms'] },
  { id: 'review-submit', name: 'Review & Submit' },
];

const StepComponents: Record<string, React.ElementType> = {
  'account-type': StepAccountType,
  'personal-info': StepPersonalInfo,
  'corporate-info': StepCorporateInfo, // NEW
  'document-upload': StepDocumentUpload,
  'compliance-check': StepComplianceCheck,
  'digital-signature': StepDigitalSignature,
  'review-submit': StepReview,
};

interface OnboardingFlowProps {
  onCancel: () => void;
}

export default function OnboardingFlow({ onCancel }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(OnboardingFormSchema),
    defaultValues: {
      clientType: '',
      fullName: '',
      dateOfBirth: '',
      address: '',
      document1Type: '',
      document2Type: '',
      signature: '',
      agreedToTerms: false,
    },
  });

  const clientType = form.watch('clientType');
  const isCorporate = ['Company (Private / Public Limited)', 'PBC Account'].includes(clientType);

  const steps = React.useMemo(() => {
    return baseSteps.filter(step => {
      if (step.isDynamic) {
        return isCorporate;
      }
      if (clientType === 'Personal Account' && step.id === 'personal-info') {
         // for personal account, the main applicant IS the client
      }
      return true;
    });
  }, [clientType, isCorporate]);

  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await form.trigger(fields as FieldName<OnboardingFormData>[], { shouldFocus: true });
    
    if (!output) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  };
  
  const CurrentStepComponent = StepComponents[steps[currentStep].id];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <ProgressTracker steps={steps} currentStep={currentStep} />
      <div className="flex-1 p-4 md:p-8">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(() => {
              setIsSubmitting(true);
              // Actual submission logic will be handled inside StepReview
            })}
            className="h-full"
          >
            <Card className="h-full flex flex-col">
              <CardContent className="flex-1 py-6">
                <CurrentStepComponent next={next} />
              </CardContent>
              <CardFooter className="border-t px-6 py-4 justify-between">
                <Button variant="outline" onClick={currentStep === 0 ? onCancel : prev}>
                  {currentStep === 0 ? 'Cancel' : 'Back'}
                </Button>
                {currentStep < steps.length - 1 && (
                  <Button type="button" onClick={next}>
                    Next
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                   <Button type="submit" disabled={isSubmitting}>
                     Submit Application
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