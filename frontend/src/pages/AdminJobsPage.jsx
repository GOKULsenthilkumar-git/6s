import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import axiosClient from '../api/axiosClient';
import JobForm from '../components/JobForm';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    inactiveJobs: 0,
    closedJobs: 0
  });

  useEffect(() => {
    fetchJobs();
    fetchJobStats();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axiosClient.get('/jobs');
      setJobs(response.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobStats = async () => {
    try {
      const response = await axiosClient.get('/jobs/stats/overview');
      setStats(response.data || {});
    } catch (error) {
      console.error('Error fetching job stats:', error);
    }
  };

  const fetchJobApplications = async (jobId) => {
    try {
      const response = await axiosClient.get(`/jobs/${jobId}/applications`);
      setJobApplications(response.data || []);
    } catch (error) {
      console.error('Error fetching job applications:', error);
      setJobApplications([]);
    }
  };

  const handleJobCreated = () => {
    setShowJobForm(false);
    setEditingJob(null);
    fetchJobs();
    fetchJobStats();
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      await axiosClient.delete(`/jobs/${jobId}`);
      fetchJobs();
      fetchJobStats();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert(error.response?.data?.message || 'Failed to delete job');
    }
  };

  const handleViewApplications = (job) => {
    setSelectedJob(job);
    fetchJobApplications(job._id);
  };

  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800 border-green-200',
      Inactive: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Closed: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatSalary = (salary) => {
    if (!salary || !salary.min || !salary.max) return 'Salary not specified';
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage job postings
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowJobForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Job
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">Total Jobs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalJobs || 0}</p>
              </div>
              <div className="flex-shrink-0">
                <BriefcaseIcon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">Active Jobs</p>
                <p className="text-2xl font-semibold text-green-600">{stats.activeJobs || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">Inactive Jobs</p>
                <p className="text-2xl font-semibold text-yellow-600">{stats.inactiveJobs || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">Closed Jobs</p>
                <p className="text-2xl font-semibold text-red-600">{stats.closedJobs || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No job postings</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first job posting.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowJobForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Job
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Jobs ({jobs.length})</h2>
          </div>
          
          <div className="overflow-hidden">
            <div className="grid gap-6 p-6">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {job.title}
                          </h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                              {formatSalary(job.salary)}
                            </div>
                            <span className="text-gray-400">•</span>
                            <span>{job.roleType}</span>
                          </div>
                          
                          <p className="mt-3 text-gray-700 line-clamp-2">
                            {job.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Updated: {new Date(job.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                      
                      <button
                        onClick={() => handleViewApplications(job)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="View applications"
                      >
                        <UsersIcon className="h-4 w-4 mr-1" />
                        Applications
                      </button>
                      
                      <button
                        onClick={() => handleEditJob(job)}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Edit job"
                      >
                        <PencilSquareIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        title="Delete job"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Job Form Modal */}
      {showJobForm && (
        <JobForm
          editingJob={editingJob}
          onJobCreated={handleJobCreated}
          onCancel={() => {
            setShowJobForm(false);
            setEditingJob(null);
          }}
        />
      )}

      {/* Job Applications Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Applications for {selectedJob.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{jobApplications.length} applications</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <EyeIcon className="h-6 w-6" />
              </button>
            </div>

            {jobApplications.length === 0 ? (
              <div className="text-center py-8">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                <p className="mt-1 text-sm text-gray-500">No one has applied for this job yet.</p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applicant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {jobApplications.map((application) => (
                      <tr key={application._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {application.applicantId?.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}