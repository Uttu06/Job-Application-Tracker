
export const APP_NAME = "Job Application Tracker";

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  APPLICATIONS: "/applications",
  APPLICATIONS_NEW: "/applications/new",
  APPLICATIONS_VIEW: "/applications/:id",
  APPLICATIONS_EDIT: "/applications/:id/edit",
  COMPANIES: "/companies",
  COMPANIES_VIEW: "/companies/:id",
  INTERVIEWS: "/interviews",
  INTERVIEWS_VIEW: "/interviews/:id",
  ANALYTICS: "/analytics",
  PROFILE: "/profile",
};

export const APPLICATION_STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export const JOB_TYPE_OPTIONS = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

export const APPLICATION_METHOD_OPTIONS = [
    { value: 'company-website', label: 'Company Website' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'indeed', label: 'Indeed' },
    { value: 'referral', label: 'Referral' },
    { value: 'other', label: 'Other' },
];
