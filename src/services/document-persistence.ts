'use client';

import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs,
  updateDoc,
  doc,
  Firestore
} from 'firebase/firestore';
import { 
  ref, 
  uploadString, 
  getDownloadURL,
  FirebaseStorage
} from 'firebase/storage';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * Service to handle immediate cloud persistence of forensic streams.
 */
export class DocumentPersistenceService {
  private firestore: Firestore;
  private storage: FirebaseStorage;

  constructor(firestore: Firestore, storage: FirebaseStorage) {
    this.firestore = firestore;
    this.storage = storage;
  }

  /**
   * Uploads a forensic stream (base64) to Storage and saves tracking metadata to Firestore.
   */
  async persistDocument(params: {
    appId: string;
    userId: string;
    documentType: string;
    fileName: string;
    dataUri: string;
    isFinal?: boolean;
  }) {
    const { appId, userId, documentType, fileName, dataUri, isFinal = false } = params;

    // 1. Upload to Storage (Binary Stream)
    // We await this because we need the resulting URL for the Firestore record
    const storagePath = `applications/${appId}/${documentType}/${Date.now()}_${fileName}`;
    const storageRef = ref(this.storage, storagePath);
    
    const format = dataUri.startsWith('data:') ? 'data_url' : 'raw';
    await uploadString(storageRef, dataUri, format as any);
    const downloadUrl = await getDownloadURL(storageRef);

    // 2. Save Tracking Metadata to Firestore (Non-blocking write)
    const payload = {
      appId,
      userId,
      documentType,
      fileName,
      fileUrl: downloadUrl,
      storagePath,
      uploadStatus: isFinal ? 'final' : 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const captureCollection = collection(this.firestore, 'captured_documents');
    
    // We initiate the write without awaiting it, using the projects' optimistic UI strategy.
    // Chained catch handles permissions and infrastructure failures.
    addDoc(captureCollection, payload)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: captureCollection.path,
          operation: 'create',
          requestResourceData: payload,
        } satisfies SecurityRuleContext);

        errorEmitter.emit('permission-error', permissionError);
      });

    return {
      url: downloadUrl
    };
  }

  /**
   * Retrieves forensic streams for an active application.
   */
  async getDraftDocuments(appId: string) {
    const q = query(
      collection(this.firestore, 'captured_documents'),
      where('appId', '==', appId),
      where('uploadStatus', '==', 'draft')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Finalizes forensic stream metadata.
   */
  async finalizeDocument(documentRecordId: string) {
    const docRef = doc(this.firestore, 'captured_documents', documentRecordId);
    const updatePayload = {
      uploadStatus: 'final',
      updatedAt: serverTimestamp()
    };

    updateDoc(docRef, updatePayload)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updatePayload,
        } satisfies SecurityRuleContext);

        errorEmitter.emit('permission-error', permissionError);
      });
  }
}
