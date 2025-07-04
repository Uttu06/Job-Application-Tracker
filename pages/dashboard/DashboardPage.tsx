import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  ChevronRight,
  Building2,
  Bell,
  TrendingUp,
  Target,
  Award
} from 'lucide-react';
import { format } from 'date-fns';

import { useApplications } from '../../hooks/useApplications';
import { useInterviews } from '../../hooks/useInterviews';
import { getApplicationStatistics } from '../../services/analyticsService';
import { JobApplication, Interview, ApplicationStatus } from '../../types';
import Card from '../../components/Card';
import AnalyticsDashboard from '../../components/charts/AnalyticsDashboard';
import ReminderManager from '../../components/ReminderManager';
import { reminderService } from '../../services/reminderService';
import { useAuth } from '../../contexts/AuthContext';

const StatusCard = ({ 
  title, 
  count, 
  icon, 
  color 
}: { 
  title: string; 
  count: number; 
  icon: React.ReactNode; 
  color: string;
}) => {
  return (
    <Card className={`${color} flex items-center p-5 shadow-md`}>
      <div className="mr-4 rounded-full bg-white/20 p-3">
        {icon}
      </div>
      <div>
        <p className="text-sm text-white/80">{title}</p>
        <h3 className="text-2xl font-bold text-white">{count}</h3>
  </div>
    </Card>
  );
};

const ApplicationStatusBadge = ({ status }: { status: ApplicationStatus }) => {
  let bgColor = '';
  let textColor = '';
  
  switch (status) {
    case 'applied':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'interviewing':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'offered':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'rejected':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { applications, loading: applicationsLoading } = useApplications();
  const { interviews, loading: interviewsLoading } = useInterviews();
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interviewing: 0,
    offered: 0,
    rejected: 0,
  });
  const [recentApplications, setRecentApplications] = useState<JobApplication[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [upcomingReminders, setUpcomingReminders] = useState<any[]>([]);

  useEffect(() => {
    if (applications) {
      // Get statistics
      const statistics = getApplicationStatistics(applications);
      setStats(statistics);
      
      // Get recent applications (last 5)
      const recent = [...applications]
        .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())
        .slice(0, 5);
      setRecentApplications(recent);
    }
  }, [applications]);

  useEffect(() => {
    if (interviews) {
      // Get upcoming interviews (next 5)
      const upcoming = [...interviews]
        .filter(interview => new Date(interview.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
      setUpcomingInterviews(upcoming);
    }
  }, [interviews]);

  useEffect(() => {
    if (user) {
      // Load reminders and get upcoming ones
      reminderService.loadReminders().then(() => {
        const upcoming = reminderService.getUpcomingReminders(user.uid, 7);
        setUpcomingReminders(upcoming);
      });
    }
  }, [user]);

  const isLoading = applicationsLoading || interviewsLoading;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-gray-500">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track your job applications and upcoming interviews
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowReminders(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Bell className="w-4 h-4" />
            <span>Reminders</span>
            {upcomingReminders.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {upcomingReminders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatusCard 
          title="Total Applications" 
          count={stats.total} 
          icon={<Target className="h-6 w-6 text-white" />} 
          color="bg-blue-600"
        />
        <StatusCard 
          title="Active Interviews" 
          count={stats.interviewing} 
          icon={<Calendar className="h-6 w-6 text-white" />} 
          color="bg-yellow-500"
        />
        <StatusCard 
          title="Offers Received" 
          count={stats.offered} 
          icon={<Award className="h-6 w-6 text-white" />} 
          color="bg-green-600"
        />
        <StatusCard 
          title="Response Rate" 
          count={stats.total ? Math.round(((stats.interviewing + stats.offered) / stats.total) * 100) : 0} 
          icon={<TrendingUp className="h-6 w-6 text-white" />} 
          color="bg-purple-600"
        />
        <StatusCard 
          title="Pending Reminders" 
          count={upcomingReminders.length} 
          icon={<Bell className="h-6 w-6 text-white" />} 
          color="bg-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
            <h2 className="font-semibold text-gray-800 dark:text-white">Recent Applications</h2>
            <Link 
              to="/applications" 
              className="flex items-center text-sm text-blue-500 hover:text-blue-700"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
        </div>
          <div className="divide-y dark:divide-gray-700">
                {recentApplications.length > 0 ? (
              recentApplications.map(app => (
                <Link 
                  to={`/applications/${app.id}`} 
                  key={app.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                        <div>
                      <p className="font-medium text-gray-800 dark:text-white">{app.jobTitle}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{app.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ApplicationStatusBadge status={app.status} />
                    <p className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(app.applicationDate), 'MMM dd')}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No recent applications. Start adding some!
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Interviews */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
            <h2 className="font-semibold text-gray-800 dark:text-white">Upcoming Interviews</h2>
            <Link 
              to="/interviews" 
              className="flex items-center text-sm text-blue-500 hover:text-blue-700"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y dark:divide-gray-700">
            {upcomingInterviews.length > 0 ? (
              upcomingInterviews.map(interview => (
                <div key={interview.id} className="p-4 border-b dark:border-gray-700">
                  <p className="font-medium text-gray-800 dark:text-white">
                    Interview on {format(new Date(interview.date), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {interview.companyName} - {interview.applicationTitle}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500 dark:text-gray-400">No upcoming interviews</div>
            )}
          </div>
        </Card>
      </div>

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Analytics Dashboard
              </h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {applications && interviews && user && (
                <AnalyticsDashboard
                  applications={applications}
                  interviews={interviews}
                  userId={user.uid}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reminders Modal */}
      {showReminders && (
        <ReminderManager onClose={() => setShowReminders(false)} />
      )}
    </div>
  );
};

export default DashboardPage;
