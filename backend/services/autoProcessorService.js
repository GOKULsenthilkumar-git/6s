const Application = require('../models/Application');
const Job = require('../models/Job');
const logger = require('../utils/logger');

class AutoProcessorService {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
        this.processingInterval = 10000; // Check every 10 seconds (for testing)
    }

    // Helper to read probability env vars with fallback defaults
    _getProb(envName, defaultVal) {
        const val = process.env[envName];
        const num = parseFloat(val);
        if (!isNaN(num) && num >= 0 && num <= 1) return num;
        return defaultVal;
    }

    // Helper to read integer offset (ms)
    _getInt(envName, defaultVal) {
        const val = process.env[envName];
        const num = parseInt(val, 10);
        if (!isNaN(num) && num >= 0) return num;
        return defaultVal;
    }

    start() {
        if (this.isRunning) return;
        
        console.log('🤖 Auto Processor Service started');
        this.isRunning = true;
        
        // Start processing immediately
        this.processApplications();
        
        // Set up interval for continuous processing
        this.intervalId = setInterval(() => {
            this.processApplications();
        }, this.processingInterval);
    }

    stop() {
        if (!this.isRunning) return;
        
        console.log('🤖 Auto Processor Service stopped');
        this.isRunning = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    async processApplications() {
        try {
            const now = new Date();
            
            // Process applications for technical roles
            await this.processNewApplications(now);
            await this.processReviewedApplications(now);
            await this.processInterviewApplications(now);
            await this.processStaleApplications(now);
            
        } catch (error) {
            console.error('Error in auto processor:', error);
        }
    }

    async processNewApplications(now) {
        // Auto-review technical applications after 30 seconds (for testing)
        const thirtySecondsAgo = new Date(now - 30 * 1000);
        
        const newTechnicalApps = await Application.find({
            status: 'Applied',
            roleType: 'Technical',
            createdAt: { $lt: thirtySecondsAgo },
            lastProcessed: { $exists: false }
        }).populate('jobId');

        for (const app of newTechnicalApps) {
            if (!app.jobId) continue;
            
            await this.updateApplicationStatus(
                app,
                'Reviewed',
                'Application automatically reviewed by AI system for technical role',
                'AI Auto-Review'
            );
        }
    }

    async processReviewedApplications(now) {
        // Auto-schedule interviews for technical applications after 1 minute of review (for testing)
        const oneMinuteAgo = new Date(now - 60 * 1000);
        
        const reviewedTechnicalApps = await Application.find({
            status: 'Reviewed',
            roleType: 'Technical',
            updatedAt: { $lt: oneMinuteAgo }
        }).populate('jobId');

        // probabilities and offsets are configurable via env vars
        const INTERVIEW_PROB = this._getProb('AUTO_INTERVIEW_PROB', 0.7); // default 70% chance
        const INTERVIEW_OFFSET_MS = this._getInt('AUTO_INTERVIEW_OFFSET_MS', 2 * 60 * 1000); // default 2 minutes

        for (const app of reviewedTechnicalApps) {
            if (!app.jobId) continue;
            // Use < INTERVIEW_PROB to match comment (e.g. 0.7 means 70% true)
            const shouldInterview = Math.random() < INTERVIEW_PROB;

            if (shouldInterview) {
                // attach an interview subdocument so frontend can display scheduled interviews
                const scheduledAt = new Date(now.getTime() + INTERVIEW_OFFSET_MS);
                app.interview = app.interview || {};
                app.interview.scheduledAt = scheduledAt;
                app.interview.location = app.jobId.location || 'TBD';
                app.interview.createdAt = new Date();
                app.interview.createdBy = null; // System
                app.interview.notes = 'Automatically scheduled by AI system';

                const comment = `Interview automatically scheduled by AI system for ${scheduledAt.toISOString()}`;

                await this.updateApplicationStatus(
                    app,
                    'Interview',
                    comment,
                    'AI Auto-Schedule'
                );
            } else {
                await this.updateApplicationStatus(
                    app,
                    'Rejected',
                    'Application automatically rejected by AI system - insufficient technical qualifications',
                    'AI Auto-Reject'
                );
            }
        }
    }

    async processInterviewApplications(now) {
        // Process interviews after 2 minutes and make offer/reject decisions (for testing)
        const twoMinutesAgo = new Date(now - 2 * 60 * 1000);
        
        const interviewApps = await Application.find({
            status: 'Interview',
            updatedAt: { $lt: twoMinutesAgo }
        }).populate('jobId');

        const OFFER_PROB = this._getProb('AUTO_OFFER_PROB', 0.6); // default 60% chance to offer

        for (const app of interviewApps) {
            if (!app.jobId) continue;
            // use < OFFER_PROB to match intuitive probability configuration
            const shouldOffer = Math.random() < OFFER_PROB;

            if (shouldOffer) {
                await this.updateApplicationStatus(
                    app,
                    'Offer',
                    'Job offer extended by AI system after successful interview evaluation',
                    'AI Auto-Offer'
                );
            } else {
                await this.updateApplicationStatus(
                    app,
                    'Rejected',
                    'Application rejected by AI system after interview evaluation - cultural fit assessment',
                    'AI Post-Interview-Reject'
                );
            }
        }
    }

    async processStaleApplications(now) {
        // Auto-reject applications older than 5 minutes with no action (for testing)
        const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);
        
        const staleApps = await Application.find({
            status: { $in: ['Applied', 'Reviewed'] },
            createdAt: { $lt: fiveMinutesAgo }
        }).populate('jobId');

        for (const app of staleApps) {
            if (!app.jobId) continue;
            
            await this.updateApplicationStatus(
                app,
                'Rejected',
                'Application automatically rejected due to extended processing time',
                'AI Auto-Timeout'
            );
        }
    }

    async updateApplicationStatus(application, newStatus, comment, actionType) {
        try {
            const previousStatus = application.status;
            
            application.status = newStatus;
            application.lastProcessed = new Date();
            
            if (comment) {
                application.comments.push({
                    text: comment,
                    createdBy: null, // System generated
                    createdAt: new Date()
                });
            }
            
            await application.save();
            
            // Log the activity
            await logger.logActivity(
                application._id,
                null, // System user
                actionType,
                previousStatus,
                newStatus,
                comment,
                'AI System'
            );
            
            console.log(`🤖 Auto-processed application ${application._id}: ${previousStatus} → ${newStatus}`);
            
        } catch (error) {
            console.error(`Error updating application ${application._id}:`, error);
        }
    }

    // Manual trigger for admins
    async triggerManualProcessing(adminId, applicationIds) {
        try {
            const applications = await Application.find({
                _id: { $in: applicationIds }
            }).populate('jobId');

            // Filter to only applications for jobs created by this admin
            const adminJobs = await Job.find({ createdBy: adminId }).select('_id');
            const adminJobIds = adminJobs.map(job => job._id.toString());
            
            const validApps = applications.filter(app => 
                app.jobId && adminJobIds.includes(app.jobId._id.toString())
            );

            let processed = 0;
            for (const app of validApps) {
                if (app.roleType === 'Technical' && app.status === 'Applied') {
                    await this.updateApplicationStatus(
                        app,
                        'Reviewed',
                        'Application manually processed by admin via AI system',
                        'Admin-Triggered AI Review'
                    );
                    processed++;
                }
            }

            return { processed, total: validApps.length };
        } catch (error) {
            console.error('Error in manual processing:', error);
            throw error;
        }
    }
}

// Create singleton instance
const autoProcessorService = new AutoProcessorService();

module.exports = autoProcessorService;