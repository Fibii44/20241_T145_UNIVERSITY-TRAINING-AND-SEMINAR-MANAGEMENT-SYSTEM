const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
require('dotenv').config({ path: '../.env' });

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
        enum: ['generated', 'revoked'],
        default: 'generated'
    }
}, { timestamps: true });


certificateSchema.plugin(encrypt, { 
    encryptionKey: process.env.MONGODB_ENCRYPTION_KEY, 
    signingKey: process.env.MONGODB_SIGNING_KEY,
    excludeFromEncryption: ['userId', 'eventId', 'submissionId'],
});

module.exports = mongoose.model('Certificate', certificateSchema);