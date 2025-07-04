import * as firestore from './firestore';
import { Application as JobApplication } from '../../types';

// Re-export enum-style objects to maintain compatibility with old code
export const ApplicationStatus = {
  APPLIED: 'applied',
  SCREENING: 'screening',
  INTERVIEWING: 'interviewing',
  OFFER: 'offer',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

// Forward functions with compatibility wrappers
export const getApplications = (userId: string) => {
  return firestore.getUserApplications(userId);
};

export const getApplication = (_userId: string, applicationId: string) => {
  return firestore.getApplicationById(applicationId);
};

export const addApplication = (userId: string, application: Omit<JobApplication, 'id'>) => {
  const appWithUserId = { ...application, userId };
  return firestore.addApplication(appWithUserId);
};

export const updateApplication = (_userId: string, id: string, data: Partial<JobApplication>) => {
  return firestore.updateApplication(id, data);
};

export const deleteApplication = (_userId: string, id: string) => {
  return firestore.deleteApplication(id);
};

// Interview related functions
export const getInterviews = (userId: string) => {
  return firestore.getUserInterviews(userId);
};

export const getApplicationInterviews = (_userId: string, applicationId: string) => {
  return firestore.getApplicationInterviews(applicationId);
};

export const addInterview = (userId: string, interview: any) => {
  const interviewWithUserId = { ...interview, userId };
  return firestore.addInterview(interviewWithUserId);
};

export const updateInterview = (_userId: string, id: string, data: any) => {
  return firestore.updateInterview(id, data);
};

export const deleteInterview = (_userId: string, id: string) => {
  return firestore.deleteInterview(id);
};

// Company related functions
export const getCompanies = (userId: string) => {
  return firestore.getUserCompanies(userId);
};

export const addCompany = (userId: string, company: any) => {
  const companyWithUserId = { ...company, userId };
  return firestore.addCompany(companyWithUserId);
};

export const updateCompany = (_userId: string, id: string, data: any) => {
  return firestore.updateCompany(id, data);
};

export const deleteCompany = (_userId: string, id: string) => {
  return firestore.deleteCompany(id);
}; 