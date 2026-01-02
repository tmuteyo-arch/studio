'use client';

import * as React from 'react';
import { FormProvider, useForm, type FieldName } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { OnboardingFormData, OnboardingFormSchema, Step } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressTracker } from './progress-tracker';

import StepPersonalInfo from './steps/step-personal-info';
import StepDocumentUpload from './steps/step-document-upload';
import StepComplianceCheck from './steps/step-compliance-check';
import StepDigitalSignature from './steps/step-digital-signature';
import StepReview from './steps/step-review';

const steps: Step[] = [
  { id: 'personal-info', name: 'Personal Info', fields: ['fullName', 'dateOfBirth', 'address'] },
  { id: 'document-upload', name: 'Document Upload', fields: ['document1Type', 'document2Type'] },
  { id: 'compliance-check', name: 'Compliance Check' },
  { id: 'digital-signature', name: 'Digital Signature', fields: ['signature', 'agreedToTerms'] },
  { id: 'review-submit', name: 'Review & Submit' },
];

const StepComponents: Record<string, React.ElementType> = {
  'personal-info': StepPersonalInfo,
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
      fullName: '',
      dateOfBirth: '',
      address: '',
      document1Type: '',
      document2Type: '',
      signature: '',
      agreedToTerms: false,
    },
  });

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
