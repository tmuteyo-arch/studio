'use client';

import * as React from 'react';
import { FormProvider, useForm, type FieldName } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';

import { OnboardingFormData, OnboardingFormSchema, Step, DirectorFormData } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressTracker } from './progress-tracker';

import StepAccountType from './steps/step-account-type';
import StepPersonalInfo from './steps/step-personal-info';
import StepCorporateInfo from './steps/step-corporate-info';
import StepDirectors from './steps/step-directors';
import StepDocumentUpload from './steps/step-document-upload';
import StepReview from './steps/step-review';
import { Application } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/users';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
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
import { checkForDuplicates } from '@/lib/actions';


const baseSteps: Step[] = [
  { id: 'account-type', name: 'Account Type', fields: ['clientType'] },
  { id: 'personal-info', name: 'Applicant Info' },
  { id: 'document-upload', name: 'Document Upload', fields: ['document1Type', 'document2Type'] },
  { id: 'review-submit', name: 'Review & Submit', fields: ['signature', 'agreedToTerms'] },
];

const StepComponents: Record<string, React.ElementType> = {
  'account-type': StepAccountType,
  'personal-info': StepPersonalInfo,
  'corporate-info': StepCorporateInfo,
  'directors-signatories': StepDirectors,
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
  const [currentStep, setCurrentStep] = React.useState(0);
  const { toast } = useToast();
  const { firestore } = useFirestore();

  const [isCheckingDuplicates, setIsCheckingDuplicates] = React.useState(false);
  const [duplicateInfo, setDuplicateInfo] = React.useState<DuplicateInfo>({ isDuplicate: false, message: '' });


  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(OnboardingFormSchema),
    mode: 'onChange', // Validate on change to update submit button status
    defaultValues: {
      clientType: '',
      fullName: '',
      dateOfBirth: '',
      address: '',
      // Corporate fields
      organisationLegalName: undefined,
      tradeName: undefined,
      physicalAddress: undefined,
      postalAddress: undefined,
      businessTelNumber: undefined,
      email: undefined,
      webAddress: undefined,
      dateOfIncorporation: undefined,
      countryOfIncorporation: undefined,
      certificateOfIncorporationNumber: undefined,
      natureOfBusiness: undefined,
      sourceOfWealth: undefined,
      noOfEmployees: undefined,
      economicSector: undefined,
      // End corporate fields
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
            personalInfoStep.name = 'Primary Contact';
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
  
  const handleDuplicateCheck = async (): Promise<boolean> => {
    if (!firestore) return true; // Don't block if firebase isn't configured
    
    const currentStepId = steps[currentStep].id;
    const data = form.getValues();
    let checks: Promise<{ isDuplicate: boolean, message: string }>[] = [];

    if (currentStepId === 'personal-info' && !isCorporate) {
        checks.push(
            checkForDuplicates('fullName', data.fullName).then(res => ({...res, message: `A client with the name '${data.fullName}' already exists (ID: ${res.existingId}).`})),
        );
    } else if (currentStepId === 'corporate-info' && data.organisationLegalName) {
         checks.push(
            checkForDuplicates('organisationLegalName', data.organisationLegalName).then(res => ({...res, message: `A company with the legal name '${data.organisationLegalName}' already exists (ID: ${res.existingId}).`})),
         );
         if(data.certificateOfIncorporationNumber) {
            checks.push(
              checkForDuplicates('certificateOfIncorporationNumber', data.certificateOfIncorporationNumber).then(res => ({...res, message: `A company with the incorporation number '${data.certificateOfIncorporationNumber}' already exists (ID: ${res.existingId}).`}))
            )
         }
    } else if (currentStepId === 'directors-signatories') {
        data.directors?.forEach(director => {
             if(director.idNumber) {
                checks.push(
                    checkForDuplicates('idNumber', director.idNumber).then(res => ({...res, message: `A director with the ID number '${director.idNumber}' already exists on another application (ID: ${res.existingId}).`})),
                );
             }
             if(director.phoneNumber) {
                checks.push(
                    checkForDuplicates('phoneNumber', director.phoneNumber).then(res => ({...res, message: `A director with the phone number '${director.phoneNumber}' already exists on another application (ID: ${res.existingId}).`}))
                );
             }
        });
    }

    if (checks.length === 0) {
        return true; // No checks needed for this step
    }

    setIsCheckingDuplicates(true);
    const results = await Promise.all(checks);
    setIsCheckingDuplicates(false);

    const firstDuplicate = results.find(r => r.isDuplicate);

    if (firstDuplicate) {
        setDuplicateInfo({ isDuplicate: true, message: firstDuplicate.message });
        return false;
    }

    return true;
};

  const next = async () => {
    const stepFields = steps[currentStep].fields as FieldName<OnboardingFormData>[] | undefined;
    const isValid = await form.trigger(stepFields);
    
    if (!isValid) {
      toast({
        title: "Incomplete Information",
        description: "Please fill out all required fields before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    const canProceed = await handleDuplicateCheck();
    if (!canProceed) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
    }
  };


  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  };
  
  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    
    // Final duplicate check before submission
    if (firestore) {
      const isDuplicateOnSubmit = !(await handleDuplicateCheck());
      if (isDuplicateOnSubmit) {
        setIsSubmitting(false);
        return; // The dialog will be shown by handleDuplicateCheck
      }
    }
    
    const newApplicationData = {
      clientName: data.fullName,
      clientType: data.clientType as any,
      status: 'Submitted',
      submittedDate: format(new Date(), 'yyyy-MM-dd'),
      lastUpdated: serverTimestamp(),
      submittedBy: user.name,
      fcbStatus: 'Inclusive',
      details: {
        // Personal info / Primary contact
        fullName: data.fullName,
        address: data.address,
        dateOfBirth: data.dateOfBirth,
        contactNumber: data.businessTelNumber || data.directors?.[0]?.phoneNumber || 'N/A',
        email: data.email || 'N/A',

        // Corporate details from the new form
        organisationLegalName: data.organisationLegalName || null,
        tradeName: data.tradeName || null,
        physicalAddress: data.physicalAddress || null,
        postalAddress: data.postalAddress || null,
        webAddress: data.webAddress || null,
        faxNumber: data.faxNumber || null,
        natureOfBusiness: data.natureOfBusiness || null,
        sourceOfWealth: data.sourceOfWealth || null,
        typeOfBusiness: data.typeOfBusiness || null,
        noOfEmployees: data.noOfEmployees || null,
        economicSector: data.economicSector || null,
        authorisedCapital: data.authorisedCapital || null,
        taxPayerNumber: data.taxPayerNumber || null,
        dateOfIncorporation: data.dateOfIncorporation || null,
        countryOfIncorporation: data.countryOfIncorporation || null,
        certificateOfIncorporationNumber: data.certificateOfIncorporationNumber || null,
        hasOtherAccounts: data.hasOtherAccounts || null,
        otherAccountNumbers: data.otherAccountNumbers || null,
        communicationPreference: data.communicationPreference || null,
        requestedServices: data.requestedServices || null,
        premisesStatus: data.premisesStatus || null,
        premisesOtherDetails: data.premisesOtherDetails || null,
        otherBank1Name: data.otherBank1Name || null,
        otherBank1AccName: data.otherBank1AccName || null,
        otherBank1AccNumber: data.otherBank1AccNumber || null,
        accountCurrency: data.accountCurrency || null,
        accountTypeTick: data.accountTypeTick || null,
        socials: data.socials || null,
      },
       directors: data.directors || [],
      documents: [
        { type: data.document1Type, fileName: `${data.document1Type.toLowerCase().replace(/\s/g, '_')}.pdf`, url: '#' },
        { type: data.document2Type, fileName: `${data.document2Type.toLowerCase().replace(/\s/g, '_')}.pdf`, url: '#' },
      ].filter(doc => doc.type),
      history: [
        { action: 'Submitted', user: user.name, timestamp: new Date().toISOString() },
      ],
      comments: [],
    };

    if (firestore) {
      try {
        await addDoc(collection(firestore, 'applications'), newApplicationData);
      } catch (error) {
        console.error("Error adding document: ", error);
        toast({
          title: "Submission Failed",
          description: "Could not submit application to the database. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    toast({
        title: "Application Submitted!",
        description: `Application for ${data.fullName} has been successfully created.`,
    });

    setTimeout(() => {
        onCancel();
    }, 1000);
  };

  const CurrentStepComponent = StepComponents[steps[currentStep].id];

  return (
    <FormProvider {...form}>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <ProgressTracker steps={steps} currentStep={currentStep} />
        <div className="flex-1 p-4 md:p-8">
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
                     <Button type="button" onClick={next} disabled={isCheckingDuplicates}>
                      {isCheckingDuplicates ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isCheckingDuplicates ? 'Checking...' : 'Next'}
                    </Button>
                  )}
                  {currentStep === steps.length - 1 && (
                     <Button type="submit" disabled={!form.formState.isValid || isSubmitting}>
                       {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                       {isSubmitting ? 'Submitting...' : 'Submit Application'}
                     </Button>
                  )}
                </CardFooter>
              </Card>
            </form>
        </div>

         <AlertDialog open={duplicateInfo.isDuplicate} onOpenChange={(isOpen) => !isOpen && setDuplicateInfo({ isDuplicate: false, message: '' })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Potential Duplicate Found</AlertDialogTitle>
              <AlertDialogDescription>
                {duplicateInfo.message}
                <br /><br />
                Please review the existing application before proceeding. Do you want to continue creating this new application anyway?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDuplicateInfo({ isDuplicate: false, message: '' })}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                setDuplicateInfo({ isDuplicate: false, message: '' });
                if (currentStep < steps.length - 1) {
                  setCurrentStep((step) => step + 1);
                }
              }}>
                Continue Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </FormProvider>
  );
}
