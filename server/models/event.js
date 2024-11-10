// eventSchema.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: 100
    },
    eventPicture: {
        type: String
    },
    eventDate: {
        type: Date,
        required: [true, 'Event date is required']
    },
    startTime: {
        type: Date, // Use Date type for compatibility with date-time storage
        required: [true, 'Event start time is required']
    },
    endTime: {
        type: Date,
        required: [true, 'Event end time is required']
    },
    timezone: {
        type: String,
        required: true,
        default: 'Asia/Manila' // Default to Philippines timezone
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
    reminders: [{
        method: {
            type: String,
            enum: ['email', 'popup'],
            default: 'email'
        },
        minutesBefore: {
            type: Number,
            required: true
        }
    }],
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
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Event creator is required']
    },
    editedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
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
    timestamps: true
});

// Indexing createdBy and status fields
EventSchema.index({ createdBy: 1 });
EventSchema.index({ status: 1 });

// Updates the status based on the current date-time
EventSchema.methods.updateStatusIfComplete = async function () {
    try {
        const now = new Date();
        // Check if event has ended based on endTime
        if (this.status === 'active' && this.endTime < now) {
            this.status = 'completed';
            await this.save();
        }
    } catch (error) {
        console.error('Error updating status:', error);
        throw error;
    }
};

// Middleware to update the status of each event when accessed
EventSchema.post('find', async function (events, next) {
    try {
        await Promise.all(events.map(event => event.updateStatusIfComplete()));
        next();
    } catch (error) {
        console.error('Error in post-find middleware:', error);
        next(error);
    }
});

EventSchema.post('findOne', async function (event, next) {
    try {
        if (event) {
            await event.updateStatusIfComplete();
        }
        next();
    } catch (error) {
        console.error('Error in post-findOne middleware:', error);
        next(error);
    }
});

module.exports = mongoose.model('Event', EventSchema);
