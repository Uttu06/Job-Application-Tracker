import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ApplicationFormData } from '../../types';
import * as firestoreService from '../../src/services/firestoreCompat';
import { ROUTES, APPLICATION_STATUS_OPTIONS, JOB_TYPE_OPTIONS, APPLICATION_METHOD_OPTIONS } from '../../constants';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import Card from '../../components/Card';
import { formatTimestampForInput } from '../../utils/helpers';

const initialFormData: ApplicationFormData = {
  companyName: '',
  jobTitle: '',
  jobDescription: '',
  applicationDate: formatTimestampForInput(Date.now()),
  status: 'applied',
  jobUrl: '',
  salary: { min: 0, max: 0, currency: 'USD' },
  location: { city: '', state: '', country: '', remote: false },
  jobType: 'full-time',
  applicationMethod: 'company-website',
  notes: '',
  documents: [],
};

const AddApplicationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith("salary.")) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        salary: { ...prev.salary!, [field]: type === 'number' ? parseFloat(value) : value }
      }));
    } else if (name.startsWith("location.")) {
      const field = name.split('.')[1];
      const isRemoteCheckbox = name === "location.remote" && type === "checkbox";
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location!, [field]: isRemoteCheckbox ? (e.target as HTMLInputElement).checked : value }
      }));
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("User not authenticated.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await firestoreService.addApplication(user.uid, { 
        ...formData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      navigate(ROUTES.APPLICATIONS);
    } catch (err) {
      console.error("Error adding application:", err);
      setError("Failed to add application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card title="Add New Job Application">
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

          {/* Document upload placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Documents (Resume, Cover Letter)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                            <span>Upload files</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple disabled />
                        </label>
                        <p className="pl-1">(File upload not implemented in mock)</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
            </div>
          </div>


          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.APPLICATIONS)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Save Application
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddApplicationPage;
