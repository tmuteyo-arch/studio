'use client';

import * as React from 'react';
import { Check, Loader } from 'lucide-react';
import { type Step } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface ProgressTrackerProps {
  steps: Step[];
  currentStep: number;
}

export function ProgressTracker({ steps, currentStep }: ProgressTrackerProps) {
  return (
    <nav aria-label="Progress" className="p-6 md:p-8 bg-secondary/50 md:border-r md:w-64">
      <ol role="list" className="space-y-4 md:space-y-6">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className="relative md:flex md:items-start">
            <div className="relative flex h-8 items-center md:flex-col md:items-center">
              {stepIdx < steps.length - 1 ? (
                 <Separator orientation="vertical" className="absolute left-4 top-8 h-full w-px bg-border md:static md:h-6 md:w-px md:ml-0" />
              ) : null}
              
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full">
                {stepIdx < currentStep ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Check className="h-5 w-5 text-primary-foreground" />
                  </div>
                ) : stepIdx === currentStep ? (
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
                  stepIdx <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.name}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
