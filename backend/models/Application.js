const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    roleType: {
        type: String,
        enum: ['Technical', 'Non-Technical'],
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Reviewed', 'Interview', 'Offer', 'Rejected'],
        default: 'Applied'
    },
    // Optional interview details that may be scheduled by the auto-processor
    interview: {
        scheduledAt: { type: Date },
        location: { type: String },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: { type: Date },
        notes: { type: String }
    },
    comments: [{
        text: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastProcessed: {
        type: Date
    }
});

// Update the updatedAt timestamp before saving
applicationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Application', applicationSchema);