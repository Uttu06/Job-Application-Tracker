import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ApplicationFormData } from '../../types';
import * as firestoreService from '../../src/services/firestoreCompat';
import { ROUTES, APPLICATION_STATUS_OPTIONS, JOB_TYPE_OPTIONS, APPLICATION_METHOD_OPTIONS } from '../../constants';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatTimestampForInput } from '../../utils/helpers';

const EditApplicationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ApplicationFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    if (user && id) {
      setLoading(true);
      setError(null);
      try {
        const appData = await firestoreService.getApplication(user.uid, id);
        if (appData) {
          // Destructure to exclude fields not in ApplicationFormData or to reformat them
          // The destructured 'createdAt', 'updatedAt', 'userId', 'id' are intentionally not used in 'rest'
          // as ApplicationFormData omits them.
          const { createdAt, updatedAt, userId, id: applicationId, applicationDate, ...rest } = appData; 
          setFormData({
            ...rest,
            applicationDate: formatTimestampForInput(typeof applicationDate === 'string' ? new Date(applicationDate).getTime() : new Date(applicationDate).getTime()),
          });
        } else {
          setError("Application not found.");
        }
      } catch (err) {
        console.error("Error fetching application:", err);
        setError("Failed to load application data.");
      } finally {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (!formData) return;

    if (name.startsWith("salary.")) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev!,
        salary: { ...prev!.salary!, [field]: type === 'number' ? parseFloat(value) : value }
      }));
    } else if (name.startsWith("location.")) {
      const field = name.split('.')[1];
      const isRemoteCheckbox = name === "location.remote" && type === "checkbox";
      setFormData(prev => ({
        ...prev!,
        location: { ...prev!.location!, [field]: isRemoteCheckbox ? (e.target as HTMLInputElement).checked : value }
      }));
    } else {
       setFormData(prev => ({ ...prev!, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !formData) {
      setError("User not authenticated or form data missing.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await firestoreService.updateApplication(user.uid, id, formData);
      navigate(ROUTES.APPLICATIONS_VIEW.replace(':id', id));
    } catch (err) {
      console.error("Error updating application:", err);
      setError("Failed to update application. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6"><LoadingSpinner /></div>;
  }

  if (error && !formData) { // Show error only if form data couldn't be loaded
    return <div className="p-6 text-danger">{error}</div>;
  }
  
  if (!formData) {
    return <div className="p-6 text-center">Application data could not be loaded.</div>;
  }


  return (
    <div className="container mx-auto p-6">
      <Card title={`Edit Application: ${formData.jobTitle} at ${formData.companyName}`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-danger bg-red-100 p-3 rounded-md">{error}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} required />
            <Input label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required />
          </div>

          <Textarea label="Job Description" name="jobDescription" value={formData.jobDescription} onChange={handleChange} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input type="date" label="Application Date" name="applicationDate" value={typeof formData.applicationDate === 'string' ? formData.applicationDate : formatTimestampForInput(Number(formData.applicationDate))} onChange={handleChange} required />
            <Select label="Status" name="status" value={formData.status} onChange={handleChange} options={APPLICATION_STATUS_OPTIONS} required />
          </div>

          <Input label="Job URL (Link to posting)" name="jobUrl" type="url" value={formData.jobUrl || ''} onChange={handleChange} />
          
           <fieldset className="border p-4 rounded-md">
            <legend className="text-sm font-medium px-1">Salary (Optional)</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <Input label="Min Salary" name="salary.min" type="number" value={formData.salary?.min || ''} onChange={handleChange} />
                <Input label="Max Salary" name="salary.max" type="number" value={formData.salary?.max || ''} onChange={handleChange} />
                <Input label="Currency" name="salary.currency" value={formData.salary?.currency || 'USD'} onChange={handleChange} />
            </div>
          </fieldset>
          
          <fieldset className="border p-4 rounded-md">
            <legend className="text-sm font-medium px-1">Location (Optional)</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <Input label="City" name="location.city" value={formData.location?.city || ''} onChange={handleChange} />
                <Input label="State/Province" name="location.state" value={formData.location?.state || ''} onChange={handleChange} />
                <Input label="Country" name="location.country" value={formData.location?.country || ''} onChange={handleChange} />
            </div>
            <div className="mt-4">
                <label className="flex items-center space-x-2">
                    <input type="checkbox" name="location.remote" checked={formData.location?.remote || false} onChange={handleChange} className="rounded text-primary focus:ring-primary"/>
                    <span>Is this a remote position?</span>
                </label>
            </div>
          </fieldset>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select label="Job Type" name="jobType" value={formData.jobType || ''} onChange={handleChange} options={JOB_TYPE_OPTIONS} />
            <Select label="Application Method" name="applicationMethod" value={formData.applicationMethod || ''} onChange={handleChange} options={APPLICATION_METHOD_OPTIONS} />
          </div>

          <Textarea label="Notes" name="notes" value={formData.notes || ''} onChange={handleChange} />

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.APPLICATIONS_VIEW.replace(':id', id!))}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditApplicationPage;
