import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import ChartCard from '../components/ChartCard';

export default function BotDashboard() {
  const [applications, setApplications] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    technical: 0,
    nonTechnical: 0,
    applied: 0,
    inProgress: 0,
    completed: 0,
  });

  const fetchApplications = async () => {
    try {
      const response = await axiosClient.get('/applications');
      setApplications(response.data.filter(app => app.roleType === 'Technical'));
      
      // Calculate stats
      const technicalApps = response.data.filter(app => app.roleType === 'Technical');
      setStats({
        technical: technicalApps.length,
        applied: technicalApps.filter(app => app.status === 'Applied').length,
        inProgress: technicalApps.filter(app => ['Reviewed', 'Interview'].includes(app.status)).length,
        completed: technicalApps.filter(app => ['Offer', 'Rejected'].includes(app.status)).length,
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleProcess = async () => {
    setProcessing(true);
    try {
      await axiosClient.post('/bot/process');
      await fetchApplications();
    } catch (error) {
      console.error('Error processing applications:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Bot Dashboard</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={handleProcess}
            disabled={processing}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Process Applications'}
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ChartCard
          title="Application Status Distribution"
          data={{
            Applied: stats.applied,
            'In Progress': stats.inProgress,
            Completed: stats.completed,
          }}
        />
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Application ID
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {applications.map((application) => (
                    <tr key={application._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {application._id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {application.status}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(application.updatedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}