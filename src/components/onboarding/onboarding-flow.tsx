'use client';

import * as React from 'react';
import { useForm, type FieldName } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';

import { OnboardingFormData, OnboardingFormSchema, Step } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { ProgressTracker } from './progress-tracker';
import StepPersonalInfo from './steps/step-personal-info';
import StepDocumentUpload from './steps/step-document-upload';
import StepComplianceCheck from './steps/step-compliance-check';
import StepDigitalSignature from './steps/step-digital-signature';
import StepReview from './steps/step-review';

const steps: Step[] = [
  { id: '01', name: 'Personal Information', fields: ['fullName', 'dateOfBirth', 'address'] },
  { id: '02', name: 'Identity Verification', fields: ['document1Type', 'document2Type'] },
  { id: '03', name: 'Compliance Check' },
  { id: '04', name: 'Digital Signature', fields: ['signature', 'agreedToTerms'] },
  { id: '05', name: 'Review & Submit' },
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [previousStep, setPreviousStep] = React.useState(0);

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
    const output = await form.trigger(fields as FieldName[], { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
         await form.handleSubmit(() => {})();
      }
      setPreviousStep(currentStep);
      setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  };
  
  const direction = currentStep > previousStep ? 1 : -1;

  const getStepComponent = () => {
    switch (currentStep) {
      case 0:
        return <StepPersonalInfo />;
      case 1:
        return <StepDocumentUpload />;
      case 2:
        return <StepComplianceCheck next={next} />;
      case 3:
        return <StepDigitalSignature />;
      case 4:
        return <StepReview />;
      default:
        return null;
    }
  };

  return (
    <Card className="flex flex-col md:flex-row overflow-hidden">
      <ProgressTracker steps={steps} currentStep={currentStep} />
      <div className="flex-1 p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="relative overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                initial={{ opacity: 0, x: direction * 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 300 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-full"
              >
                {getStepComponent()}
              </motion.div>
            </AnimatePresence>
            
            <div className="mt-8 pt-5">
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prev}
                  disabled={currentStep === 0}
                  className="rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={next}
                  disabled={currentStep === steps.length - 1}
                  className="rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  );
}
