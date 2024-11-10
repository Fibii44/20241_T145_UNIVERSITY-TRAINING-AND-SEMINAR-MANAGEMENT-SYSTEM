const mongoose = require('mongoose');

const DeletedEventSchema = new mongoose.Schema({
    
  title: String,
  description: String,
  eventDate: Date,
  startTime: Date,
  endTime: Date,
  location: String,
  deletedByName: String, 
  deletedByRole: String,
  deletedAt: { type: Date, default: Date.now }
});

const DeletedEvent = mongoose.model('DeletedEvent', DeletedEventSchema);

module.exports = DeletedEvent;