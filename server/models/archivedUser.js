//Dele pani final akong i identical sa user para kung i unarchived 

const mongoose = require('mongoose');

const DeletedUserSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: String,
    email: String,
    role: String,
    position: String,
    department: String,
    phoneNumber: String,
    archivedBy: String, 
    archivedAt: { type: Date, default: Date.now } 
});

const DeletedUser = mongoose.model('ArchivedUser', DeletedUserSchema);

module.exports = DeletedUser;