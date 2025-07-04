import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ApplicationMethod } from '../types';
import { JobApplication, ApplicationStatus, Interview, ApplicationStatistics } from '../types';
import { addMonths, startOfMonth, endOfMonth, format } from 'date-fns';

// List of application methods for analytics (matches ApplicationMethod union)
const APPLICATION_METHODS = [
  'company-website',
  'linkedin',
  'indeed',
  'referral',
  'other',
] as const satisfies readonly ApplicationMethod[];

// Helper to convert Firestore data to our application type
const convertApplication = (doc: any): JobApplication => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    applicationDate: data.applicationDate?.toMillis() || Date.now(),
    createdAt: data.createdAt?.toMillis() || Date.now(),
    updatedAt: data.updatedAt?.toMillis() || Date.now(),
  };
};

// Helper to convert Firestore data to our interview type
const convertInterview = (doc: any): Interview => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    date: data.date?.toMillis() || Date.now(),
    createdAt: data.createdAt?.toMillis() || Date.now(),
  };
};

interface ApplicationStats {
  totalApplications: number;
  activeApplications: number;
  rejectedApplications: number;
  offerApplications: number;
  interviewRate: number; // Percentage
  offerRate: number; // Percentage
  applicationsByStatus: Record<ApplicationStatus, number>;
  applicationsByMethod: Record<ApplicationMethod, number>;
  monthlyApplications: Array<{ month: string; count: number }>;
  responseRate: number; // Percentage (any progress beyond applied)
  interviewsScheduled: number;
}

// Get application statistics for dashboard and analytics
export const getApplicationStats = async (userId: string): Promise<ApplicationStats> => {
  try {
    // Get all applications for the user
    const applicationsRef = collection(db, 'applications');
    const q = query(
      applicationsRef,
      where('userId', '==', userId),
      orderBy('applicationDate', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const applications = snapshot.docs.map(convertApplication);
    
    // Get all interviews for the user
    const interviewsRef = collection(db, 'interviews');
    const interviewsQ = query(
      interviewsRef,
      where('userId', '==', userId)
    );
    
    const interviewsSnapshot = await getDocs(interviewsQ);
    const interviews = interviewsSnapshot.docs.map(convertInterview);
    
    // Calculate statistics
    const totalApplications = applications.length;
    
    // Status counts
    const applicationsByStatus = applications.reduce((acc, app) => {
      const status = app.status as ApplicationStatus;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<ApplicationStatus, number>);
    
    // Add missing statuses with zero counts
    Object.values(ApplicationStatus).forEach(status => {
      if (!applicationsByStatus[status as ApplicationStatus]) {
        applicationsByStatus[status as ApplicationStatus] = 0;
      }
    });
    
    // Method counts
    const applicationsByMethod = applications.reduce((acc, app) => {
      if (app.applicationMethod) {
        const method = app.applicationMethod as ApplicationMethod;
        acc[method] = (acc[method] || 0) + 1;
      }
      return acc;
    }, {} as Record<ApplicationMethod, number>);
    
    // Add missing methods with zero counts
    APPLICATION_METHODS.forEach(method => {
      if (!applicationsByMethod[method]) {
        applicationsByMethod[method] = 0;
      }
    });
    
    // Active applications (anything not rejected, withdrawn, or offer)
    const activeApplications = applications.filter(app => 
      app.status !== ApplicationStatus.REJECTED && 
      app.status !== ApplicationStatus.WITHDRAWN && 
      app.status !== ApplicationStatus.OFFER
    ).length;
    
    // Rejected applications
    const rejectedApplications = applicationsByStatus[ApplicationStatus.REJECTED] || 0;
    
    // Offer applications
    const offerApplications = applicationsByStatus[ApplicationStatus.OFFER] || 0;
    
    // Response rate (anything beyond "applied" status)
    const respondedApplications = applications.filter(app => 
      app.status !== ApplicationStatus.APPLIED
    ).length;
    
    const responseRate = totalApplications > 0 
      ? (respondedApplications / totalApplications) * 100 
      : 0;
    
    // Interview rate (applications that have at least one interview)
    const applicationsWithInterviews = new Set(
      interviews.map(interview => interview.applicationId)
    ).size;
    
    const interviewRate = totalApplications > 0 
      ? (applicationsWithInterviews / totalApplications) * 100 
      : 0;
    
    // Offer rate
    const offerRate = totalApplications > 0 
      ? (offerApplications / totalApplications) * 100 
      : 0;
    
    // Monthly applications (last 6 months)
    const monthlyApplications: Array<{ month: string; count: number }> = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(addMonths(today, -i));
      const monthEnd = endOfMonth(addMonths(today, -i));
      
      const monthCount = applications.filter(app => {
        const appDate = new Date(app.applicationDate);
        return appDate >= monthStart && appDate <= monthEnd;
      }).length;
      
      monthlyApplications.push({
        month: format(monthStart, 'MMM yyyy'),
        count: monthCount
      });
    }
    
    return {
      totalApplications,
      activeApplications,
      rejectedApplications,
      offerApplications,
      interviewRate,
      offerRate,
      applicationsByStatus,
      applicationsByMethod,
      monthlyApplications,
      responseRate,
      interviewsScheduled: interviews.length,
    };
  } catch (error) {
    console.error('Error calculating application stats:', error);
    throw error;
  }
};

interface SalaryStats {
  averageSalaryMin: number;
  averageSalaryMax: number;
  highestSalary: number;
  lowestSalary: number;
  salaryByJobType: Record<string, { avg_min: number; avg_max: number }>;
}

// Get salary statistics
export const getSalaryStats = async (userId: string): Promise<SalaryStats> => {
  try {
    // Get all applications with salary information
    const applicationsRef = collection(db, 'applications');
    const q = query(
      applicationsRef,
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const applications = snapshot.docs
      .map(convertApplication)
      .filter(app => app.salary && app.salary.min !== undefined && app.salary.min > 0);
    
    if (applications.length === 0) {
      return {
        averageSalaryMin: 0,
        averageSalaryMax: 0,
        highestSalary: 0,
        lowestSalary: 0,
        salaryByJobType: {},
      };
    }
    
    // Calculate average min and max
    let totalMin = 0;
    let totalMax = 0;
    let highestSalary = 0;
    let lowestSalary = Number.MAX_VALUE;
    
    applications.forEach(app => {
      if (app.salary && app.salary.min !== undefined && app.salary.max !== undefined) {
        totalMin += app.salary.min;
        totalMax += app.salary.max;
        highestSalary = Math.max(highestSalary, app.salary.max);
        lowestSalary = Math.min(lowestSalary, app.salary.min);
      }
    });
    
    const averageSalaryMin = Math.round(totalMin / applications.length);
    const averageSalaryMax = Math.round(totalMax / applications.length);
    
    // Salary by job type
    const jobTypesMap: Record<string, { total_min: number; total_max: number; count: number }> = {};
    
    applications.forEach(app => {
      if (app.salary && app.jobType && app.salary.min !== undefined && app.salary.max !== undefined) {
        if (!jobTypesMap[app.jobType]) {
          jobTypesMap[app.jobType] = { total_min: 0, total_max: 0, count: 0 };
        }
        
        jobTypesMap[app.jobType].total_min += app.salary.min;
        jobTypesMap[app.jobType].total_max += app.salary.max;
        jobTypesMap[app.jobType].count += 1;
      }
    });
    
    const salaryByJobType: Record<string, { avg_min: number; avg_max: number }> = {};
    
    Object.entries(jobTypesMap).forEach(([jobType, data]) => {
      salaryByJobType[jobType] = {
        avg_min: Math.round(data.total_min / data.count),
        avg_max: Math.round(data.total_max / data.count),
      };
    });
    
    return {
      averageSalaryMin,
      averageSalaryMax,
      highestSalary,
      lowestSalary: lowestSalary === Number.MAX_VALUE ? 0 : lowestSalary,
      salaryByJobType,
    };
  } catch (error) {
    console.error('Error calculating salary stats:', error);
    throw error;
  }
};

interface TimelineStats {
  averageTimeToInterview: number; // days
  averageTimeToOffer: number; // days
  averageTimeToRejection: number; // days
}

// Get timeline statistics
export const getTimelineStats = async (userId: string): Promise<TimelineStats> => {
  try {
    // Get all applications
    const applicationsRef = collection(db, 'applications');
    const q = query(
      applicationsRef,
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const applications = snapshot.docs.map(convertApplication);
    
    // Get all interviews
    const interviewsRef = collection(db, 'interviews');
    const interviewsQ = query(
      interviewsRef,
      where('userId', '==', userId)
    );
    
    const interviewsSnapshot = await getDocs(interviewsQ);
    const interviews = interviewsSnapshot.docs.map(convertInterview);
    
    // Calculate time to first interview
    let totalDaysToInterview = 0;
    let applicationsWithInterviews = 0;
    
    // Map applications to their first interview
    const firstInterviewMap: Record<string, number> = {};
    
    interviews.forEach(interview => {
      if (!firstInterviewMap[interview.applicationId] || 
          new Date(interview.date).getTime() < firstInterviewMap[interview.applicationId]) {
        firstInterviewMap[interview.applicationId] = new Date(interview.date).getTime();
      }
    });
    
    // Calculate days to first interview
    applications.forEach(app => {
      if (firstInterviewMap[app.id]) {
        const daysToInterview = Math.round(
          (firstInterviewMap[app.id] - new Date(app.applicationDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysToInterview >= 0) { // Sanity check
          totalDaysToInterview += daysToInterview;
          applicationsWithInterviews++;
        }
      }
    });
    
    const averageTimeToInterview = applicationsWithInterviews > 0 
      ? Math.round(totalDaysToInterview / applicationsWithInterviews)
      : 0;
    
    // Calculate time to offer
    const offeredApplications = applications.filter(app => app.status === ApplicationStatus.OFFER);
    let totalDaysToOffer = 0;
    
    offeredApplications.forEach(app => {
      // This assumes the updatedAt reflects when the status changed to OFFER
      // In a real app, you'd want to track status change dates explicitly
      const daysToOffer = Math.round((new Date(app.updatedAt).getTime() - new Date(app.applicationDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysToOffer >= 0) {
        totalDaysToOffer += daysToOffer;
      }
    });
    
    const averageTimeToOffer = offeredApplications.length > 0 
      ? Math.round(totalDaysToOffer / offeredApplications.length)
      : 0;
    
    // Calculate time to rejection
    const rejectedApplications = applications.filter(app => app.status === ApplicationStatus.REJECTED);
    let totalDaysToRejection = 0;
    
    rejectedApplications.forEach(app => {
      // This assumes the updatedAt reflects when the status changed to REJECTED
      const daysToRejection = Math.round((new Date(app.updatedAt).getTime() - new Date(app.applicationDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysToRejection >= 0) {
        totalDaysToRejection += daysToRejection;
      }
    });
    
    const averageTimeToRejection = rejectedApplications.length > 0 
      ? Math.round(totalDaysToRejection / rejectedApplications.length)
      : 0;
    
    return {
      averageTimeToInterview,
      averageTimeToOffer,
      averageTimeToRejection,
    };
  } catch (error) {
    console.error('Error calculating timeline stats:', error);
    throw error;
  }
};

// Calculate application statistics from application array (client-side)
export const getApplicationStatistics = (applications: JobApplication[]): ApplicationStatistics => {
  if (!applications || applications.length === 0) {
    return {
      total: 0,
      applied: 0,
      screening: 0,
      interviewing: 0,
      offered: 0,
      rejected: 0,
      withdrawn: 0,
      responseRate: 0,
      interviewRate: 0,
      offerRate: 0
    };
  }

  const total = applications.length;
  
  // Count applications by status
  const countByStatus = applications.reduce((acc, app) => {
    const status = app.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Count applications that have received a response (not in applied status)
  const respondedApplications = applications.filter(app => app.status !== 'applied').length;
  
  // Count applications in interviewing or offered status
  const interviewingApplications = countByStatus['interviewing'] || 0;
  const offeredApplications = countByStatus['offered'] || 0;
  
  // Calculate rates
  const responseRate = total > 0 ? (respondedApplications / total) * 100 : 0;
  const interviewRate = total > 0 ? ((interviewingApplications + offeredApplications) / total) * 100 : 0;
  const offerRate = total > 0 ? (offeredApplications / total) * 100 : 0;
  
  return {
    total,
    applied: countByStatus['applied'] || 0,
    screening: countByStatus['screening'] || 0,
    interviewing: countByStatus['interviewing'] || 0,
    offered: countByStatus['offered'] || 0,
    rejected: countByStatus['rejected'] || 0,
    withdrawn: countByStatus['withdrawn'] || 0,
    responseRate,
    interviewRate,
    offerRate
  };
}; 