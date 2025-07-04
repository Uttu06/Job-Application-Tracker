import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { Interview } from '../types';
import { getInterviews } from '../services/interviewService';

export function useInterviews() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Create a query against the interviews collection for this user
      const interviewsRef = collection(db, 'interviews');
      const q = query(
        interviewsRef,
        where('userId', '==', user.uid),
        orderBy('date', 'asc')
      );

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const interviewDocs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Interview[];
        
        setInterviews(interviewDocs);
        setLoading(false);
      }, (err) => {
        console.error('Error fetching interviews:', err);
        setError(err as Error);
        setLoading(false);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up interviews subscription:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, [user]);

  const addInterview = async (interviewData: Omit<Interview, 'id'>) => {
    try {
      if (!user) throw new Error('User must be authenticated');
      const newInterview = await getInterviews().addInterview({
        ...interviewData,
        userId: user.uid
      });
      return newInterview;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateInterview = async (id: string, data: Partial<Interview>) => {
    try {
      if (!user) throw new Error('User must be authenticated');
      await getInterviews().updateInterview(id, data);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteInterview = async (id: string) => {
    try {
      if (!user) throw new Error('User must be authenticated');
      await getInterviews().deleteInterview(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    interviews,
    loading,
    error,
    addInterview,
    updateInterview,
    deleteInterview
  };
} 