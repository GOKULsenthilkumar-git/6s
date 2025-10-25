import { useState, useEffect } from 'react';
import {
  BriefcaseIcon,
  UsersIcon,
  DocumentTextIcon,
  CogIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import axiosClient from '../api/axiosClient';
import ChartCard from '../components/ChartCard';
import JobForm from '../components/JobForm';
import AdminJobsPage from './AdminJobsPage';
import AdminApplications from './AdminApplications';
import AdminBotActivities from './AdminBotActivities';
import AdminStats from './AdminStats';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showJobForm, setShowJobForm] = useState(false);
  const [stats, setStats] = useState({});
  const [jobStats, setJobStats] = useState({});
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const [applicationsRes, jobsRes, applicationStatsRes, jobStatsRes] = await Promise.all([
        axiosClient.get('/applications'),
        axiosClient.get('/jobs'),
        axiosClient.get('/applications/stats'),
        axiosClient.get('/jobs/stats/overview')
      ]);
      
      setRecentApplications(applicationsRes.data.slice(0, 5));
      setRecentJobs(jobsRes.data.slice(0, 3));
      setStats(applicationStatsRes.data);
      setJobStats(jobStatsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleJobCreated = () => {
    setShowJobForm(false);
    fetchDashboardData();
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'jobs', name: 'Job Management', icon: BriefcaseIcon },
    { id: 'applications', name: 'Applications', icon: DocumentTextIcon },
    { id: 'bot-activities', name: 'Bot Activities', icon: CogIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage job postings, applications, and bot activities
              </p>
            </div>
            <button
              onClick={() => setShowJobForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Job
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 truncate">Total Jobs</p>
                      <p className="text-2xl font-semibold text-gray-900">{jobStats.totalJobs || 0}</p>
                    </div>
                    <BriefcaseIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 truncate">Active Jobs</p>
                      <p className="text-2xl font-semibold text-green-600">{jobStats.activeJobs || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 truncate">Total Applications</p>
                      <p className="text-2xl font-semibold text-blue-600">{stats.totalApplications || 0}</p>
                    </div>
                    <DocumentTextIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 truncate">Pending Review</p>
                      <p className="text-2xl font-semibold text-yellow-600">
                        {(stats.statusDistribution?.Applied || 0) + (stats.statusDistribution?.Reviewed || 0)}
                      </p>
                    </div>
                    <UsersIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartCard
                title="Application Status Distribution"
                data={stats.statusDistribution || {}}
              />
              <ChartCard
                title="Role Type Distribution"
                data={stats.roleTypeDistribution || {}}
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Recent Applications */}
              <div className="bg-white shadow rounded-lg border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Applications</h3>
                </div>
                <div className="p-6">
                  {recentApplications.length === 0 ? (
                    <p className="text-sm text-gray-500">No recent applications</p>
                  ) : (
                    <div className="space-y-3">
                      {recentApplications.map((application) => (
                        <div key={application._id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {application.applicantId?.email}
                            </p>
                            <p className="text-xs text-gray-500">
                              {application.jobId?.title} • {application.status}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(application.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Jobs */}
              <div className="bg-white shadow rounded-lg border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Job Postings</h3>
                </div>
                <div className="p-6">
                  {recentJobs.length === 0 ? (
                    <p className="text-sm text-gray-500">No recent job postings</p>
                  ) : (
                    <div className="space-y-3">
                      {recentJobs.map((job) => (
                        <div key={job._id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{job.title}</p>
                            <p className="text-xs text-gray-500">
                              {job.location} • {job.roleType} • {job.status}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && <AdminJobsPage />}
        {activeTab === 'applications' && <AdminApplications />}
        {activeTab === 'bot-activities' && <AdminBotActivities />}
        {activeTab === 'analytics' && <AdminStats />}
      </div>

      {/* Job Form Modal */}
      {showJobForm && (
        <JobForm
          onJobCreated={handleJobCreated}
          onCancel={() => setShowJobForm(false)}
        />
      )}
    </div>
  );
}