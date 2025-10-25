import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentPlusIcon,
  BriefcaseIcon,
  ComputerDesktopIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import axiosClient from '../api/axiosClient';

export default function ApplicationForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    jobId: '',
    roleType: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchActiveJobs();
  }, []);

  const fetchActiveJobs = async () => {
    try {
      const response = await axiosClient.get('/jobs/active');
      setJobs(response.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSelection = (jobId) => {
    const job = jobs.find(j => j._id === jobId);
    setSelectedJob(job);
    setFormData(prev => ({
      ...prev,
      jobId,
      roleType: job ? job.roleType : ''
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.jobId) {
      setError('Please select a job to apply for');
      return;
    }
    
    setError('');
    setSubmitting(true);
    
    try {
      await axiosClient.post('/applications', formData);
      navigate('/dashboard/applicant');
    } catch (error) {
      console.error('Error creating application:', error);
      setError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (salary) => {
    if (!salary || !salary.min || !salary.max) return 'Salary not specified';
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  const roleOptions = [
    {
      value: 'Technical',
      label: 'Technical Role',
      description: 'Software development, engineering, IT positions',
      icon: ComputerDesktopIcon,
      color: 'border-blue-200 hover:border-blue-300'
    },
    {
      value: 'Non-Technical',
      label: 'Non-Technical Role',
      description: 'Business, marketing, HR, administrative positions',
      icon: UserGroupIcon,
      color: 'border-purple-200 hover:border-purple-300'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-xl rounded-xl border border-gray-100">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-6 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <DocumentPlusIcon className="h-6 w-6 text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">Submit New Application</h1>
              <p className="text-blue-100">Apply for your desired position</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading available positions...</span>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-4">
                  Select a Job Position
                </label>
                <p className="text-sm text-gray-600 mb-6">
                  Choose from the available job positions to submit your application
                </p>
                
                {jobs.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No positions available</h3>
                    <p className="mt-1 text-sm text-gray-500">There are no active job positions at the moment.</p>
                    <p className="text-sm text-gray-400 mt-1">Please check back later for new opportunities.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {jobs.map((job) => (
                      <div key={job._id}>
                        <label className="relative flex cursor-pointer">
                          <input
                            type="radio"
                            name="jobId"
                            value={job._id}
                            checked={formData.jobId === job._id}
                            onChange={() => handleJobSelection(job._id)}
                            className="sr-only"
                          />
                          <div className={`flex-1 p-6 rounded-xl border-2 transition-all duration-200 ${
                            formData.jobId === job._id 
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20' 
                              : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-2 rounded-lg ${
                                    formData.jobId === job._id 
                                      ? 'bg-blue-100' 
                                      : 'bg-gray-100'
                                  }`}>
                                    {job.roleType === 'Technical' ? (
                                      <ComputerDesktopIcon className={`h-6 w-6 ${
                                        formData.jobId === job._id 
                                          ? 'text-blue-600' 
                                          : 'text-gray-500'
                                      }`} />
                                    ) : (
                                      <UserGroupIcon className={`h-6 w-6 ${
                                        formData.jobId === job._id 
                                          ? 'text-blue-600' 
                                          : 'text-gray-500'
                                      }`} />
                                    )}
                                  </div>
                                  <div>
                                    <h3 className={`text-xl font-semibold ${
                                      formData.jobId === job._id 
                                        ? 'text-blue-900' 
                                        : 'text-gray-900'
                                    }`}>
                                      {job.title}
                                    </h3>
                                    <div className={`flex items-center space-x-4 text-sm mt-1 ${
                                      formData.jobId === job._id 
                                        ? 'text-blue-700' 
                                        : 'text-gray-600'
                                    }`}>
                                      <span className="flex items-center">
                                        <MapPinIcon className="h-4 w-4 mr-1" />
                                        {job.location}
                                      </span>
                                      <span className="flex items-center">
                                        <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                        {formatSalary(job.salary)}
                                      </span>
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        job.roleType === 'Technical' 
                                          ? 'bg-blue-100 text-blue-800' 
                                          : 'bg-purple-100 text-purple-800'
                                      }`}>
                                        {job.roleType}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <p className={`text-sm mt-3 ${
                                  formData.jobId === job._id 
                                    ? 'text-blue-700' 
                                    : 'text-gray-600'
                                }`}>
                                  {job.description}
                                </p>
                                
                                {formData.jobId === job._id && (
                                  <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                                    <h5 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h5>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                      {job.requirements}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {formData.jobId === job._id && (
                                <div className="shrink-0 ml-4">
                                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Job Summary */}
              {selectedJob && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">Application Summary</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-800">Position:</span>
                      <span className="text-blue-700 ml-2">{selectedJob.title}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Type:</span>
                      <span className="text-blue-700 ml-2">{selectedJob.roleType}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Location:</span>
                      <span className="text-blue-700 ml-2">{selectedJob.location}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Salary:</span>
                      <span className="text-blue-700 ml-2">{formatSalary(selectedJob.salary)}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="font-medium text-blue-800">Applicant:</span>
                    <span className="text-blue-700 ml-2">{user?.email}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Additional Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <BriefcaseIcon className="h-6 w-6 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900">Application Process</h4>
                <p className="text-sm text-blue-700 mt-1">
                  After submitting your application, our HR team will review it within 3-5 business days. 
                  You'll receive updates on your application status through your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard/applicant')}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.jobId}
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <DocumentPlusIcon className="h-5 w-5 mr-2" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}