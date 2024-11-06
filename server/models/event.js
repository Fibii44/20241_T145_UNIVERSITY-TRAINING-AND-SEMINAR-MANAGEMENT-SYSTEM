// eventSchema.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: 100
    },
    eventDate: {
        type: Date,
        required: [true, 'Event date is required']
    },
    startTime: {
        type: String, // Keeping as string for compatibility with time picker in frontend
        required: [true, 'Event start time is required'],
        match: /^([01]\d|2[0-3]):([0-5]\d)$/, // 24-hour format validation (HH:mm)
    },
    endTime: {
        type: String,
        required: [true, 'Event end time is required'],
        match: /^([01]\d|2[0-3]):([0-5]\d)$/, // 24-hour format validation (HH:mm)
    },
    location: {
        type: String,
        required: [true, 'Event location is required'],
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    reminders: {
        type: String,
        enum: ['None', '1 hour before', '1 day before', '1 week before'],
        default: 'None'
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
    color: {
        type: String,
        trim: true

    },
    customParticipants: [{
        type: String,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] // Basic email validation
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Event creator is required']
    },

    editedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Initially set to null
      },
      editedAt: {
        type: Date,
        default: null
      },
      
    status: {
        type: String,
        enum: ['active', 'canceled', 'completed'],
        default: 'active'
    },
    // Concurrency control fields
    isLocked: {
        type: Boolean,
        default: false
    },
    lockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    lockTimestamp: {
        type: Date,
        default: null
    }
}, {
    timestamps: true // Adds `createdAt` and `updatedAt` fields automatically
});

// Indexing createdBy and status fields to improve query performance on these fields
EventSchema.index({ createdBy: 1 });
EventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', EventSchema);
