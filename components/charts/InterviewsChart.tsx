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
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Interview } from '../../types';

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

interface InterviewsChartProps {
  interviews: Interview[];
  type: 'bar' | 'doughnut' | 'line';
  title?: string;
}

export const InterviewsChart: React.FC<InterviewsChartProps> = ({
  interviews,
  type,
  title = 'Interview Statistics'
}) => {
  const typeColors = {
    phone: '#3B82F6',
    video: '#10B981',
    onsite: '#F59E0B',
    technical: '#8B5CF6',
    other: '#6B7280',
  };

  const outcomeColors = {
    pending: '#F59E0B',
    passed: '#10B981',
    rejected: '#EF4444',
    'no-show': '#6B7280',
  };

  // Interview types data
  const typeStats = interviews.reduce((acc, interview) => {
    acc[interview.type] = (acc[interview.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = {
    labels: Object.keys(typeStats).map(type => type.charAt(0).toUpperCase() + type.slice(1)),
    datasets: [
      {
        label: 'Interview Types',
        data: Object.values(typeStats),
        backgroundColor: Object.keys(typeStats).map(type => typeColors[type as keyof typeof typeColors]),
        borderColor: Object.keys(typeStats).map(type => typeColors[type as keyof typeof typeColors]),
        borderWidth: 1,
      },
    ],
  };

  // Interview outcomes data
  const outcomeStats = interviews.reduce((acc, interview) => {
    const outcome = interview.outcome || 'pending';
    acc[outcome] = (acc[outcome] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const outcomeData = {
    labels: Object.keys(outcomeStats).map(outcome => 
      outcome.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    ),
    datasets: [
      {
        label: 'Interview Outcomes',
        data: Object.values(outcomeStats),
        backgroundColor: Object.keys(outcomeStats).map(outcome => outcomeColors[outcome as keyof typeof outcomeColors]),
        borderColor: Object.keys(outcomeStats).map(outcome => outcomeColors[outcome as keyof typeof outcomeColors]),
        borderWidth: 2,
      },
    ],
  };

  // Timeline data for interviews
  const getInterviewTimelineData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const interviewsByDate = last30Days.map(date => {
      return interviews.filter(interview => {
        const interviewDate = new Date(interview.date).toISOString().split('T')[0];
        return interviewDate === date;
      }).length;
    });

    return {
      labels: last30Days.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Interviews Scheduled',
          data: interviewsByDate,
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.1,
        },
      ],
    };
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

  const doughnutOptions = {
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

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={typeData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={outcomeData} options={doughnutOptions} />;
      case 'line':
        return <Line data={getInterviewTimelineData()} options={chartOptions} />;
      default:
        return <Bar data={typeData} options={chartOptions} />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      {renderChart()}
    </div>
  );
};

export default InterviewsChart;

