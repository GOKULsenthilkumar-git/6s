const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Allow null for system/AI actions
    },
    action: {
        type: String,
        required: true
    },
    previousStatus: {
        type: String,
        enum: ['Applied', 'Reviewed', 'Interview', 'Offer', 'Rejected']
    },
    newStatus: {
        type: String,
        enum: ['Applied', 'Reviewed', 'Interview', 'Offer', 'Rejected']
    },
    comment: {
        type: String
    },
    performedBy: {
        type: String,
        enum: ['Admin', 'Bot', 'Applicant', 'AI System'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);