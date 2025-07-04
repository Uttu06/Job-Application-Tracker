import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { JobApplication as Application } from '../types';
import { getApplications } from '../services/applicationService';

export function useApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Create a query against the applications collection for this user
      const applicationsRef = collection(db, 'applications');
      const q = query(
        applicationsRef,
        where('userId', '==', user.uid),
        orderBy('applicationDate', 'desc')
      );

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const applicationDocs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Application[];
        
        setApplications(applicationDocs);
        setLoading(false);
      }, (err) => {
        console.error('Error fetching applications:', err);
        setError(err as Error);
        setLoading(false);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up applications subscription:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, [user]);

  const addApplication = async (applicationData: Omit<Application, 'id'>) => {
    try {
      if (!user) throw new Error('User must be authenticated');
      const newApplication = await getApplications().addApplication({
        ...applicationData,
        userId: user.uid
      });
      return newApplication;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateApplication = async (id: string, data: Partial<Application>) => {
    try {
      if (!user) throw new Error('User must be authenticated');
      await getApplications().updateApplication(id, data);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      if (!user) throw new Error('User must be authenticated');
      await getApplications().deleteApplication(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    applications,
    loading,
    error,
    addApplication,
    updateApplication,
    deleteApplication
  };
} 