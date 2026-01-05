'use server';

import { extractAndValidateData, type ExtractAndValidateDataInput } from '@/ai/flows/extract-and-validate-data';
import { summarizeApplication, type SummarizeApplicationInput } from '@/ai/flows/summarize-application-flow';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import {credential} from 'firebase-admin';

let adminApp: App;
if (!getApps().length) {
    adminApp = initializeApp({
        credential: credential.applicationDefault(),
    });
} else {
    adminApp = getApps()[0];
}

const db = getFirestore(adminApp);


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

export async function checkForDuplicates(field: string, value: string): Promise<{ isDuplicate: boolean; existingId: string | null }> {
    if (!value) {
        return { isDuplicate: false, existingId: null };
    }

    try {
        const applicationsRef = db.collection('applications');
        let query;

        // Note: Firestore is case-sensitive. For a case-insensitive search, you'd typically
        // store a normalized (e.g., lowercase) version of the field. For this implementation,
        // we'll use direct matching.
        switch (field) {
            case 'fullName':
                query = applicationsRef.where('clientName', '==', value);
                break;
            case 'idNumber': // This checks director's ID
                 query = applicationsRef.where('directors', 'array-contains', { idNumber: value });
                 break;
            case 'phoneNumber': // This checks director's phone
                 query = applicationsRef.where('directors', 'array-contains', { phoneNumber: value });
                 break;
            case 'certificateOfIncorporationNumber':
                 query = applicationsRef.where('details.certificateOfIncorporationNumber', '==', value);
                 break;
            default:
                return { isDuplicate: false, existingId: null };
        }

        const snapshot = await query.get();

        if (!snapshot.empty) {
            const existingDoc = snapshot.docs[0];
            return { isDuplicate: true, existingId: existingDoc.id };
        }

        return { isDuplicate: false, existingId: null };

    } catch (error) {
        console.error("Error checking for duplicates:", error);
        // In case of error, we don't block the user, but log the issue.
        return { isDuplicate: false, existingId: null };
    }
}