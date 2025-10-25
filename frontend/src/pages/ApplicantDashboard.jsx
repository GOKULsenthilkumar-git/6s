import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  CalendarIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import axiosClient from '../api/axiosClient';

export default function ApplicantDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    offers: 0,
    rejected: 0
  });

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axiosClient.get('/applications/my');
        const apps = response.data || [];
        setApplications(apps);
        
        // Calculate stats
        const newStats = {
          total: apps.length,
          pending: apps.filter(app => app.status === 'Applied').length,
          reviewed: apps.filter(app => ['Reviewed', 'Interview'].includes(app.status)).length,
          offers: apps.filter(app => app.status === 'Offer').length,
          rejected: apps.filter(app => app.status === 'Rejected').length
        };
        setStats(newStats);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      Applied: 'bg-blue-100 text-blue-800 border-blue-200',
      Reviewed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Interview: 'bg-purple-100 text-purple-800 border-purple-200',
      Offer: 'bg-green-100 text-green-800 border-green-200',
      Rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Applied':
        return <ClockIcon className="h-4 w-4" />;
      case 'Reviewed':
        return <EyeIcon className="h-4 w-4" />;
      case 'Interview':
        return <CalendarIcon className="h-4 w-4" />;
      case 'Offer':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'Rejected':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    { 
      name: 'Total Applications', 
      value: stats.total, 
      icon: DocumentTextIcon, 
      color: 'bg-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      name: 'Under Review', 
      value: stats.pending + stats.reviewed, 
      icon: ClockIcon, 
      color: 'bg-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    { 
      name: 'Offers Received', 
      value: stats.offers, 
      icon: CheckCircleIcon, 
      color: 'bg-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      name: 'Rejected', 
      value: stats.rejected, 
      icon: XCircleIcon, 
      color: 'bg-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track and manage your job applications
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/dashboard/applicant/new"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Application
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-500">{stat.name}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Applications Section */}
      <div className="bg-white shadow-xl rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
        </div>
        
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first application.</p>
            <div className="mt-6">
              <Link
                to="/dashboard/applicant/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Application
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="grid gap-4 p-6">
              {applications.map((application) => (
                <div
                  key={application._id}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BriefcaseIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {application.roleType}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Updated: {new Date(application.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {getStatusIcon(application.status)}
                        <span className="ml-2">{application.status}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}