const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FormSubmission',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    issuedDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['issued', 'revoked'],
        default: 'issued'
    }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);