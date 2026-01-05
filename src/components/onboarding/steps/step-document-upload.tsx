'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { AlertCircle, CheckCircle2, FileUp, Info, Loader2, Eye } from 'lucide-react';

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
import { getDocumentRequirements } from '@/lib/document-requirements';

const documentTypes = ['Passport', "Driver's License", 'National ID Card', 'Utility Bill', 'Bank Statement', 'Tax Clearance Certificate', 'Trading License', 'Board Resolution', 'Certificate of Incorporation', 'Memorandum and Articles of Association', 'CR6/CR5', 'CR14', 'CR11', 'Partnership Agreement', 'ADLA', 'Agency Agreement', 'Merchant Agreement', 'Write Up', 'Account Resolution Form'];

export default function StepDocumentUpload() {
  const { toast } = useToast();
  const form = useFormContext<OnboardingFormData>();
  const [doc1, setDoc1] = React.useState<{ file: File | null; dataUri: string }>({ file: null, dataUri: '' });
  const [doc2, setDoc2] = React.useState<{ file: File | null; dataUri: string }>({ file: null, dataUri: '' });
  const [isLoading, setIsLoading] = React.useState(false);
  const [validationResult, setValidationResult] = React.useState<string | null>(null);

  const clientType = form.watch('clientType');
  const documentRequirements = getDocumentRequirements(clientType);

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

  const renderFileUpload = (docNumber: 1 | 2, docState: { file: File | null; dataUri: string }, handler: (e: React.ChangeEvent<HTMLInputElement>, n: 1 | 2) => void, formFieldName: "document1Type" | "document2Type") => (
     <div className="space-y-2 p-4 border rounded-lg">
        <FormField
          control={form.control}
          name={formFieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document {docNumber} Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={`${type}-${docNumber}`} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {docState.file ? (
             <div className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                <div>
                    <p className="font-medium text-sm">{docState.file.name}</p>
                    <p className="text-xs text-muted-foreground">{Math.round(docState.file.size / 1024)} KB</p>
                </div>
                <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4"/>View</Button>
            </div>
        ) : (
            <FormItem>
              <FormLabel>Upload Document {docNumber}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type="file" className="pl-10" onChange={(e) => handler(e, docNumber)} />
                  <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </FormControl>
            </FormItem>
        )}
      </div>
  );

  return (
    <div>
      <CardHeader>
        <CardTitle>Identity Verification</CardTitle>
        <CardDescription>Upload the required documents for verification. Please see the table below for guidance.</CardDescription>
      </CardHeader>
      <div className="space-y-6 px-6">
        
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Document Requirements for: {clientType || 'Not Selected'}</AlertTitle>
            <AlertDescription>
                <Table className="mt-2">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Document Required</TableHead>
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
          {renderFileUpload(1, doc1, handleFileChange, "document1Type")}
          {renderFileUpload(2, doc2, handleFileChange, "document2Type")}
        </div>
        
        <Button onClick={handleVerification} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Verify Documents &amp; Pre-fill Form
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
