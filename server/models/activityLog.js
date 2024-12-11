const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
require('dotenv').config({ path: '../.env' });




// Schema definition
const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: Object
  },
}, { timestamps: true });


console.log('encryptionKey: ', process.env.MONGODB_ENCRYPTION_KEY);
console.log('signingKey: ', process.env.MONGODB_SIGNING_KEY);
// Encryption
activityLogSchema.plugin(encrypt, {
  encryptionKey: process.env.MONGODB_ENCRYPTION_KEY,
  signingKey: process.env.MONGODB_SIGNING_KEY
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
