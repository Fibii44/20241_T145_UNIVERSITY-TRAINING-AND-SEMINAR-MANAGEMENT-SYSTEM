const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
require('dotenv').config({ path: '../.env' });

// Form Response Schema - For storing event feedback and responses
const formResponseSchema = new mongoose.Schema({
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
    formSubmissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FormSubmission',
        required: false
    },
    responses: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
        default: {}
    },
    eventRating: {
        type: Number,
        min: 1,
        max: 5,
        default: 0
    },
    additionalComments: {
        type: String,
        default: ''
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

// Encryption
formResponseSchema.plugin(encrypt, {
    encryptionKey: process.env.MONGODB_ENCRYPTION_KEY,   
    signingKey: process.env.MONGODB_SIGNING_KEY,
    excludeFromEncryption: ['eventId', 'userId', 'formSubmissionId', 'eventRating']
});

module.exports = mongoose.model('FormResponse', formResponseSchema); 