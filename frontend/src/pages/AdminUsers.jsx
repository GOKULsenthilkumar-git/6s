import { useState, useEffect } from 'react';
import {
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import axiosClient from '../api/axiosClient';

export default function AdminUsers() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      // Fetch applications for admin's jobs (backend already filters by admin ownership)
      const response = await axiosClient.get('/applications');
      const applications = response.data || [];
      
      // Extract unique applicants from applications
      const uniqueApplicants = [];
      const seenEmails = new Set();
      
      applications.forEach(app => {
        if (app.applicantId && app.applicantId.email && !seenEmails.has(app.applicantId.email)) {
          seenEmails.add(app.applicantId.email);
          uniqueApplicants.push({
            _id: app.applicantId._id || app.applicantId,
            email: app.applicantId.email,
            role: 'applicant',
            createdAt: app.createdAt,
            applicationCount: applications.filter(a => a.applicantId?.email === app.applicantId.email).length,
            latestApplication: app.createdAt
          });
        }
      });
      
      setApplicants(uniqueApplicants);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = () => {
    return 'bg-purple-100 text-purple-800 border-purple-200'; // All are applicants
  };

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const applicantStats = {
    total: applicants.length,
    totalApplications: applicants.reduce((sum, app) => sum + app.applicationCount, 0),
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
          <h1 className="text-3xl font-bold text-gray-900">Job Applicants Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage applicants who applied to your job postings
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">Total Applicants</p>
                <p className="text-2xl font-semibold text-gray-900">{applicantStats.total}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">Total Applications</p>
                <p className="text-2xl font-semibold text-purple-600">{applicantStats.totalApplications}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white shadow rounded-lg border border-gray-100">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search applicants by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>

            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white shadow rounded-lg border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Applicants ({filteredApplicants.length})
          </h2>
        </div>
        
        {filteredApplicants.length === 0 ? (
          <div className="text-center py-12">
            <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applicants found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search criteria.' 
                : 'No one has applied to your job postings yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredApplicants.map((applicant) => (
                <div key={applicant._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="shrink-0">
                        <div className="h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {applicant.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{applicant.email}</div>
                        <div className="text-sm text-gray-500">
                          {applicant.applicationCount} application{applicant.applicationCount !== 1 ? 's' : ''}
                          • Last applied {new Date(applicant.latestApplication).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor()}`}
                      >
                        Applicant
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