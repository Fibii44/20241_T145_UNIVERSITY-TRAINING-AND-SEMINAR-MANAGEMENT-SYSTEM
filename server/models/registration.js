const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
require('dotenv').config({path: '../.env'});

const registrationSchema = new mongoose.Schema({
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
  googleEventId: {
    type: String,  // Store the Google Calendar event ID here
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['registered', 'cancelled'],
    default: 'registered'
  }
}, { timestamps: true });

registrationSchema.plugin(encrypt, {
  encryptionKey: process.env.MONGODB_ENCRYPTION_KEY,
  signingKey: process.env.MONGODB_SIGNING_KEY,
  excludeFromEncryption: ['eventId', 'userId'],
});


module.exports = mongoose.model('Registration', registrationSchema);
