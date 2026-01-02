'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting data from uploaded documents,
 * pre-filling form fields, and validating the information across different document types using an LLM.
 *
 * - extractAndValidateData - A function that handles the data extraction and validation process.
 * - ExtractAndValidateDataInput - The input type for the extractAndValidateData function.
 * - ExtractAndValidateDataOutput - The return type for the extractAndValidateData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractAndValidateDataInputSchema = z.object({
  document1DataUri: z
    .string()
    .describe(
      "A data URI of the first document, that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  document1Type: z.string().describe('The type of the first document (e.g., passport, driver\'s license).'),
  document2DataUri: z
    .string()
    .describe(
      "A data URI of the second document, that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  document2Type: z.string().describe('The type of the second document (e.g., utility bill, bank statement).'),
  formDataFields: z.record(z.string()).describe('The form data fields to be pre-filled, as a key-value object.'),
});
export type ExtractAndValidateDataInput = z.infer<typeof ExtractAndValidateDataInputSchema>;

const ExtractAndValidateDataOutputSchema = z.object({
  validatedFields: z.record(z.string()).describe('The validated form data fields, as a key-value object.'),
  validationResult: z.string().describe('A summary of the validation result, including any discrepancies found.'),
});
export type ExtractAndValidateDataOutput = z.infer<typeof ExtractAndValidateDataOutputSchema>;

export async function extractAndValidateData(input: ExtractAndValidateDataInput): Promise<ExtractAndValidateDataOutput> {
  return extractAndValidateDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractAndValidateDataPrompt',
  input: {schema: ExtractAndValidateDataInputSchema},
  output: {schema: ExtractAndValidateDataOutputSchema},
  prompt: `You are an expert data extraction and validation specialist.

You will receive data extracted from two different document types, as well as a set of form data fields to be pre-filled.

Your task is to:

1.  **Extract relevant information** from the two documents provided.
2.  **Pre-fill the form data fields** based on the extracted information.
3.  **Validate the information** across the two documents and the existing form data fields to identify any discrepancies or inconsistencies.
4.  **Provide a summary of the validation result**, highlighting any issues found.

Here's the information you have:

Document 1 Type: {{{document1Type}}}
Document 1: {{media url=document1DataUri}}

Document 2 Type: {{{document2Type}}}
Document 2: {{media url=document2DataUri}}

Form Data Fields: {{{JSON.stringify(formDataFields)}}}

Based on this information, please provide the validated form data fields and a validation result summary.

Output should be formatted as JSON:
{
  "validatedFields": {
  //Key value pairs of validated fields
  },
  "validationResult": "Summary of validation results"
}
`,
});

const extractAndValidateDataFlow = ai.defineFlow(
  {
    name: 'extractAndValidateDataFlow',
    inputSchema: ExtractAndValidateDataInputSchema,
    outputSchema: ExtractAndValidateDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
