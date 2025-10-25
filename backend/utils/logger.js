const ActivityLog = require('../models/ActivityLog');

const logger = {
    async logActivity(applicationId, userId, action, previousStatus, newStatus, comment, performedBy) {
        try {
            await ActivityLog.create({
                applicationId,
                userId,
                action,
                previousStatus,
                newStatus,
                comment,
                performedBy
            });
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    },

    async getActivities(options = {}) {
        try {
            const {
                actorType,
                applicationIds,
                limit = 100,
                skip = 0
            } = options;

            const query = {};

            if (actorType) {
                query.performedBy = actorType;
            }

            if (applicationIds && applicationIds.length > 0) {
                query.applicationId = { $in: applicationIds };
            }

            const activities = await ActivityLog.find(query)
                .populate('applicationId', 'roleType')
                .populate('userId', 'email')
                .sort('-createdAt')
                .limit(limit)
                .skip(skip);

            return activities;
        } catch (error) {
            console.error('Error fetching activities:', error);
            return [];
        }
    }
};

module.exports = logger;