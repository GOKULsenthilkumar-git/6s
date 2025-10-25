import { useState, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import axiosClient from '../api/axiosClient';

export default function BotQueue() {
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [queueStats, setQueueStats] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  });

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await axiosClient.get('/bot/queue');
      setQueue(response.data || []);
      
      // Calculate queue stats
      const stats = {
        pending: response.data.filter(item => item.status === 'pending').length,
        processing: response.data.filter(item => item.status === 'processing').length,
        completed: response.data.filter(item => item.status === 'completed').length,
        failed: response.data.filter(item => item.status === 'failed').length
      };
      setQueueStats(stats);
    } catch (error) {
      console.error('Error fetching queue:', error);
      // Mock data for demonstration
      setQueue([
        {
          _id: '1',
          applicationId: 'app-001',
          status: 'pending',
          priority: 'high',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          applicationId: 'app-002', 
          status: 'processing',
          priority: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    }
  };

  const handleProcessQueue = async () => {
    setProcessing(true);
    try {
      await axiosClient.post('/bot/process-queue');
      await fetchQueue();
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessSingle = async (queueId) => {
    try {
      await axiosClient.post(`/bot/process/${queueId}`);
      await fetchQueue();
    } catch (error) {
      console.error('Error processing item:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'processing':
        return <ArrowPathIcon className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800', 
      low: 'bg-green-100 text-green-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const statCards = [
    {
      name: 'Pending',
      value: queueStats.pending,
      icon: ClockIcon,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      name: 'Processing',
      value: queueStats.processing,
      icon: ArrowPathIcon,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      name: 'Completed',
      value: queueStats.completed,
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      name: 'Failed',
      value: queueStats.failed,
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Processing Queue</h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor and manage the application processing queue
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={fetchQueue}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleProcessQueue}
            disabled={processing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {processing ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                Process Queue
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
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

      {/* Queue List */}
      <div className="bg-white shadow-xl rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Queue Items ({queue.length})</h2>
        </div>
        
        {queue.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items in queue</h3>
            <p className="mt-1 text-sm text-gray-500">The processing queue is currently empty.</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="divide-y divide-gray-200">
              {queue.map((item) => (
                <div key={item._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Application ID: {item.applicationId}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">
                            Created: {new Date(item.createdAt).toLocaleString()}
                          </span>
                          {item.updatedAt !== item.createdAt && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs text-gray-500">
                                Updated: {new Date(item.updatedAt).toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority} priority
                      </span>
                      
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.status)}`}
                      >
                        {getStatusIcon(item.status)}
                        <span className="ml-2 capitalize">{item.status}</span>
                      </span>
                      
                      {item.status === 'pending' && (
                        <button
                          onClick={() => handleProcessSingle(item._id)}
                          className="inline-flex items-center px-3 py-1 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                        >
                          <PlayIcon className="h-3 w-3 mr-1" />
                          Process
                        </button>
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