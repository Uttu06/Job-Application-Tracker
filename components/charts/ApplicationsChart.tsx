import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { ApplicationStatistics, Application } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ApplicationsChartProps {
  statistics: ApplicationStatistics;
  applications: Application[];
  type: 'bar' | 'pie' | 'line';
  title?: string;
}

export const ApplicationsChart: React.FC<ApplicationsChartProps> = ({
  statistics,
  applications,
  type,
  title = 'Application Statistics'
}) => {
  const statusColors = {
    applied: '#3B82F6',
    screening: '#F59E0B',
    interviewing: '#8B5CF6',
    offered: '#10B981',
    rejected: '#EF4444',
    withdrawn: '#6B7280',
  };

  const statusData = {
    labels: ['Applied', 'Screening', 'Interviewing', 'Offered', 'Rejected', 'Withdrawn'],
    datasets: [
      {
        label: 'Applications',
        data: [
          statistics.applied,
          statistics.screening,
          statistics.interviewing,
          statistics.offered,
          statistics.rejected,
          statistics.withdrawn,
        ],
        backgroundColor: Object.values(statusColors),
        borderColor: Object.values(statusColors),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  // Generate timeline data for line chart
  const getTimelineData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const applicationsByDate = last30Days.map(date => {
      return applications.filter(app => {
        const appDate = new Date(app.applicationDate).toISOString().split('T')[0];
        return appDate === date;
      }).length;
    });

    return {
      labels: last30Days.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Applications Submitted',
          data: applicationsByDate,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        },
      ],
    };
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={statusData} options={chartOptions} />;
      case 'pie':
        return <Pie data={statusData} options={pieOptions} />;
      case 'line':
        return <Line data={getTimelineData()} options={chartOptions} />;
      default:
        return <Bar data={statusData} options={chartOptions} />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      {renderChart()}
    </div>
  );
};

export default ApplicationsChart;

