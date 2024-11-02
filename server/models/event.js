const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        enum: ['Engineering', 'Business', 'IT', 'HR'], // Example enum
        required: false
    },
    eventType: {
        type: String,
        enum: ['training', 'seminar', 'workshop'],
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1 // Ensure capacity is a positive number
    },
    status: {
        type: String,
        enum: ['active', 'canceled', 'completed'],
        default: 'active'
    }
}, {
    timestamps: true // Adds `createdAt` and `updatedAt` fields
});

module.exports = mongoose.model('Event', EventSchema);