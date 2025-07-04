import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { JobApplication, ApplicationStatus, ApplicationDocument } from '../types';
import { toast } from 'react-hot-toast';
import {
  getUserApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  uploadApplicationDocument,
  deleteApplicationDocument
} from '../services/applicationService';

type ApplicationState = {
  applications: JobApplication[];
  currentApplication: JobApplication | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: ApplicationStatus;
    search?: string;
    jobType?: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    lastDoc: any;
  };
};

type ApplicationAction =
  | { type: 'FETCH_APPLICATIONS_START' }
  | { type: 'FETCH_APPLICATIONS_SUCCESS'; payload: { applications: JobApplication[]; lastDoc: any } }
  | { type: 'FETCH_APPLICATIONS_ERROR'; payload: string }
  | { type: 'FETCH_APPLICATION_START' }
  | { type: 'FETCH_APPLICATION_SUCCESS'; payload: JobApplication }
  | { type: 'FETCH_APPLICATION_ERROR'; payload: string }
  | { type: 'CREATE_APPLICATION_START' }
  | { type: 'CREATE_APPLICATION_SUCCESS'; payload: JobApplication }
  | { type: 'CREATE_APPLICATION_ERROR'; payload: string }
  | { type: 'UPDATE_APPLICATION_START' }
  | { type: 'UPDATE_APPLICATION_SUCCESS'; payload: JobApplication }
  | { type: 'UPDATE_APPLICATION_ERROR'; payload: string }
  | { type: 'DELETE_APPLICATION_START' }
  | { type: 'DELETE_APPLICATION_SUCCESS'; payload: string } // Application ID
  | { type: 'DELETE_APPLICATION_ERROR'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<ApplicationState['filters']> }
  | { type: 'RESET_FILTERS' }
  | { type: 'NEXT_PAGE' }
  | { type: 'PREV_PAGE' }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'RESET_PAGINATION' }
  | { type: 'CLEAR_CURRENT_APPLICATION' };

const initialState: ApplicationState = {
  applications: [],
  currentApplication: null,
  isLoading: false,
  error: null,
  filters: {
    sortBy: 'applicationDate',
    sortDirection: 'desc',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    lastDoc: null,
  },
};

const applicationReducer = (state: ApplicationState, action: ApplicationAction): ApplicationState => {
  switch (action.type) {
    case 'FETCH_APPLICATIONS_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'FETCH_APPLICATIONS_SUCCESS':
      return {
        ...state,
        applications: action.payload.applications,
        isLoading: false,
        error: null,
        pagination: {
          ...state.pagination,
          lastDoc: action.payload.lastDoc,
          totalPages: Math.ceil(action.payload.applications.length / state.pagination.pageSize) || 1,
        },
      };
    case 'FETCH_APPLICATIONS_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'FETCH_APPLICATION_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'FETCH_APPLICATION_SUCCESS':
      return {
        ...state,
        currentApplication: action.payload,
        isLoading: false,
        error: null,
      };
    case 'FETCH_APPLICATION_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CREATE_APPLICATION_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'CREATE_APPLICATION_SUCCESS':
      return {
        ...state,
        applications: [action.payload, ...state.applications],
        isLoading: false,
        error: null,
      };
    case 'CREATE_APPLICATION_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'UPDATE_APPLICATION_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'UPDATE_APPLICATION_SUCCESS':
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.id ? action.payload : app
        ),
        currentApplication: state.currentApplication?.id === action.payload.id
          ? action.payload
          : state.currentApplication,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_APPLICATION_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'DELETE_APPLICATION_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'DELETE_APPLICATION_SUCCESS':
      return {
        ...state,
        applications: state.applications.filter(app => app.id !== action.payload),
        currentApplication: null,
        isLoading: false,
        error: null,
      };
    case 'DELETE_APPLICATION_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
        pagination: {
          ...state.pagination,
          currentPage: 1,
          lastDoc: null,
        },
      };
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: {
          sortBy: 'applicationDate',
          sortDirection: 'desc',
        },
        pagination: {
          ...state.pagination,
          currentPage: 1,
          lastDoc: null,
        },
      };
    case 'NEXT_PAGE':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          currentPage: state.pagination.currentPage + 1,
        },
      };
    case 'PREV_PAGE':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          currentPage: Math.max(1, state.pagination.currentPage - 1),
        },
      };
    case 'SET_PAGE':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          currentPage: action.payload,
        },
      };
    case 'RESET_PAGINATION':
      return {
        ...state,
        pagination: {
          ...initialState.pagination,
        },
      };
    case 'CLEAR_CURRENT_APPLICATION':
      return {
        ...state,
        currentApplication: null,
      };
    default:
      return state;
  }
};

interface ApplicationContextType {
  state: ApplicationState;
  dispatch: React.Dispatch<ApplicationAction>;
  fetchApplications: () => Promise<void>;
  fetchApplication: (id: string) => Promise<void>;
  addApplication: (application: Omit<JobApplication, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<JobApplication>;
  updateCurrentApplication: (updates: Partial<JobApplication>) => Promise<void>;
  removeApplication: (id: string) => Promise<void>;
  uploadDocument: (file: File, type: 'resume' | 'cover-letter' | 'other') => Promise<ApplicationDocument>;
  removeDocument: (documentUrl: string) => Promise<void>;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};

interface ApplicationProviderProps {
  children: ReactNode;
}

export const ApplicationProvider = ({ children }: ApplicationProviderProps) => {
  const [state, dispatch] = useReducer(applicationReducer, initialState);
  const { currentUser } = useAuth();

  // Fetch applications when user changes or filters change
  useEffect(() => {
    if (currentUser) {
      fetchApplications();
    }
  }, [currentUser, state.filters]);

  const fetchApplications = async () => {
    if (!currentUser) return;

    try {
      dispatch({ type: 'FETCH_APPLICATIONS_START' });

      const { applications, lastDoc } = await getUserApplications(
        currentUser.uid,
        state.filters,
        {
          pageSize: state.pagination.pageSize,
          lastDoc: state.pagination.lastDoc,
        }
      );

      dispatch({
        type: 'FETCH_APPLICATIONS_SUCCESS',
        payload: { applications, lastDoc }
      });
    } catch (error: any) {
      dispatch({
        type: 'FETCH_APPLICATIONS_ERROR',
        payload: error.message || 'Failed to fetch applications'
      });
      toast.error('Failed to load applications');
    }
  };

  const fetchApplication = async (id: string) => {
    if (!currentUser) return;

    try {
      dispatch({ type: 'FETCH_APPLICATION_START' });

      const application = await getApplication(id);

      if (application) {
        dispatch({ type: 'FETCH_APPLICATION_SUCCESS', payload: application });
      } else {
        throw new Error('Application not found');
      }
    } catch (error: any) {
      dispatch({
        type: 'FETCH_APPLICATION_ERROR',
        payload: error.message || 'Failed to fetch application'
      });
      toast.error('Failed to load application details');
    }
  };

  const addApplication = async (application: Omit<JobApplication, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      dispatch({ type: 'CREATE_APPLICATION_START' });

      const newApplication = await createApplication({
        ...application,
        userId: currentUser.uid,
      });

      dispatch({ type: 'CREATE_APPLICATION_SUCCESS', payload: newApplication });
      toast.success('Application added successfully');
      return newApplication;
    } catch (error: any) {
      dispatch({
        type: 'CREATE_APPLICATION_ERROR',
        payload: error.message || 'Failed to add application'
      });
      toast.error('Failed to add application');
      throw error;
    }
  };

  const updateCurrentApplication = async (updates: Partial<JobApplication>) => {
    if (!currentUser || !state.currentApplication) return;

    try {
      dispatch({ type: 'UPDATE_APPLICATION_START' });

      await updateApplication(state.currentApplication.id, updates);
      
      // Create updated application object
      const updatedApplication = {
        ...state.currentApplication,
        ...updates,
      };

      dispatch({ type: 'UPDATE_APPLICATION_SUCCESS', payload: updatedApplication });
      toast.success('Application updated successfully');
    } catch (error: any) {
      dispatch({
        type: 'UPDATE_APPLICATION_ERROR',
        payload: error.message || 'Failed to update application'
      });
      toast.error('Failed to update application');
    }
  };

  const removeApplication = async (id: string) => {
    if (!currentUser) return;

    try {
      dispatch({ type: 'DELETE_APPLICATION_START' });

      await deleteApplication(id);

      dispatch({ type: 'DELETE_APPLICATION_SUCCESS', payload: id });
      toast.success('Application deleted successfully');
    } catch (error: any) {
      dispatch({
        type: 'DELETE_APPLICATION_ERROR',
        payload: error.message || 'Failed to delete application'
      });
      toast.error('Failed to delete application');
    }
  };

  const uploadDocument = async (file: File, type: 'resume' | 'cover-letter' | 'other') => {
    if (!currentUser || !state.currentApplication) {
      throw new Error('No application selected or user not authenticated');
    }

    try {
      const document = await uploadApplicationDocument(
        currentUser.uid,
        state.currentApplication.id,
        file,
        type
      );

      // Update current application with new document
      const updatedDocuments = [
        ...(state.currentApplication.documents || []),
        document
      ];

      const updatedApplication = {
        ...state.currentApplication,
        documents: updatedDocuments,
      };

      dispatch({ type: 'UPDATE_APPLICATION_SUCCESS', payload: updatedApplication });
      toast.success('Document uploaded successfully');

      return document;
    } catch (error: any) {
      toast.error('Failed to upload document');
      throw error;
    }
  };

  const removeDocument = async (documentUrl: string) => {
    if (!currentUser || !state.currentApplication) {
      throw new Error('No application selected or user not authenticated');
    }

    try {
      await deleteApplicationDocument(state.currentApplication.id, documentUrl);

      // Update current application by removing the document
      const updatedDocuments = (state.currentApplication.documents || [])
        .filter(doc => doc.url !== documentUrl);

      const updatedApplication = {
        ...state.currentApplication,
        documents: updatedDocuments,
      };

      dispatch({ type: 'UPDATE_APPLICATION_SUCCESS', payload: updatedApplication });
      toast.success('Document removed successfully');
    } catch (error: any) {
      toast.error('Failed to remove document');
      throw error;
    }
  };

  const value = {
    state,
    dispatch,
    fetchApplications,
    fetchApplication,
    addApplication,
    updateCurrentApplication,
    removeApplication,
    uploadDocument,
    removeDocument,
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
}; 