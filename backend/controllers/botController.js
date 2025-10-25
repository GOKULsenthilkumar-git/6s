const Application = require('../models/Application');
const logger = require('../utils/logger');

const botController = {
    // @desc    Process technical applications
    // @route   POST /api/bot/process
    // @access  Private (Bot only)
    async processApplications(req, res) {
        try {
            const applications = await Application.find({
                roleType: 'Technical',
                status: { $nin: ['Offer', 'Rejected'] }
            });
            const updates = await Promise.all(applications.map(async (application) => {
                const previousStatus = application.status;
                let newStatus = previousStatus;
                let comment = '';
                // Simulate bot decision making
                switch (previousStatus) {
                    case 'Applied':
                        newStatus = 'Reviewed';
                        comment = 'Application reviewed by automated system';
                        break;
                    case 'Reviewed':
                        newStatus = 'Interview';
                        comment = 'Candidate selected for technical interview';
                        break;
                    case 'Interview':
                        // Randomly decide offer or rejection
                        newStatus = Math.random() > 0.5 ? 'Offer' : 'Rejected';
                        comment = newStatus === 'Offer' 
                            ? 'Technical assessment successful. Extending offer.'
                            : 'Did not meet technical requirements';
                        break;
                }
                if (newStatus !== previousStatus) {
                    application.status = newStatus;
                    application.comments.push({
                        text: comment,
                        createdBy: req.user._id
                    });
                    await application.save();
                    await logger.logActivity(
                        application._id,
                        req.user._id,
                        'Bot Processing',
                        previousStatus,
                        newStatus,
                        comment,
                        'Bot'
                    );
                    return {
                        applicationId: application._id,
                        previousStatus,
                        newStatus,
                        comment
                    };
                }
            }));

            res.json({
                message: 'Processing complete',
                updates: updates.filter(Boolean)
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = botController;