import React, { useState, useEffect } from 'react';
import { ApplicationsChart } from './ApplicationsChart';
import { InterviewsChart } from './InterviewsChart';
import { Application, Interview, ApplicationStatistics, TimelineStatistics } from '../../types';
import { TrendingUp, Calendar, Target, Clock, Award } from 'lucide-react';

interface AnalyticsDashboardProps {
  applications: Application[];
  interviews: Interview[];
  userId: string;
}

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  applications,
  interviews
}) => {
  const [statistics, setStatistics] = useState<ApplicationStatistics | null>(null);
  const [timelineStats, setTimelineStats] = useState<TimelineStatistics | null>(null);

  useEffect(() => {
    calculateStatistics();
    calculateTimelineStatistics();
  }, [applications, interviews]);

  const calculateStatistics = () => {
    const stats: ApplicationStatistics = {
      total: applications.length,
      applied: applications.filter(app => app.status === 'applied').length,
      screening: applications.filter(app => app.status === 'screening').length,
      interviewing: applications.filter(app => app.status === 'interviewing').length,
      offered: applications.filter(app => app.status === 'offered').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      withdrawn: applications.filter(app => app.status === 'withdrawn').length,
      responseRate: 0,
      interviewRate: 0,
      offerRate: 0,
    };

    // Calculate rates
    if (stats.total > 0) {
      const responded = stats.screening + stats.interviewing + stats.offered + stats.rejected;
      stats.responseRate = (responded / stats.total) * 100;
      stats.interviewRate = (stats.interviewing / stats.total) * 100;
      stats.offerRate = (stats.offered / stats.total) * 100;
    }

    setStatistics(stats);
  };

  const calculateTimelineStatistics = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Calculate average time to interview
    const interviewingApps = applications.filter(app => app.status === 'interviewing' || app.status === 'offered');
    let totalTimeToInterview = 0;
    let interviewCount = 0;

    interviewingApps.forEach(app => {
      const relatedInterviews = interviews.filter(interview => interview.applicationId === app.id);
      if (relatedInterviews.length > 0) {
        const firstInterview = relatedInterviews.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )[0];
        const appDate = new Date(app.applicationDate);
        const interviewDate = new Date(firstInterview.date);
        const timeDiff = interviewDate.getTime() - appDate.getTime();
        totalTimeToInterview += timeDiff / (1000 * 60 * 60 * 24); // Convert to days
        interviewCount++;
      }
    });

    // Calculate average time to offer
    const offeredApps = applications.filter(app => app.status === 'offered');
    let totalTimeToOffer = 0;
    let offerCount = 0;

    offeredApps.forEach(app => {
      const appDate = new Date(app.applicationDate);
      // Assuming offer date is when status was last updated (simplified)
      const offerDate = new Date(app.updatedAt);
      const timeDiff = offerDate.getTime() - appDate.getTime();
      totalTimeToOffer += timeDiff / (1000 * 60 * 60 * 24);
      offerCount++;
    });

    // Calculate applications per week
    const recentApps = applications.filter(app => 
      new Date(app.applicationDate) >= thirtyDaysAgo
    );
    const applicationsPerWeek = (recentApps.length / 4.3); // 30 days ≈ 4.3 weeks

    const stats: TimelineStatistics = {
      averageTimeToInterview: interviewCount > 0 ? totalTimeToInterview / interviewCount : 0,
      averageTimeToOffer: offerCount > 0 ? totalTimeToOffer / offerCount : 0,
      averageApplicationsPerWeek: applicationsPerWeek,
    };

    setTimelineStats(stats);
  };

  const getMetricCards = (): MetricCard[] => {
    if (!statistics || !timelineStats) return [];

    return [
      {
        title: 'Total Applications',
        value: statistics.total,
        icon: <Target className="w-6 h-6" />,
        color: 'bg-blue-500',
      },
      {
        title: 'Response Rate',
        value: `${statistics.responseRate.toFixed(1)}%`,
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'bg-green-500',
      },
      {
        title: 'Interview Rate',
        value: `${statistics.interviewRate.toFixed(1)}%`,
        icon: <Calendar className="w-6 h-6" />,
        color: 'bg-purple-500',
      },
      {
        title: 'Offer Rate',
        value: `${statistics.offerRate.toFixed(1)}%`,
        icon: <Award className="w-6 h-6" />,
        color: 'bg-yellow-500',
      },
      {
        title: 'Avg. Time to Interview',
        value: `${timelineStats.averageTimeToInterview.toFixed(0)} days`,
        icon: <Clock className="w-6 h-6" />,
        color: 'bg-indigo-500',
      },
      {
        title: 'Applications/Week',
        value: timelineStats.averageApplicationsPerWeek.toFixed(1),
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'bg-teal-500',
      },
    ];
  };

  const getInsights = () => {
    if (!statistics) return [];

    const insights = [];

    if (statistics.responseRate < 20) {
      insights.push({
        type: 'warning',
        message: 'Your response rate is below 20%. Consider improving your resume or targeting more relevant positions.',
      });
    }

    if (statistics.interviewRate > 15) {
      insights.push({
        type: 'success',
        message: 'Great job! Your interview rate is above average. Keep up the good work!',
      });
    }

    if (timelineStats && timelineStats.averageApplicationsPerWeek < 5) {
      insights.push({
        type: 'info',
        message: 'Consider increasing your application frequency. Aim for 5-10 applications per week.',
      });
    }

    if (statistics.offered > 0) {
      insights.push({
        type: 'success',
        message: `Congratulations! You have ${statistics.offered} job offer${statistics.offered > 1 ? 's' : ''}!`,
      });
    }

    return insights;
  };

  if (!statistics || !timelineStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getMetricCards().map((metric, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </p>
              </div>
              <div className={`${metric.color} p-3 rounded-full text-white`}>
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      {getInsights().length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Insights & Recommendations
          </h3>
          <div className="space-y-3">
            {getInsights().map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  insight.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : insight.type === 'warning'
                    ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                    : 'bg-blue-50 border border-blue-200 text-blue-800'
                }`}
              >
                {insight.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApplicationsChart
          statistics={statistics}
          applications={applications}
          type="pie"
          title="Application Status Distribution"
        />
        <InterviewsChart
          interviews={interviews}
          type="doughnut"
          title="Interview Outcomes"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApplicationsChart
          statistics={statistics}
          applications={applications}
          type="line"
          title="Application Timeline (Last 30 Days)"
        />
        <InterviewsChart
          interviews={interviews}
          type="bar"
          title="Interview Types"
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

