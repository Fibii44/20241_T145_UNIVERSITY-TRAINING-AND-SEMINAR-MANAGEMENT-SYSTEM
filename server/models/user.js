const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '../.env' });

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
    salt: {
        type: String,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows it to be unique but not required
    },
    role: {
        type: String,
        enum: ['admin', 'departmental_admin', 'faculty_staff'],
        required: true
    },
    position: {
        type: String
    },
    department: {
        type: String // Optional field for departmental admins and staff
    },
    profilePicture: {
        type: String
    },
    phoneNumber: {
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
    mustChangePassword: {
        type: Boolean,
        default: false
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

UserSchema.plugin(encrypt, {
    encryptionKey: process.env.MONGODB_ENCRYPTION_KEY,
    signingKey: process.env.MONGODB_SIGNING_KEY,
    excludeFromEncryption: ['password', 'email', 'status'],
});

module.exports = mongoose.model('User', UserSchema);

