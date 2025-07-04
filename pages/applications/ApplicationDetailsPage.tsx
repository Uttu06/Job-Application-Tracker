import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Application as JobApplication, Interview } from '../../types';
import * as firestoreService from '../../src/services/firestoreCompat';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils/helpers';

const ApplicationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [interviews] = useState<Interview[]>([]); // Mock interviews for now
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && id) {
      const fetchApplicationDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const appData = await firestoreService.getApplication(user.uid, id);
          if (appData) {
            setApplication(appData);
            // Mock: fetch interviews related to this applicationId
            // const interviewData = await firestoreService.getInterviewsForApplication(id);
            // setInterviews(interviewData);
          } else {
            setError("Application not found.");
          }
        } catch (err) {
          console.error("Error fetching application details:", err);
          setError("Failed to load application details.");
        } finally {
          setLoading(false);
        }
      };
      fetchApplicationDetails();
    }
  }, [user, id]);

  if (loading) {
    return <div className="p-6"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="p-6 text-danger">{error}</div>;
  }

  if (!application) {
    return <div className="p-6 text-center">Application not found.</div>;
  }

  const DetailItem: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    value ? <div className="py-2"><dt className="text-sm font-medium text-gray-500">{label}</dt><dd className="mt-1 text-sm text-gray-900">{value}</dd></div> : null
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{application.jobTitle} at {application.companyName}</h1>
        <Link to={ROUTES.APPLICATIONS_EDIT.replace(':id', application.id)}>
          <Button variant="secondary">Edit Application</Button>
        </Link>
      </div>

      <Card>
        <dl className="divide-y divide-gray-200">
          <DetailItem label="Company" value={application.companyName} />
          <DetailItem label="Job Title" value={application.jobTitle} />
          <DetailItem label="Status" value={<span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-${String(application.status) === 'offer' ? 'green' : 'blue'}-100 text-${String(application.status) === 'offer' ? 'green' : 'blue'}-800`}>{application.status}</span>} />
          <DetailItem label="Application Date" value={typeof application.applicationDate === 'number' ? formatDate(application.applicationDate) : String(application.applicationDate)} />
          {application.jobUrl && <DetailItem label="Job URL" value={<a href={application.jobUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{application.jobUrl}</a>} />}
          {application.jobDescription && <DetailItem label="Job Description" value={<p className="whitespace-pre-wrap">{application.jobDescription}</p>} />}
          {application.salary && (
            <DetailItem label="Salary Range" value={`${application.salary.min} - ${application.salary.max} ${application.salary.currency}`} />
          )}
          {application.location && (
            <DetailItem label="Location" value={`${application.location.city}, ${application.location.state}, ${application.location.country} ${application.location.remote ? '(Remote)' : ''}`} />
          )}
          <DetailItem label="Job Type" value={application.jobType} />
          <DetailItem label="Application Method" value={application.applicationMethod} />
          {application.notes && <DetailItem label="Notes" value={<p className="whitespace-pre-wrap">{application.notes}</p>} />}
           {application.documents && application.documents.length > 0 && (
            <DetailItem label="Documents" value={
              <ul>{application.documents.map(doc => <li key={doc.name}>{doc.name} ({doc.type}) - <span className="text-gray-500">(Download not implemented)</span></li>)}</ul>
            } />
          )}
        </dl>
      </Card>
      
      {/* Placeholder for Interviews Section */}
      <Card title="Interviews">
        {interviews.length > 0 ? (
          <p>Interview list here...</p>
        ) : (
          <p className="text-gray-500">No interviews scheduled for this application yet.</p>
        )}
        {/* <Button variant="primary" size="sm" className="mt-2">Schedule New Interview</Button> */}
      </Card>

      {/* Placeholder for Timeline */}
      <Card title="Activity Timeline">
        <p className="text-gray-500">Timeline of activities will be shown here (e.g., status changes, notes added).</p>
      </Card>

      <div className="mt-8 text-center">
        <Link to={ROUTES.APPLICATIONS}>
            <Button variant="primary">&larr; Back to All Applications</Button>
        </Link>
      </div>
    </div>
  );
};

export default ApplicationDetailsPage;
