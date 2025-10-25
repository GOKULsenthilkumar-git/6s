const Job = require('../models/Job');
const Application = require('../models/Application');
const logger = require('../utils/logger');

const jobController = {
    // @desc    Create new job
    // @route   POST /api/jobs
    // @access  Private (Admin only)
    async createJob(req, res) {
        try {
            const { title, description, requirements, location, salary, roleType } = req.body;

            const job = await Job.create({
                title,
                description,
                requirements,
                location,
                salary,
                roleType,
                createdBy: req.user._id
            });

            res.status(201).json(job);
        } catch (error) {
            console.error('Error creating job:', error);
            res.status(500).json({ message: 'Server error creating job' });
        }
    },

    // @desc    Get all jobs for current admin
    // @route   GET /api/jobs
    // @access  Private (Admin only)
    async getAllJobs(req, res) {
        try {
            const jobs = await Job.find({ createdBy: req.user._id })
                .populate('createdBy', 'email')
                .sort('-createdAt');
            res.json(jobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            res.status(500).json({ message: 'Server error fetching jobs' });
        }
    },

    // @desc    Get active jobs (for applicants)
    // @route   GET /api/jobs/active
    // @access  Private
    async getActiveJobs(req, res) {
        try {
            const jobs = await Job.find({ status: 'Active' })
                .select('-createdBy')
                .sort('-createdAt');
            res.json(jobs);
        } catch (error) {
            console.error('Error fetching active jobs:', error);
            res.status(500).json({ message: 'Server error fetching active jobs' });
        }
    },

    // @desc    Get single job
    // @route   GET /api/jobs/:id
    // @access  Private
    async getJobById(req, res) {
        try {
            // If admin, only show their own jobs; if applicant, show any active job
            const query = req.user.role === 'admin' 
                ? { _id: req.params.id, createdBy: req.user._id }
                : { _id: req.params.id, status: 'Active' };
                
            const job = await Job.findOne(query)
                .populate('createdBy', 'email');
            
            if (!job) {
                return res.status(404).json({ message: 'Job not found' });
            }

            res.json(job);
        } catch (error) {
            console.error('Error fetching job:', error);
            res.status(500).json({ message: 'Server error fetching job' });
        }
    },

    // @desc    Update job
    // @route   PUT /api/jobs/:id
    // @access  Private (Admin only)
    async updateJob(req, res) {
        try {
            const { title, description, requirements, location, salary, roleType, status } = req.body;
            
            // Only allow admin to update their own jobs
            const job = await Job.findOne({ _id: req.params.id, createdBy: req.user._id });
            
            if (!job) {
                return res.status(404).json({ message: 'Job not found or you do not have permission to update it' });
            }

            // Update job fields
            job.title = title || job.title;
            job.description = description || job.description;
            job.requirements = requirements || job.requirements;
            job.location = location || job.location;
            job.salary = salary || job.salary;
            job.roleType = roleType || job.roleType;
            job.status = status || job.status;

            await job.save();

            res.json(job);
        } catch (error) {
            console.error('Error updating job:', error);
            res.status(500).json({ message: 'Server error updating job' });
        }
    },

    // @desc    Delete job
    // @route   DELETE /api/jobs/:id
    // @access  Private (Admin only)
    async deleteJob(req, res) {
        try {
            // Only allow admin to delete their own jobs
            const job = await Job.findOne({ _id: req.params.id, createdBy: req.user._id });
            
            if (!job) {
                return res.status(404).json({ message: 'Job not found or you do not have permission to delete it' });
            }

            // Check if there are applications for this job
            const applicationCount = await Application.countDocuments({ jobId: req.params.id });
            
            if (applicationCount > 0) {
                return res.status(400).json({ 
                    message: `Cannot delete job. There are ${applicationCount} applications for this job.` 
                });
            }

            await Job.findByIdAndDelete(req.params.id);

            res.json({ message: 'Job deleted successfully' });
        } catch (error) {
            console.error('Error deleting job:', error);
            res.status(500).json({ message: 'Server error deleting job' });
        }
    },

    // @desc    Get job statistics for current admin
    // @route   GET /api/jobs/stats
    // @access  Private (Admin only)
    async getJobStats(req, res) {
        try {
            const stats = await Job.aggregate([
                {
                    $match: { createdBy: req.user._id }
                },
                {
                    $group: {
                        _id: null,
                        totalJobs: { $sum: 1 },
                        activeJobs: {
                            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
                        },
                        inactiveJobs: {
                            $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] }
                        },
                        closedJobs: {
                            $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] }
                        },
                        technicalJobs: {
                            $sum: { $cond: [{ $eq: ['$roleType', 'Technical'] }, 1, 0] }
                        },
                        nonTechnicalJobs: {
                            $sum: { $cond: [{ $eq: ['$roleType', 'Non-Technical'] }, 1, 0] }
                        }
                    }
                }
            ]);

            // Get admin's job IDs for filtering applications
            const adminJobs = await Job.find({ createdBy: req.user._id }).select('_id');
            const adminJobIds = adminJobs.map(job => job._id);

            // Get application statistics for admin's jobs only
            const applicationStats = await Application.aggregate([
                {
                    $match: { jobId: { $in: adminJobIds } }
                },
                {
                    $group: {
                        _id: '$jobId',
                        applicationCount: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalApplications: { $sum: '$applicationCount' },
                        averageApplicationsPerJob: { $avg: '$applicationCount' }
                    }
                }
            ]);

            const jobStats = stats[0] || {
                totalJobs: 0,
                activeJobs: 0,
                inactiveJobs: 0,
                closedJobs: 0,
                technicalJobs: 0,
                nonTechnicalJobs: 0
            };

            const appStats = applicationStats[0] || {
                totalApplications: 0,
                averageApplicationsPerJob: 0
            };

            res.json({
                ...jobStats,
                ...appStats
            });
        } catch (error) {
            console.error('Error fetching job stats:', error);
            res.status(500).json({ message: 'Server error fetching job stats' });
        }
    },

    // @desc    Get applications for a specific job (admin's own job only)
    // @route   GET /api/jobs/:id/applications
    // @access  Private (Admin only)
    async getJobApplications(req, res) {
        try {
            // First verify the job belongs to the current admin
            const job = await Job.findOne({ _id: req.params.id, createdBy: req.user._id });
            
            if (!job) {
                return res.status(404).json({ message: 'Job not found or you do not have permission to view its applications' });
            }

            const applications = await Application.find({ jobId: req.params.id })
                .populate('applicantId', 'email')
                .populate('jobId', 'title')
                .sort('-createdAt');

            res.json(applications);
        } catch (error) {
            console.error('Error fetching job applications:', error);
            res.status(500).json({ message: 'Server error fetching job applications' });
        }
    }
};

module.exports = jobController;