const mongoose = require('mongoose');

const DeletedUserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    position: String,
    department: String,
    phoneNumber: String,
    deletedBy: String, 
    deletedAt: { type: Date, default: Date.now } // Timestamp of deletion
});

const DeletedUser = mongoose.model('DeletedUser', DeletedUserSchema);

module.exports = DeletedUser;