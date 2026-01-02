'use server';

import { extractAndValidateData, type ExtractAndValidateDataInput } from '@/ai/flows/extract-and-validate-data';

export async function verifyDocuments(input: ExtractAndValidateDataInput) {
  try {
    const result = await extractAndValidateData(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error verifying documents:', error);
    return { success: false, error: 'Failed to verify documents. Please try again.' };
  }
}
