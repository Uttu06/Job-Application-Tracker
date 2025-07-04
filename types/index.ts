// User types
export type User = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
  updatedAt: number;
  preferences?: {
    emailNotifications: boolean;
    theme: 'light' | 'dark' | 'system';
    defaultSalaryRange: { min: number; max: number };
  };
};

export type UserProfile = {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: UserSettings;
};

export type UserSettings = {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  defaultApplicationView: 'list' | 'board';
};

// Application types
export const ApplicationStatus = {
  APPLIED: 'applied',
  SCREENING: 'screening',
  INTERVIEWING: 'interviewing',
  OFFER: 'offered',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';

export type ApplicationMethod = 'company-website' | 'linkedin' | 'indeed' | 'referral' | 'other';

export type JobApplication = Application;

export type Application = {
  id: string;
  userId: string;
  companyName: string;
  companyId?: string;
  jobTitle: string;
  jobDescription?: string;
  jobUrl?: string;
  location: {
    city?: string;
    state?: string;
    country?: string;
    remote: boolean;
  };
  salary?: {
    min?: number;
    max?: number;
    currency: string;
  };
  benefits?: string[];
  status: ApplicationStatus;
  jobType: JobType;
  applicationDate: Date | string;
  notes?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  documents?: ApplicationDocument[];
  lastActivity?: {
    type: ActivityType;
    date: Date | string;
    notes?: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
  applicationMethod?: ApplicationMethod;
};

export type ApplicationDocument = {
  id: string;
  name: string;
  type: 'resume' | 'cover-letter' | 'portfolio' | 'reference' | 'other';
  url: string;
  uploadedAt: Date | string;
};

// Interview types
export type InterviewType = 'phone' | 'video' | 'onsite' | 'technical' | 'other';

export type Interview = {
  id: string;
  userId: string;
  applicationId: string;
  applicationTitle: string;
  companyName: string;
  date: Date | string;
  time: string;
  duration?: number;
  type: InterviewType;
  location?: string;
  interviewers?: string[];
  notes?: string;
  questions?: InterviewQuestion[];
  completed: boolean;
  outcome?: 'pending' | 'passed' | 'rejected' | 'no-show';
  followUp?: {
    date: Date | string;
    notes: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type InterviewQuestion = {
  id: string;
  question: string;
  notes?: string;
};

// Company types
export type Company = {
  id: string;
  userId: string;
  name: string;
  website?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  description?: string;
  logoUrl?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  culture?: string;
  benefits?: string[];
  notes?: string;
  contacts?: CompanyContact[];
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type CompanyContact = {
  id: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  notes?: string;
};

// Activity types
export type ActivityType = 
  | 'application-submitted' 
  | 'interview-scheduled' 
  | 'interview-completed' 
  | 'follow-up-sent' 
  | 'offer-received' 
  | 'rejection-received'
  | 'notes-updated'
  | 'status-changed'
  | 'document-added';

export type Activity = {
  id: string;
  userId: string;
  applicationId?: string;
  interviewId?: string;
  companyId?: string;
  type: ActivityType;
  date: Date | string;
  details?: string;
  createdAt: Date | string;
};

// Analytics types
export type ApplicationStatistics = {
  total: number;
  applied: number;
  screening: number;
  interviewing: number;
  offered: number;
  rejected: number;
  withdrawn: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
};

export type TimelineStatistics = {
  averageTimeToInterview: number;
  averageTimeToOffer: number;
  averageApplicationsPerWeek: number;
};

// Form types
export type ApplicationFormData = Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
export type InterviewFormData = Omit<Interview, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
export type CompanyFormData = Omit<Company, 'id' | 'userId' | 'createdAt' | 'updatedAt'>; 