import { useState, useEffect } from 'react';
import {
  CogIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  BoltIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  GiftIcon,
  HandThumbUpIcon,
  HandThumbDownIcon
} from '@heroicons/react/24/outline';
import axiosClient from '../api/axiosClient';

export default function AdminBotActivities() {
  const [activities, setActivities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalProcessed: 0,
    technicalApps: 0,
    autoReviewed: 0,
    autoInterviews: 0
  });

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds to show automatic processing
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchBotActivities(),
      fetchApplications(),
      fetchStats()
    ]);
    setLoading(false);
  };

  const fetchBotActivities = async () => {
    try {
      const response = await axiosClient.get('/applications/bot-activities');
      setActivities(response.data || []);
    } catch (error) {
      console.error('Error fetching bot activities:', error);
      setActivities([]);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await axiosClient.get('/applications');
      const apps = response.data || [];
      setApplications(apps.filter(app => app.roleType === 'Technical' && app.status === 'Applied'));
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    }
  };

  const fetchStats = async () => {
    try {
      const [activitiesRes, appsRes] = await Promise.all([
        axiosClient.get('/applications/bot-activities'),
        axiosClient.get('/applications')
      ]);
      
      const allActivities = activitiesRes.data || [];
      const allApps = appsRes.data || [];
      
      setStats({
        totalProcessed: allActivities.length,
        technicalApps: allApps.filter(app => app.roleType === 'Technical').length,
        autoReviewed: allActivities.filter(act => act.action?.includes('Review')).length,
        autoInterviews: allActivities.filter(act => act.action?.includes('Interview')).length,
        offersExtended: allApps.filter(app => app.status === 'Offer').length,
        rejected: allApps.filter(app => app.status === 'Rejected').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApplicationToggle = (applicationId) => {
    setSelectedApplications(prev => {
      if (prev.includes(applicationId)) {
        return prev.filter(id => id !== applicationId);
      } else {
        return [...prev, applicationId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map(app => app._id));
    }
  };

  const handleTriggerAI = async () => {
    if (selectedApplications.length === 0) {
      alert('Please select at least one technical application');
      return;
    }

    if (!window.confirm(`Are you sure you want to trigger AI processing for ${selectedApplications.length} technical applications?`)) {
      return;
    }

    setProcessing(true);
    try {
      const response = await axiosClient.post('/applications/trigger-ai-process', {
        applicationIds: selectedApplications
      });

      alert(`AI processing completed: ${response.data.processed} applications processed`);
      setSelectedApplications([]);
      fetchData();
    } catch (error) {
      console.error('Error triggering AI processing:', error);
      alert(error.response?.data?.message || 'Failed to trigger AI processing');
    } finally {
      setProcessing(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'AI Auto-Review':
      case 'auto-review':
        return <DocumentTextIcon className="h-5 w-5 text-blue-600" />;
      case 'AI Auto-Schedule':
      case 'schedule-interview':
        return <ClockIcon className="h-5 w-5 text-purple-600" />;
      case 'AI Auto-Offer':
        return <GiftIcon className="h-5 w-5 text-green-600" />;
      case 'AI Auto-Reject':
      case 'AI Post-Interview-Reject':
      case 'AI Auto-Timeout':
      case 'send-rejection':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <CogIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'AI Auto-Review':
      case 'auto-review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AI Auto-Schedule':
      case 'schedule-interview':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'AI Auto-Offer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'AI Auto-Reject':
      case 'AI Post-Interview-Reject':
      case 'AI Auto-Timeout':
      case 'send-rejection':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">AI Auto-Processing</h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor automatic AI processing for technical applications
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex items-center text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            AI System Active
          </div>
          <button
            onClick={async () => {
              try {
                const response = await axiosClient.post('/applications/create-sample-activities');
                alert(response.data.message);
                fetchData();
              } catch (error) {
                console.error('Error creating sample activities:', error);
                alert('Error creating test data');
              }
            }}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Test Data
          </button>
        </div>
      </div>

      {/* AI Processing Stats */}
      <div className="bg-white shadow-xl rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <BoltIcon className="h-5 w-5 mr-2 text-blue-600" />
            Automatic Processing Statistics
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalProcessed}</div>
              <div className="text-sm text-gray-600">Total Processed</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{stats.technicalApps}</div>
              <div className="text-sm text-gray-600">Technical Apps</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.autoReviewed}</div>
              <div className="text-sm text-gray-600">Auto Reviewed</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.autoInterviews}</div>
              <div className="text-sm text-gray-600">Interviews</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.offersExtended || 0}</div>
              <div className="text-sm text-gray-600">Offers Extended</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.rejected || 0}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">AI Processing Rules</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• New applications auto-reviewed after 30 seconds</div>
              <div>• Technical roles: 70% interview rate, 30% rejection rate</div>
              <div>• Interview scheduling after 1 minute of review </div>
              <div>• Post-interview decisions after 2 minutes: 60% offer, 40% reject</div>
              <div>• Applications timeout after 5 minutes if unprocessed</div>
            </div>
          </div>
          
          {/* Manual Trigger */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleTriggerAI}
              disabled={processing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <PlayIcon className="h-4 w-5 mr-2" />
              {processing ? 'Processing...' : 'Trigger Manual AI Processing'}
            </button>
          </div>
        </div>
      </div>

      {/* Applications Selection */}
      <div className="bg-white shadow-xl rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Select Applications for Processing</h2>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedApplications.length === applications.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
        
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications available</h3>
            <p className="mt-1 text-sm text-gray-500">There are no applications to process.</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {applications.map((application) => (
                <div
                  key={application._id}
                  className={`px-6 py-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                    selectedApplications.includes(application._id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleApplicationToggle(application._id)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(application._id)}
                      onChange={() => handleApplicationToggle(application._id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {application.applicantId?.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {application.jobId?.title} • Applied {new Date(application.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              application.status
                            )}`}
                          >
                            {application.status}
                          </span>
                          <span className="text-xs text-gray-500">{application.roleType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Bot Activities */}
      <div className="bg-white shadow-xl rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bot Activities</h2>
        </div>
        
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bot activities yet</h3>
            <p className="mt-1 text-sm text-gray-500">Bot activities will appear here once automated processes are triggered.</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {activities.map((activity, index) => (
                <div key={index} className="px-6 py-4 border-b border-gray-200 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0">
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.actionType || 'Bot Processing'}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.timestamp || activity.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.comment || activity.description || 'Automated processing completed'}
                      </p>
                      {activity.statusChanged && (
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-500">Status changed:</span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(
                              activity.previousStatus
                            )}`}
                          >
                            {activity.previousStatus}
                          </span>
                          <span className="text-xs text-gray-400">→</span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(
                              activity.newStatus
                            )}`}
                          >
                            {activity.newStatus}
                          </span>
                        </div>
                      )}
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