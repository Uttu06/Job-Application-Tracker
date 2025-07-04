import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  orderBy,
  serverTimestamp,
  where,
  limit as firestoreLimit,
  QueryConstraint,
  startAfter,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Company } from '../types';

// Collection references
const companiesRef = collection(db, 'companies');

// Helper to convert Firestore data to our company type
const convertCompany = (doc: any): Company => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toMillis() || Date.now(),
  };
};

// Get all companies
export const getCompanies = async (
  search?: string,
  paginationParams: {
    pageSize?: number;
    lastDoc?: any;
  } = {}
): Promise<{ companies: Company[]; lastDoc: any }> => {
  try {
    const constraints: QueryConstraint[] = [orderBy('name')];

    // Apply pagination
    const pageSize = paginationParams.pageSize || 20;
    constraints.push(firestoreLimit(pageSize));
    
    if (paginationParams.lastDoc) {
      constraints.push(startAfter(paginationParams.lastDoc));
    }

    const q = query(companiesRef, ...constraints);
    const snapshot = await getDocs(q);
    
    const companies = snapshot.docs.map(convertCompany);
    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    
    // Apply search filter client-side if needed
    let filteredCompanies = companies;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCompanies = companies.filter(company => 
        company.name.toLowerCase().includes(searchLower) ||
        (company.industry && company.industry.toLowerCase().includes(searchLower)) ||
        (company.description && company.description.toLowerCase().includes(searchLower))
      );
    }
    
    return { companies: filteredCompanies, lastDoc };
  } catch (error) {
    console.error('Error getting companies:', error);
    throw error;
  }
};

// Get company by ID
export const getCompany = async (id: string): Promise<Company | null> => {
  try {
    const docRef = doc(db, 'companies', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertCompany(docSnap);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting company:', error);
    throw error;
  }
};

// Get company by name (useful for autocomplete)
export const getCompanyByName = async (name: string): Promise<Company | null> => {
  try {
    const q = query(companiesRef, where('name', '==', name), firestoreLimit(1));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return convertCompany(snapshot.docs[0]);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting company by name:', error);
    throw error;
  }
};

// Create a new company
export const createCompany = async (
  company: Omit<Company, 'id' | 'createdAt'>
): Promise<Company> => {
  try {
    const newCompany = {
      ...company,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(companiesRef, newCompany);
    const docSnap = await getDoc(docRef);
    
    return {
      ...convertCompany(docSnap),
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

// Update an existing company
export const updateCompany = async (
  id: string,
  updates: Partial<Company>
): Promise<void> => {
  try {
    const docRef = doc(db, 'companies', id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

// Upload a company logo
export const uploadCompanyLogo = async (
  companyId: string,
  file: File
): Promise<string> => {
  try {
    // Create a storage reference
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `companies/${companyId}/logo/${fileName}`;
    const fileRef = ref(storage, filePath);
    
    // Upload file
    await uploadBytes(fileRef, file);
    
    // Get download URL
    const downloadUrl = await getDownloadURL(fileRef);
    
    // Update company with logo URL
    const companyRef = doc(db, 'companies', companyId);
    await updateDoc(companyRef, { logo: downloadUrl });
    
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading company logo:', error);
    throw error;
  }
};

// Search companies for autocomplete
export const searchCompanies = async (
  searchTerm: string,
  maxResults: number = 5
): Promise<Company[]> => {
  try {
    // Get companies sorted by name
    const q = query(companiesRef, orderBy('name'));
    const snapshot = await getDocs(q);
    
    // Filter companies client-side (Firestore doesn't support LIKE queries directly)
    const searchLower = searchTerm.toLowerCase();
    const filteredCompanies = snapshot.docs
      .map(convertCompany)
      .filter(company => company.name.toLowerCase().includes(searchLower))
      .slice(0, maxResults);
    
    return filteredCompanies;
  } catch (error) {
    console.error('Error searching companies:', error);
    throw error;
  }
}; 