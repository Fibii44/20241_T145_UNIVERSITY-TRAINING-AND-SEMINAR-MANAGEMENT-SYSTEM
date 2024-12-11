const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
require('dotenv').config({path: '../.env'});

const DeletedEventSchema = new mongoose.Schema({
    
  title: String,
  description: String,
  eventDate: Date,
  startTime: Date,
  endTime: Date,
  location: String,
  deletedByName: String, 
  deletedByRole: String,
}, {timestamps: true});

DeletedEventSchema.plugin(encrypt, {
    encryptionKey: process.env.MONGODB_ENCRYPTION_KEY,
    signingKey: process.env.MONGODB_SIGNING_KEY,
    excludeFromEncryption: ['deletedByName', 'deletedByRole'],
});

const DeletedEvent = mongoose.model('DeletedEvent', DeletedEventSchema);

module.exports = DeletedEvent;