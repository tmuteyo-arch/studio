'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { AlertCircle, CheckCircle2, FileUp, Info, Loader2 } from 'lucide-react';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { verifyDocuments } from '@/lib/actions';
import { OnboardingFormData } from '@/lib/types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const documentTypes = ['Passport', "Driver's License", 'National ID Card', 'Utility Bill', 'Bank Statement'];

const documentRequirements = [
    {
        document: 'Valid Identity Document',
        details: 'Valid Passport, Driver’s License, or Plastic/Metal ID.',
        comment: 'Submit copies. The bank will verify them against originals and certify them.',
    },
    {
        document: 'Proof of Residence',
        details: 'Utility bills (ZESA/TelOne/Water) or a signed letter from an employer on a letterhead.',
        comment: 'Must not be more than 3 months old. Submit original bills.',
    },
    {
        document: 'Passport Size Photos',
        details: 'Recent color photographs.',
        comment: 'Submit recent photos.',
    },
];

export default function StepDocumentUpload() {
  const { toast } = useToast();
  const form = useFormContext<OnboardingFormData>();
  const [doc1, setDoc1] = React.useState<{ file: File | null; dataUri: string }>({ file: null, dataUri: '' });
  const [doc2, setDoc2] = React.useState<{ file: File | null; dataUri: string }>({ file: null, dataUri: '' });
  const [isLoading, setIsLoading] = React.useState(false);
  const [validationResult, setValidationResult] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docNumber: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      if (docNumber === 1) {
        setDoc1({ file, dataUri });
      } else {
        setDoc2({ file, dataUri });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVerification = async () => {
    if (!doc1.dataUri || !doc2.dataUri) {
      toast({
        variant: 'destructive',
        title: 'Missing Documents',
        description: 'Please upload both documents before proceeding.',
      });
      return;
    }

    setIsLoading(true);
    setValidationResult(null);

    const formData = form.getValues();
    const input = {
      document1DataUri: doc1.dataUri,
      document1Type: formData.document1Type,
      document2DataUri: doc2.dataUri,
      document2Type: formData.document2Type,
      formDataFields: {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
      },
    };

    const result = await verifyDocuments(input);
    setIsLoading(false);

    if (result.success && result.data) {
      setValidationResult(result.data.validationResult);
      // Pre-fill form with validated data
      Object.entries(result.data.validatedFields).forEach(([key, value]) => {
        form.setValue(key as keyof OnboardingFormData, value);
      });
       toast({
        title: 'Verification Complete',
        description: 'Your documents have been processed.',
      });
    } else {
      setValidationResult(result.error || 'An unknown error occurred.');
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: result.error || 'An unknown error occurred.',
      });
    }
  };

  return (
    <div>
      <CardHeader>
        <CardTitle>Identity Verification</CardTitle>
        <CardDescription>Upload the required documents for verification. Please see the table below for guidance.</CardDescription>
      </CardHeader>
      <div className="space-y-6 px-6">
        
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Document Guidelines</AlertTitle>
            <AlertDescription>
                <Table className="mt-2">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Document</TableHead>
                            <TableHead>Comment</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documentRequirements.map((req) => (
                            <TableRow key={req.document}>
                                <TableCell className="font-medium">{req.document}<p className="text-xs text-muted-foreground font-normal">{req.details}</p></TableCell>
                                <TableCell>{req.comment}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Document 1 */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="document1Type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document 1 Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Upload Document 1</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type="file" className="pl-10" onChange={(e) => handleFileChange(e, 1)} />
                  <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </FormControl>
               {doc1.file && <p className="text-sm text-muted-foreground">{doc1.file.name}</p>}
            </FormItem>
          </div>

          {/* Document 2 */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="document2Type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document 2 Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Upload Document 2</FormLabel>
              <FormControl>
                <div className="relative">
                    <Input type="file" className="pl-10" onChange={(e) => handleFileChange(e, 2)} />
                    <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </FormControl>
              {doc2.file && <p className="text-sm text-muted-foreground">{doc2.file.name}</p>}
            </FormItem>
          </div>
        </div>
        
        <Button onClick={handleVerification} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Verify Documents
        </Button>

        {validationResult && (
          <Alert variant={validationResult.includes('discrepancies') ? 'destructive' : 'default'}>
            {validationResult.includes('discrepancies') ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <AlertTitle>Validation Result</AlertTitle>
            <AlertDescription>{validationResult}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
