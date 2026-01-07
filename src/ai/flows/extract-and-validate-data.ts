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
  fcbStatus: z.enum(['Inclusive', 'Good', 'Adverse', 'PEP', 'Prior Adverse']).describe('The determined FCB status from the documents.'),
});
export type ExtractAndValidateDataOutput = z.infer<typeof ExtractAndValidateDataOutputSchema>;

export async function extractAndValidateData(input: ExtractAndValidateDataInput): Promise<ExtractAndValidateDataOutput> {
  return extractAndValidateDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractAndValidateDataPrompt',
  input: {schema: ExtractAndValidateDataInputSchema},
  output: {schema: ExtractAndValidateDataOutputSchema},
  prompt: `You are an expert compliance officer specializing in Anti-Money Laundering (AML) and Know Your Customer (KYC) procedures.

You will receive data from two different documents. Your task is to:

1.  **Act as a Compliance Officer:** Scrutinize the documents for common red flags associated with the "placement" stage of money laundering. Look for inconsistencies that might suggest false information, unusual sources of wealth, or other anomalies.
2.  **Extract Information:** Extract relevant information (like name, address, date of birth, company name) from the provided documents.
3.  **Pre-fill and Validate:** Use the extracted information to pre-fill and validate the provided form data fields. Highlight any discrepancies between the two documents or between the documents and the initial form data.
4.  **Determine FCB Status:** Based on the content of the documents, determine the Financial Clearing Bureau (FCB) status. This is a critical part of KYC. The status can be 'Inclusive', 'Good', 'Adverse', 'Prior Adverse', or 'PEP' (Politically Exposed Person). For example, if you see any mention of legal issues, sanctions, or criminal history, the status might be 'Adverse'. If the person holds a prominent public function, they are a 'PEP'. If the data is clean, 'Good' or 'Inclusive' is appropriate.
5.  **Provide a Summary:** Output a summary of your findings, including the validation result and any potential AML concerns.

Here's the information you have:

Document 1 Type: {{{document1Type}}}
Document 1: {{media url=document1DataUri}}

Document 2 Type: {{{document2Type}}}
Document 2: {{media url=document2DataUri}}

Form Data Fields: {{{JSON.stringify(formDataFields)}}}

Based on this information, provide the validated form data fields, the determined FCB status, and a validation result summary.

Output should be formatted as JSON:
{
  "validatedFields": {
  //Key value pairs of validated fields
  },
  "validationResult": "Summary of validation results and any AML concerns.",
  "fcbStatus": "The determined FCB status"
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
