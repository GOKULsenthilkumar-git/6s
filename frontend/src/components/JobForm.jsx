import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axiosClient from '../api/axiosClient';

export default function JobForm({ onJobCreated, onCancel, editingJob = null }) {
  const [formData, setFormData] = useState({
    title: editingJob?.title || '',
    description: editingJob?.description || '',
    requirements: editingJob?.requirements || '',
    location: editingJob?.location || '',
    roleType: editingJob?.roleType || 'Technical',
    status: editingJob?.status || 'Active',
    salary: {
      min: editingJob?.salary?.min || '',
      max: editingJob?.salary?.max || '',
      currency: editingJob?.salary?.currency || 'USD'
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    
    if (!formData.requirements.trim()) {
      newErrors.requirements = 'Job requirements are required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Job location is required';
    }
    
    if (!formData.salary.min || formData.salary.min <= 0) {
      newErrors.salaryMin = 'Minimum salary must be greater than 0';
    }
    
    if (!formData.salary.max || formData.salary.max <= 0) {
      newErrors.salaryMax = 'Maximum salary must be greater than 0';
    }
    
    if (formData.salary.min && formData.salary.max && 
        Number(formData.salary.min) >= Number(formData.salary.max)) {
      newErrors.salaryRange = 'Maximum salary must be greater than minimum salary';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('salary.')) {
      const salaryField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        salary: {
          ...prev.salary,
          [salaryField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const jobData = {
        ...formData,
        salary: {
          min: Number(formData.salary.min),
          max: Number(formData.salary.max),
          currency: formData.salary.currency
        }
      };
      
      if (editingJob) {
        await axiosClient.put(`/jobs/${editingJob._id}`, jobData);
      } else {
        await axiosClient.post('/jobs', jobData);
      }
      
      onJobCreated();
    } catch (error) {
      console.error('Error saving job:', error);
      setErrors({
        general: error.response?.data?.message || 'Failed to save job'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {errors.general && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Senior Software Engineer"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., New York, NY / Remote"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>

            {/* Role Type */}
            <div>
              <label htmlFor="roleType" className="block text-sm font-medium text-gray-700 mb-1">
                Role Type *
              </label>
              <select
                name="roleType"
                id="roleType"
                value={formData.roleType}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Technical">Technical</option>
                <option value="Non-Technical">Non-Technical</option>
              </select>
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Range *
              </label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <input
                    type="number"
                    name="salary.min"
                    value={formData.salary.min}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.salaryMin ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Min"
                  />
                </div>
                <span className="flex items-center text-gray-500">-</span>
                <div className="flex-1">
                  <input
                    type="number"
                    name="salary.max"
                    value={formData.salary.max}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.salaryMax ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Max"
                  />
                </div>
                <select
                  name="salary.currency"
                  value={formData.salary.currency}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="CTC">CTC</option>
                  <option value="LPA">LPA</option>
                  
                </select>
              </div>
              {errors.salaryMin && <p className="mt-1 text-sm text-red-600">{errors.salaryMin}</p>}
              {errors.salaryMax && <p className="mt-1 text-sm text-red-600">{errors.salaryMax}</p>}
              {errors.salaryRange && <p className="mt-1 text-sm text-red-600">{errors.salaryRange}</p>}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Job Description *
            </label>
            <textarea
              name="description"
              id="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe the job role, responsibilities, and what you're looking for..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Requirements */}
          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
              Requirements *
            </label>
            <textarea
              name="requirements"
              id="requirements"
              rows={4}
              value={formData.requirements}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.requirements ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="List the required skills, experience, education, and qualifications..."
            />
            {errors.requirements && <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (editingJob ? 'Updating...' : 'Creating...') : (editingJob ? 'Update Job' : 'Create Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}