import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Application as JobApplication } from '../../types';
import * as firestoreService from '../../src/services/firestoreCompat';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ROUTES, APPLICATION_STATUS_OPTIONS } from '../../constants';
import { formatDate } from '../../utils/helpers';
import Select from '../../components/Select';
import Input from '../../components/Input';

const ApplicationsListPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchApplications = useCallback(async () => {
    if (user) {
      setLoading(true);
      setError(null);
      try {
        const apps = await firestoreService.getApplications(user.uid);
        setApplications(apps.sort((a: any, b: any) => b.applicationDate - a.applicationDate)); // Sort by most recent
        setFilteredApplications(apps);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    let currentApps = [...applications];
    if (statusFilter) {
      currentApps = currentApps.filter(app => app.status === statusFilter);
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      currentApps = currentApps.filter(app => 
        app.companyName.toLowerCase().includes(lowerSearchTerm) ||
        app.jobTitle.toLowerCase().includes(lowerSearchTerm)
      );
    }
    setFilteredApplications(currentApps);
  }, [statusFilter, searchTerm, applications]);

  const handleDelete = async (applicationId: string) => {
    if (!user || !window.confirm("Are you sure you want to delete this application?")) return;
    try {
      setLoading(true);
      await firestoreService.deleteApplication(user.uid, applicationId);
      // Refresh list
      await fetchApplications(); 
    } catch (err) {
      console.error("Error deleting application:", err);
      setError("Failed to delete application.");
    } finally {
      setLoading(false);
    }
  };


  if (loading && applications.length === 0) { // Show full page loader only on initial load
    return <div className="p-6"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="p-6 text-danger">{error}</div>;
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-700';
      case 'screening': return 'bg-yellow-100 text-yellow-700';
      case 'interviewing': return 'bg-indigo-100 text-indigo-700';
      case 'offer': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'withdrawn': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };


  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Job Applications</h1>
        <Link to={ROUTES.APPLICATIONS_NEW}>
          <Button variant="primary">Add New Application</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <Input 
                label="Search by Company or Title"
                placeholder="E.g. Google or Software Engineer"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
                label="Filter by Status"
                options={[{value: '', label: 'All Statuses'}, ...APPLICATION_STATUS_OPTIONS]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            />
        </div>
      </Card>
      
      {loading && <div className="py-4"><LoadingSpinner size="sm"/></div>}

      {filteredApplications.length === 0 && !loading ? (
        <Card>
          <p className="text-gray-500 text-center py-8">
            No applications found matching your criteria. 
            {applications.length === 0 && <Link to={ROUTES.APPLICATIONS_NEW} className="text-primary hover:underline"> Add your first application!</Link>}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {filteredApplications.map(app => (
                        <tr key={app.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.companyName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{app.jobTitle}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{typeof app.applicationDate === 'number' ? formatDate(app.applicationDate) : String(app.applicationDate)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <Link to={ROUTES.APPLICATIONS_VIEW.replace(':id', app.id)} className="text-primary hover:text-blue-700">View</Link>
                                <Link to={ROUTES.APPLICATIONS_EDIT.replace(':id', app.id)} className="text-yellow-600 hover:text-yellow-800">Edit</Link>
                                <button onClick={() => handleDelete(app.id)} className="text-danger hover:text-red-700">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationsListPage;
