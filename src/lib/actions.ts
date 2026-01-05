'use server';

import { extractAndValidateData, type ExtractAndValidateDataInput } from '@/ai/flows/extract-and-validate-data';
import { summarizeApplication, type SummarizeApplicationInput } from '@/ai/flows/summarize-application-flow';

export async function verifyDocuments(input: ExtractAndValidateDataInput) {
  try {
    const result = await extractAndValidateData(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error verifying documents:', error);
    return { success: false, error: 'Failed to verify documents. Please try again.' };
  }
}

export async function generateApplicationSummary(input: SummarizeApplicationInput) {
    try {
        const result = await summarizeApplication(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error generating summary:', error);
        return { success: false, error: 'Failed to generate application summary.' };
    }
}
