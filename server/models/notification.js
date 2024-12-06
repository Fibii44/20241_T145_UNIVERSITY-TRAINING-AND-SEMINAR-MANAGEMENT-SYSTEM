const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


const NotificationSchema = new mongoose.Schema(
    {
        notificationId: { type: String, unique: true, default: uuidv4 },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            trim: true,
            maxlength: [500, 'Message must not exceed 500 characters'],
        },
        status: {
            type: String,
            enum: ['unread', 'read'],
            default: 'unread',
        },
        readAt: {
            type: Date,
            default: null, // Will be set when marked as read
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
        
        createdAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

// Indexing for performance
NotificationSchema.index({ userId: 1 });
NotificationSchema.index({ eventId: 1 });
NotificationSchema.index({ status: 1 });

// Utility method to mark notification as read
NotificationSchema.methods.markAsRead = async function () {
    if (this.status === 'unread') {
        this.status = 'read';
        this.readAt = new Date();
        return this.save(); // Returns a promise for further chaining if needed
    }
    return this; // No changes made if already read
};

// Utility method to mark notification as unread
NotificationSchema.methods.markAsUnread = async function () {
    if (this.status === 'read') {
        this.status = 'unread';
        this.readAt = null;
        return this.save();
    }
    return this;
};

// Static method to get unread notifications for a user
NotificationSchema.statics.getUnreadByUser = async function (userId) {
    try {
        return this.find({ userId, status: 'unread' });
    } catch (error) {
        console.error('Error fetching unread notifications:', error);
        throw error;
    }
};

// Middleware to handle readAt field consistency
NotificationSchema.pre('save', function (next) {
    if (this.status === 'read' && !this.readAt) {
        this.readAt = new Date();
    }
    if (this.status === 'unread' && this.readAt) {
        this.readAt = null;
    }
    next();
});

module.exports = mongoose.model('Notification', NotificationSchema);
