const Application = require('../models/Application');
const Job = require('../models/Job');
const logger = require('../utils/logger');

const applicationController = {
    // @desc    Create new application
    // @route   POST /api/applications
    // @access  Private
    async createApplication(req, res) {
        try {
            const { jobId, roleType } = req.body;

            // Validate that job exists and is active
            const job = await Job.findById(jobId);
            if (!job) return res.status(404).json({ message: 'Job not found' });
            if (job.status !== 'Active') return res.status(400).json({ message: 'Job is not currently accepting applications' });

            // Check if user has already applied for this job
            const existingApplication = await Application.findOne({ applicantId: req.user._id, jobId });
            if (existingApplication) return res.status(400).json({ message: 'You have already applied for this job' });

            const application = await Application.create({ applicantId: req.user._id, jobId, roleType: roleType || job.roleType, status: 'Applied' });

            await logger.logActivity(application._id, req.user._id, 'Application Created', null, 'Applied', `Application submitted for ${job.title}`, 'Applicant');

            res.status(201).json(application);
        } catch (error) {
            console.error('Error creating application:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // @desc    Get all applications for admin's jobs only
    // @route   GET /api/applications
    // @access  Private (Admin)
    async getAllApplications(req, res) {
        try {
            const adminJobs = await Job.find({ createdBy: req.user._id }).select('_id');
            const adminJobIds = adminJobs.map(job => job._id);

            const applications = await Application.find({ jobId: { $in: adminJobIds } })
                .populate('applicantId', 'email')
                .populate('jobId', 'title location roleType')
                .sort('-createdAt');

            res.json(applications);
        } catch (error) {
            console.error('Error fetching applications:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // @desc    Get user applications
    // @route   GET /api/applications/my
    // @access  Private
    async getUserApplications(req, res) {
        try {
            const applications = await Application.find({ applicantId: req.user._id }).populate('jobId', 'title location roleType status').sort('-createdAt');
            res.json(applications);
        } catch (error) {
            console.error('Error fetching user applications:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // @desc    Update application status
    // @route   PUT /api/applications/:id
    // @access  Private (Admin/Bot)
    async updateApplication(req, res) {
        try {
            const { status, comment } = req.body;
            const application = await Application.findById(req.params.id).populate('jobId');
            if (!application) return res.status(404).json({ message: 'Application not found' });

            // Admins may only update applications for jobs they created
            if (req.user.role === 'admin') {
                if (!application.jobId || String(application.jobId.createdBy) !== String(req.user._id)) {
                    return res.status(403).json({ message: 'You do not have permission to update this application' });
                }
            }

            const previousStatus = application.status;
            if (status) application.status = status;
            if (comment) application.comments.push({ text: comment, createdBy: req.user._id });

            await application.save();

            await logger.logActivity(application._id, req.user._id, 'Status Updated', previousStatus, application.status, comment, req.user.role === 'bot' ? 'Bot' : 'Admin');

            res.json(application);
        } catch (error) {
            console.error('Error updating application:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // @desc    Get application statistics for admin's jobs only
    // @route   GET /api/applications/stats
    // @access  Private (Admin)
    async getStats(req, res) {
        try {
            const adminJobs = await Job.find({ createdBy: req.user._id }).select('_id');
            const adminJobIds = adminJobs.map(job => job._id);

            const stats = await Application.aggregate([
                { $match: { jobId: { $in: adminJobIds } } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        technical: { $sum: { $cond: [{ $eq: ['$roleType', 'Technical'] }, 1, 0] } },
                        nonTechnical: { $sum: { $cond: [{ $eq: ['$roleType', 'Non-Technical'] }, 1, 0] } },
                        applied: { $sum: { $cond: [{ $eq: ['$status', 'Applied'] }, 1, 0] } }
                    }
                }
            ]);

            const statusDistribution = {};
            const roleTypeDistribution = {};

            if (stats[0]) {
                roleTypeDistribution.Technical = stats[0].technical || 0;
                roleTypeDistribution['Non-Technical'] = stats[0].nonTechnical || 0;
            }

            const detailedStats = await Application.aggregate([
                { $match: { jobId: { $in: adminJobIds } } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]);
            detailedStats.forEach(stat => { statusDistribution[stat._id] = stat.count; });

            res.json({
                totalApplications: stats[0]?.total || 0,
                statusDistribution,
                roleTypeDistribution
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // @desc    Get bot activities for admin's jobs only
    // @route   GET /api/applications/bot-activities
    // @access  Private (Admin)
    async getBotActivities(req, res) {
        try {
            const adminJobs = await Job.find({ createdBy: req.user._id }).select('_id');
            const adminJobIds = adminJobs.map(job => job._id);

            const adminApplications = await Application.find({ jobId: { $in: adminJobIds } }).select('_id');
            const adminApplicationIds = adminApplications.map(app => app._id);

            const activities = await logger.getActivities({ actorType: 'Bot', applicationIds: adminApplicationIds, limit: 100 });
            res.json(activities);
        } catch (error) {
            console.error('Error fetching bot activities:', error);
            res.status(500).json({ message: 'Server error fetching bot activities' });
        }
    },

    // @desc    Trigger AI auto-processing for admin's applications
    // @route   POST /api/applications/trigger-ai-process
    // @access  Private (Admin)
    async triggerAIProcessing(req, res) {
        try {
            const { applicationIds } = req.body;
            if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
                return res.status(400).json({ message: 'Application IDs are required' });
            }

            const autoProcessorService = require('../services/autoProcessorService');
            const result = await autoProcessorService.triggerManualProcessing(req.user._id, applicationIds);

            res.json({ 
                message: 'AI processing completed', 
                processed: result.processed,
                total: result.total
            });
        } catch (error) {
            console.error('Error in triggerAIProcessing:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // @desc    Create sample bot activities for testing
    // @route   POST /api/applications/create-sample-activities
    // @access  Private (Admin)
    async createSampleActivities(req, res) {
        try {
            const adminJobs = await Job.find({ createdBy: req.user._id }).select('_id');
            if (adminJobs.length === 0) {
                return res.status(400).json({ message: 'No jobs found for this admin' });
            }

            const adminJobIds = adminJobs.map(job => job._id);
            const applications = await Application.find({ jobId: { $in: adminJobIds } });

            if (applications.length === 0) {
                return res.status(400).json({ message: 'No applications found for your jobs' });
            }

            // Create diverse sample activities
            const sampleActivities = [];
            const sampleActions = [
                { 
                    action: 'AI Auto-Review', 
                    fromStatus: 'Applied', 
                    toStatus: 'Reviewed',
                    description: 'Application automatically reviewed by AI system for technical role'
                },
                { 
                    action: 'AI Auto-Schedule', 
                    fromStatus: 'Reviewed', 
                    toStatus: 'Interview',
                    description: 'Interview automatically scheduled by AI system based on technical qualifications'
                },
                { 
                    action: 'AI Auto-Offer', 
                    fromStatus: 'Interview', 
                    toStatus: 'Offer',
                    description: 'Job offer extended by AI system after successful interview evaluation'
                },
                { 
                    action: 'AI Auto-Reject', 
                    fromStatus: 'Reviewed', 
                    toStatus: 'Rejected',
                    description: 'Application automatically rejected by AI system - insufficient technical qualifications'
                },
                { 
                    action: 'AI Post-Interview-Reject', 
                    fromStatus: 'Interview', 
                    toStatus: 'Rejected',
                    description: 'Application rejected by AI system after interview evaluation - cultural fit assessment'
                }
            ];

            for (let i = 0; i < Math.min(10, applications.length); i++) {
                const app = applications[i];
                const randomAction = sampleActions[Math.floor(Math.random() * sampleActions.length)];
                
                // Update application status
                app.status = randomAction.toStatus;
                app.updatedAt = new Date();
                await app.save();
                
                // Log the activity
                await logger.logActivity(
                    app._id,
                    null,
                    randomAction.action,
                    randomAction.fromStatus,
                    randomAction.toStatus,
                    randomAction.description,
                    'AI System'
                );
                
                sampleActivities.push({
                    applicationId: app._id,
                    action: randomAction.action,
                    performedBy: 'AI System',
                    status: randomAction.toStatus
                });
            }

            res.json({ 
                message: 'Sample activities created with offers and rejections', 
                activities: sampleActivities.length,
                breakdown: sampleActivities.reduce((acc, activity) => {
                    acc[activity.status] = (acc[activity.status] || 0) + 1;
                    return acc;
                }, {})
            });
        } catch (error) {
            console.error('Error creating sample activities:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = applicationController;