const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '../.env' });


const NotificationSchema = new mongoose.Schema({
        eventId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Event', // Reference to the Event model
            required: true // Ensures every notification is linked to an event
        },

        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            trim: true,
            maxlength: [500, 'Message must not exceed 500 characters'],
        },
       
        customParticipants: {
            type: [String], // Array of strings for participant emails or IDs
            validate: {
                validator: function (v) {
                    // Optional: Add custom validation for email format
                    return v.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
                },
                message: 'Invalid email format in customParticipants',
            },
            default: [], // Default to an empty array
        },
        
        participantGroup: {
            college: {
                type: String,
                trim: true
            },
            department: {
                type: String,
                trim: true
            }
        },
        userNotifications: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            name: String,
            status: {
                type: String,
                enum: ['unread', 'read'], // Only for reading status
                default: 'unread'
            },
            readAt: { type: Date, default: null },
            removedStatus: {
                type: Boolean, // Indicates if the notification is removed
                default: false
            },
            removedAt: { type: Date, default: null } // Timestamp for when the notification was removed
        }],
        createdAt: { type: Date, default: Date.now },
    },

   
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);


NotificationSchema.plugin(encrypt, { 
    encryptionKey: process.env.MONGODB_ENCRYPTION_KEY,
    signingKey: process.env.MONGODB_SIGNING_KEY,
    excludeFromEncryption: ['eventId', 'userNotifications', 'createdAt', 'updatedAt'],
});


module.exports = mongoose.model('Notification', NotificationSchema);
