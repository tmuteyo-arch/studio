'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing an application
 * and providing a basic risk assessment.
 *
 * - summarizeApplication - A function that handles the summarization process.
 * - SummarizeApplicationInput - The input type for the summarizeApplication function.
 * - SummarizeApplicationOutput - The return type for the summarizeApplication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeApplicationInputSchema = z.object({
  clientType: z.string(),
  clientName: z.string(),
  status: z.string(),
  fcbStatus: z.string(),
  documents: z.array(z.object({ type: z.string(), fileName: z.string(), url: z.string()})),
  history: z.array(z.object({ action: z.string(), user: z.string(), timestamp: z.string(), notes: z.string().optional() })),
});
export type SummarizeApplicationInput = z.infer<typeof SummarizeApplicationInputSchema>;

const SummarizeApplicationOutputSchema = z.object({
    summary: z.string().describe('A concise summary of the application status, key details, and a brief risk assessment.'),
});
export type SummarizeApplicationOutput = z.infer<typeof SummarizeApplicationOutputSchema>;

export async function summarizeApplication(input: SummarizeApplicationInput): Promise<SummarizeApplicationOutput> {
  return summarizeApplicationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeApplicationPrompt',
  input: {schema: SummarizeApplicationInputSchema},
  output: {schema: SummarizeApplicationOutputSchema},
  prompt: `You are an expert compliance officer for a bank. Your task is to provide a concise summary and a brief risk assessment for a new account application.

Analyze the following application data:

- Client Name: {{{clientName}}}
- Client Type: {{{clientType}}}
- Current Status: {{{status}}}
- Financial Clearing Bureau (FCB) Status: {{{fcbStatus}}}
- Documents Provided: {{{JSON.stringify(documents)}}}
- Application History: {{{JSON.stringify(history)}}}

Based on this information, provide a one-paragraph summary. The summary should:
1. State the client's name and account type.
2. Mention if the required documents seem to be in order for the account type.
3. Note the FCB status.
4. Conclude with a brief risk assessment (e.g., "Low risk," "Medium risk, requires further review," "High risk due to...").

Keep the entire summary to a maximum of 3-4 sentences.
`,
});

const summarizeApplicationFlow = ai.defineFlow(
  {
    name: 'summarizeApplicationFlow',
    inputSchema: SummarizeApplicationInputSchema,
    outputSchema: SummarizeApplicationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
