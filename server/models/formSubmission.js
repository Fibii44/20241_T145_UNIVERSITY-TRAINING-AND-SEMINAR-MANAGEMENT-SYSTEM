const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
require('dotenv').config({ path: '../.env' });

// Form Submission Schema
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

console.log('encryptionKey: ', process.env.MONGODB_ENCRYPTION_KEY);
console.log('signingKey: ', process.env.MONGODB_SIGNING_KEY);

// Encryption
formSubmissionSchema.plugin(encrypt, {
    encryptionKey: process.env.MONGODB_ENCRYPTION_KEY,   
    signingKey: process.env.MONGODB_SIGNING_KEY,
    excludeFromEncryption: ['eventId', 'userId', 'registrationId']
});

module.exports = mongoose.model('FormSubmission', formSubmissionSchema);