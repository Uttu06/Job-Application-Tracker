import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  orderBy,
  serverTimestamp,
  QueryConstraint,
  limit,
  startAfter,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { ApplicationDocument, JobApplication, ApplicationStatus } from '../types';

// Collection references
const applicationsRef = collection(db, 'applications');

// Helper to convert Firestore data to our application type
const convertApplication = (doc: any): JobApplication => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    // Ensure date fields are numbers (timestamps)
    applicationDate: data.applicationDate?.toMillis() || Date.now(),
    createdAt: data.createdAt?.toMillis() || Date.now(),
    updatedAt: data.updatedAt?.toMillis() || Date.now(),
  };
};

// Get all applications for a user
export const getUserApplications = async (
  userId: string,
  filters: {
    status?: ApplicationStatus;
    jobType?: string;
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  } = {},
  paginationParams: {
    pageSize?: number;
    lastDoc?: any;
  } = {}
): Promise<{ applications: JobApplication[]; lastDoc: any }> => {
  try {
    const constraints: QueryConstraint[] = [where('userId', '==', userId)];

    // Apply filters
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }

    if (filters.jobType) {
      constraints.push(where('jobType', '==', filters.jobType));
    }

    // Apply sorting
    const sortField = filters.sortBy || 'applicationDate';
    const sortDir = filters.sortDirection || 'desc';
    constraints.push(orderBy(sortField, sortDir));

    // Apply pagination
    const pageSize = paginationParams.pageSize || 10;
    constraints.push(limit(pageSize));
    
    if (paginationParams.lastDoc) {
      constraints.push(startAfter(paginationParams.lastDoc));
    }

    const q = query(applicationsRef, ...constraints);
    const snapshot = await getDocs(q);

    const applications = snapshot.docs.map(convertApplication);
    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    // Apply search filter (client-side) if needed
    // This is a simple implementation - in a production app, consider using Algolia or similar
    let filteredApplications = applications;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredApplications = applications.filter(app => 
        app.companyName.toLowerCase().includes(searchLower) ||
        app.jobTitle.toLowerCase().includes(searchLower) ||
        app.jobDescription?.toLowerCase().includes(searchLower) ||
        app.notes?.toLowerCase().includes(searchLower)
      );
    }

    return { applications: filteredApplications, lastDoc };
  } catch (error) {
    console.error('Error getting applications:', error);
    throw error;
  }
};

// Get a single application by ID
export const getApplication = async (id: string): Promise<JobApplication | null> => {
  try {
    const docRef = doc(db, 'applications', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return convertApplication(docSnap);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting application:', error);
    throw error;
  }
};

// Create a new application
export const createApplication = async (
  application: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>
): Promise<JobApplication> => {
  try {
    const newApplication = {
      ...application,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(applicationsRef, newApplication);
    const docSnap = await getDoc(docRef);

    return {
      ...convertApplication(docSnap),
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
};

// Update an existing application
export const updateApplication = async (
  id: string,
  updates: Partial<JobApplication>
): Promise<void> => {
  try {
    const docRef = doc(db, 'applications', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating application:', error);
    throw error;
  }
};

// Delete an application
export const deleteApplication = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'applications', id);
    
    // First get the application to check if there are documents to delete
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const application = convertApplication(docSnap);
      
      // Delete associated documents from storage if they exist
      if (application.documents?.length) {
        await Promise.all(
          application.documents.map(async (document) => {
            try {
              const storageRef = ref(storage, document.url);
              await deleteObject(storageRef);
            } catch (error) {
              console.error('Error deleting document from storage:', error);
              // Continue with deletion even if document deletion fails
            }
          })
        );
      }
    }
    
    // Finally delete the application document
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
};

// Upload a document for an application
export const uploadApplicationDocument = async (
  userId: string,
  applicationId: string,
  file: File,
  type: 'resume' | 'cover-letter' | 'other'
): Promise<ApplicationDocument> => {
  try {
    // Create a reference to upload the file
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `applications/${userId}/${applicationId}/${fileName}`;
    const fileRef = ref(storage, filePath);
    
    // Upload file
    await uploadBytes(fileRef, file);
    
    // Get download URL
    const downloadUrl = await getDownloadURL(fileRef);
    
    // Create document object
    const document: ApplicationDocument = {
      id: crypto.randomUUID(),
      name: file.name,
      url: downloadUrl,
      type,
      uploadedAt: new Date().toISOString(),
    };
    
    // Get current application
    const applicationRef = doc(db, 'applications', applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (applicationSnap.exists()) {
      const application = convertApplication(applicationSnap);
      const documents = application.documents || [];
      
      // Update application with new document
      await updateDoc(applicationRef, {
        documents: [...documents, document],
        updatedAt: serverTimestamp(),
      });
    }
    
    return document;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

// Delete a document from an application
export const deleteApplicationDocument = async (
  applicationId: string,
  documentUrl: string
): Promise<void> => {
  try {
    // Get current application
    const applicationRef = doc(db, 'applications', applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (applicationSnap.exists()) {
      const application = convertApplication(applicationSnap);
      const documents = application.documents || [];
      
      // Filter out the document to delete
      const updatedDocuments = documents.filter(doc => doc.url !== documentUrl);
      
      // Update application with filtered documents
      await updateDoc(applicationRef, {
        documents: updatedDocuments,
        updatedAt: serverTimestamp(),
      });
      
      // Delete from storage
      try {
        const storageRef = ref(storage, documentUrl);
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting document from storage:', error);
        // Continue even if storage deletion fails
      }
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// Export a service object with all application functions
export const getApplications = () => {
  return {
    getUserApplications,
    getApplication,
    addApplication: createApplication,
    updateApplication,
    deleteApplication,
    uploadApplicationDocument,
    deleteApplicationDocument
  };
}; 