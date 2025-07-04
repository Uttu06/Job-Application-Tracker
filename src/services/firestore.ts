import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { JobApplication as Application, Interview, Company } from '../../types';

// Applications collection
const applicationsCollection = collection(db, 'applications');

// Add a new application
export const addApplication = async (application: Omit<Application, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(applicationsCollection, {
      ...application,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding application:', error);
    throw error;
  }
};

// Get all applications for a user
export const getUserApplications = async (userId: string): Promise<Application[]> => {
  try {
    const q = query(
      applicationsCollection,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Application));
  } catch (error) {
    console.error('Error getting applications:', error);
    throw error;
  }
};

// Get a single application by ID
export const getApplicationById = async (id: string): Promise<Application | null> => {
  try {
    const docRef = doc(db, 'applications', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Application;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting application:', error);
    throw error;
  }
};

// Update an application
export const updateApplication = async (id: string, data: Partial<Application>): Promise<void> => {
  try {
    const docRef = doc(db, 'applications', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
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
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
};

// Interviews collection
const interviewsCollection = collection(db, 'interviews');

// Add a new interview
export const addInterview = async (interview: Omit<Interview, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(interviewsCollection, {
      ...interview,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding interview:', error);
    throw error;
  }
};

// Get all interviews for a user
export const getUserInterviews = async (userId: string): Promise<Interview[]> => {
  try {
    const q = query(
      interviewsCollection,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Interview));
  } catch (error) {
    console.error('Error getting interviews:', error);
    throw error;
  }
};

// Get interviews for a specific application
export const getApplicationInterviews = async (applicationId: string): Promise<Interview[]> => {
  try {
    const q = query(
      interviewsCollection,
      where('applicationId', '==', applicationId),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Interview));
  } catch (error) {
    console.error('Error getting application interviews:', error);
    throw error;
  }
};

// Update an interview
export const updateInterview = async (id: string, data: Partial<Interview>): Promise<void> => {
  try {
    const docRef = doc(db, 'interviews', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating interview:', error);
    throw error;
  }
};

// Delete an interview
export const deleteInterview = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'interviews', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting interview:', error);
    throw error;
  }
};

// Companies collection
const companiesCollection = collection(db, 'companies');

// Add a new company
export const addCompany = async (company: Omit<Company, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(companiesCollection, {
      ...company,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding company:', error);
    throw error;
  }
};

// Get all companies for a user
export const getUserCompanies = async (userId: string): Promise<Company[]> => {
  try {
    const q = query(
      companiesCollection,
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Company));
  } catch (error) {
    console.error('Error getting companies:', error);
    throw error;
  }
};

// Update a company
export const updateCompany = async (id: string, data: Partial<Company>): Promise<void> => {
  try {
    const docRef = doc(db, 'companies', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

// Delete a company
export const deleteCompany = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'companies', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
}; 