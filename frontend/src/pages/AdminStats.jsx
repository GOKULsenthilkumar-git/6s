import { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import axiosClient from '../api/axiosClient';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalApplications: 0,
    statusDistribution: {},
    roleTypeDistribution: {},
    monthlyTrends: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axiosClient.get('/applications/stats');
      setStats(response.data || {
        totalApplications: 0,
        statusDistribution: {},
        roleTypeDistribution: {},
        monthlyTrends: {}
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats if API fails
      setStats({
        totalApplications: 0,
        statusDistribution: {
          Applied: 0,
          Reviewed: 0,
          Interview: 0,
          Offer: 0,
          Rejected: 0
        },
        roleTypeDistribution: {
          Technical: 0,
          'Non-Technical': 0
        },
        monthlyTrends: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const statusChartData = {
    labels: Object.keys(stats.statusDistribution || {}),
    datasets: [
      {
        data: Object.values(stats.statusDistribution || {}),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const roleTypeChartData = {
    labels: Object.keys(stats.roleTypeDistribution || {}),
    datasets: [
      {
        label: 'Applications by Role Type',
        data: Object.values(stats.roleTypeDistribution || {}),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const statCards = [
    {
      name: 'Total Applications',
      value: stats.totalApplications || 0,
      icon: DocumentTextIcon,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      name: 'Pending Review',
      value: (stats.statusDistribution?.Applied || 0) + (stats.statusDistribution?.Reviewed || 0),
      icon: ClockIcon,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      name: 'Offers Made',
      value: stats.statusDistribution?.Offer || 0,
      icon: UserGroupIcon,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      name: 'Technical Roles',
      value: stats.roleTypeDistribution?.Technical || 0,
      icon: ChartBarIcon,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Statistics</h1>
        <p className="mt-2 text-sm text-gray-600">
          System-wide application statistics and insights
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-200"
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status Distribution</h3>
          <div className="h-64">
            <Doughnut data={statusChartData} options={chartOptions} />
          </div>
        </div>

        {/* Role Type Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Type Distribution</h3>
          <div className="h-64">
            <Bar data={roleTypeChartData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  display: false
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow-xl rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Key Insights</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round(((stats.statusDistribution?.Offer || 0) / Math.max(stats.totalApplications, 1)) * 100)}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.statusDistribution?.Interview || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Interviews Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(((stats.roleTypeDistribution?.Technical || 0) / Math.max(stats.totalApplications, 1)) * 100)}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Technical Roles</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}