const mongoose = require('mongoose');

const DeletedEventSchema = new mongoose.Schema({
    
  title: String,
  description: String,
  eventDate: Date,
  startTime: String,
  endTime: String,
  location: String,
  deletedByName: String, 
  deletedByRole: String,
  deletedAt: { type: Date, default: Date.now }
});

const DeletedEvent = mongoose.model('DeletedEvent', DeletedEventSchema);

module.exports = DeletedEvent;