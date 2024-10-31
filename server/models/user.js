const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function() { return !this.googleId; } // Password is required only if googleId is not present
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows it to be unique but not required
    },
    role: {
        type: String,
        enum: ['general_admin', 'departmental_admin', 'faculty_staff'],
        required: true
    },
    department: {
        type: String // Optional field for departmental admins and staff
    },
    profilePicture: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    accessToken: {
        type: String
    },
    refreshToken: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to hash the password if it is new or modified
UserSchema.pre('save', async function (next) {
    // Check if password is modified and not already hashed
    if (this.isModified('password') && !this.password.startsWith('$2b$')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});


// Method to compare password
UserSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
