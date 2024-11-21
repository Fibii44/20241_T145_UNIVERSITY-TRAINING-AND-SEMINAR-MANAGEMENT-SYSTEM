const mongoose = require('mongoose');

const formSubmissionSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    registrationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registration',
        required: true
    },
    formLink: {
        type: String,
        required: true
    },
    spreadsheetId: {
        type: String,
        required: false
    },
    googleFormResponseId: {
        type: String,
        required: false
    },
    responses: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'approved', 'rejected'],
        default: 'pending'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    verifiedAt: {
        type: Date
    }
});

module.exports = mongoose.model('FormSubmission', formSubmissionSchema);