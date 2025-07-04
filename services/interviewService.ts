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
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Interview } from '../types';

// Collection references
const interviewsRef = collection(db, 'interviews');

// Helper to convert Firestore data to our interview type
const convertInterview = (doc: any): Interview => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    // Ensure date fields are numbers (timestamps)
    date: data.date?.toMillis() || Date.now(),
    createdAt: data.createdAt?.toMillis() || Date.now(),
  };
};

// Get all interviews for a user
export const getUserInterviews = async (
  userId: string,
  filters: {
    applicationId?: string;
    startDate?: Date;
    endDate?: Date;
    outcome?: 'pending' | 'passed' | 'failed';
    type?: 'phone' | 'video' | 'onsite' | 'technical';
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  } = {},
  paginationParams: {
    pageSize?: number;
    lastDoc?: any;
  } = {}
): Promise<{ interviews: Interview[]; lastDoc: any }> => {
  try {
    const constraints: QueryConstraint[] = [where('userId', '==', userId)];

    // Apply filters
    if (filters.applicationId) {
      constraints.push(where('applicationId', '==', filters.applicationId));
    }

    if (filters.outcome) {
      constraints.push(where('outcome', '==', filters.outcome));
    }

    if (filters.type) {
      constraints.push(where('type', '==', filters.type));
    }

    // Apply date filters
    // Note: Firestore can't do complex queries with multiple inequality filters on different fields
    // So we'll apply date filtering client-side later if needed

    // Sort by scheduled date by default
    const sortField = filters.sortBy || 'date';
    const sortDir = filters.sortDirection || 'asc'; // Ascending by default for dates
    constraints.push(orderBy(sortField, sortDir));

    // Apply pagination
    const pageSize = paginationParams.pageSize || 10;
    constraints.push(limit(pageSize));
    
    if (paginationParams.lastDoc) {
      constraints.push(startAfter(paginationParams.lastDoc));
    }

    const q = query(interviewsRef, ...constraints);
    const snapshot = await getDocs(q);

    let interviews = snapshot.docs.map(convertInterview);
    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    // Apply date filtering client-side if needed
    if (filters.startDate || filters.endDate) {
      interviews = interviews.filter(interview => {
        const interviewDate = new Date(interview.date);
        let passesFilter = true;
        
        if (filters.startDate) {
          passesFilter = passesFilter && interviewDate >= filters.startDate;
        }
        
        if (filters.endDate) {
          passesFilter = passesFilter && interviewDate <= filters.endDate;
        }
        
        return passesFilter;
      });
    }

    return { interviews, lastDoc };
  } catch (error) {
    console.error('Error getting interviews:', error);
    throw error;
  }
};

// Get upcoming interviews for a user (for dashboard)
export const getUpcomingInterviews = async (userId: string, max: number = 5): Promise<Interview[]> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(today)),
      orderBy('date', 'asc'),
      limit(max)
    ];
    
    const q = query(interviewsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(convertInterview);
  } catch (error) {
    console.error('Error getting upcoming interviews:', error);
    throw error;
  }
};

// Get a single interview by ID
export const getInterview = async (id: string): Promise<Interview | null> => {
  try {
    const docRef = doc(db, 'interviews', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return convertInterview(docSnap);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting interview:', error);
    throw error;
  }
};

// Create a new interview
export const createInterview = async (
  interview: Omit<Interview, 'id' | 'createdAt'>
): Promise<Interview> => {
  try {
    // Convert Date objects to Firestore Timestamp
    const scheduledDate = typeof interview.date === 'number' 
      ? Timestamp.fromMillis(interview.date)
      : Timestamp.fromDate(new Date(interview.date));

    const newInterview = {
      ...interview,
      date: scheduledDate,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(interviewsRef, newInterview);
    const docSnap = await getDoc(docRef);

    return {
      ...convertInterview(docSnap),
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error creating interview:', error);
    throw error;
  }
};

// Update an existing interview
export const updateInterview = async (
  id: string,
  updates: Partial<Interview>
): Promise<void> => {
  try {
    const docRef = doc(db, 'interviews', id);
    
    // Handle date conversion if needed
    if (updates.date && typeof updates.date === 'object' && typeof (updates.date as any).toMillis === 'function') {
      updates.date = (updates.date as any).toMillis();
    }
    
    await updateDoc(docRef, updates);
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

// Get interviews by application ID
export const getInterviewsByApplication = async (
  applicationId: string
): Promise<Interview[]> => {
  try {
    const q = query(
      interviewsRef,
      where('applicationId', '==', applicationId),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertInterview);
  } catch (error) {
    console.error('Error getting interviews by application:', error);
    throw error;
  }
};

// Export a service object with all interview functions
export const getInterviews = () => {
  return {
    getUserInterviews,
    getUpcomingInterviews,
    getInterview,
    addInterview: createInterview,
    updateInterview,
    deleteInterview,
    getInterviewsByApplication
  };
}; 