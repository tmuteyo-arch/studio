'use server';

import { extractAndValidateData, type ExtractAndValidateDataInput } from '@/ai/flows/extract-and-validate-data';
import { summarizeApplication, type SummarizeApplicationInput } from '@/ai/flows/summarize-application-flow';

// Mock function for checking duplicates. In a real scenario, this would query a database.
export async function checkForDuplicates(field: string, value: string): Promise<{ isDuplicate: boolean; existingId: string | null }> {
    console.log(`Checking for duplicates for field '${field}' with value '${value}'...`);
    // This is a mock. In a real app, you would query your database.
    // For demonstration, we'll return no duplicates.
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
    return { isDuplicate: false, existingId: null };
}

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
