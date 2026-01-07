'use client';

import * as React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { type Step } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { type FormState, type FieldName, type OnboardingFormData } from '@/lib/types';
import { useFormContext } from 'react-hook-form';

interface ProgressTrackerProps {
  steps: Step[];
  currentStepIndex: number;
}

export function ProgressTracker({ steps, currentStepIndex }: ProgressTrackerProps) {
  const { formState: { errors } } = useFormContext<OnboardingFormData>();

  const getStepStatus = (stepIdx: number, step: Step) => {
    if (stepIdx < currentStepIndex) {
      const stepFields = step.fields as FieldName<OnboardingFormData>[] | undefined;
      if (!stepFields) return 'complete';
      
      const hasError = stepFields.some(field => errors[field]);
      return hasError ? 'error' : 'complete';
    }
    if (stepIdx === currentStepIndex) {
      return 'current';
    }
    return 'upcoming';
  };

  return (
    <nav aria-label="Progress" className="p-6 md:p-8 bg-secondary/50 md:border-r md:w-64">
      <ol role="list" className="space-y-4 md:space-y-6">
        {steps.map((step, stepIdx) => {
          const status = getStepStatus(stepIdx, step);
          return (
            <li key={step.name} className="relative md:flex md:items-start">
              <div className="relative flex h-8 items-center md:flex-col md:items-center">
                {stepIdx < steps.length - 1 ? (
                   <Separator orientation="vertical" className="absolute left-4 top-8 h-full w-px bg-border md:static md:h-6 md:w-px md:ml-0" />
                ) : null}
                
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full">
                  {status === 'complete' ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <Check className="h-5 w-5 text-primary-foreground" />
                    </div>
                  ) : status === 'error' ? (
                     <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive">
                      <AlertCircle className="h-5 w-5 text-destructive-foreground" />
                    </div>
                  ) : status === 'current' ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background" />
                  )}
                </div>
              </div>
              <div className="ml-4 mt-1 min-w-0 md:ml-0 md:mt-2 md:text-center">
                <p
                  className={cn(
                    'text-sm font-medium',
                    status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
                  )}
                >
                  {step.name}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
