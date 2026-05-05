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

/**
 * Service to handle immediate cloud persistence of documents.
 */
export class DocumentPersistenceService {
  private firestore: Firestore;
  private storage: FirebaseStorage;

  constructor(firestore: Firestore, storage: FirebaseStorage) {
    this.firestore = firestore;
    this.storage = storage;
  }

  /**
   * Uploads a data URI (base64) to Storage and saves metadata to Firestore.
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

    // 1. Upload to Storage
    const storagePath = `applications/${appId}/${documentType}/${Date.now()}_${fileName}`;
    const storageRef = ref(this.storage, storagePath);
    
    // Check if it's base64/dataUri or just a raw string
    const format = dataUri.startsWith('data:') ? 'data_url' : 'raw';
    await uploadString(storageRef, dataUri, format as any);
    const downloadUrl = await getDownloadURL(storageRef);

    // 2. Save metadata to Firestore
    const docRef = await addDoc(collection(this.firestore, 'captured_documents'), {
      appId,
      userId,
      documentType,
      fileName,
      fileUrl: downloadUrl,
      storagePath,
      uploadStatus: isFinal ? 'final' : 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      url: downloadUrl
    };
  }

  /**
   * Retrieves all draft documents for a specific application.
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
   * Marks a specific document record as final.
   */
  async finalizeDocument(documentRecordId: string) {
    const docRef = doc(this.firestore, 'captured_documents', documentRecordId);
    await updateDoc(docRef, {
      uploadStatus: 'final',
      updatedAt: serverTimestamp()
    });
  }
}
