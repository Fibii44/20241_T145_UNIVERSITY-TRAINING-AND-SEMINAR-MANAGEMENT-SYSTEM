const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    summary: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    hostname: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        trim: true,
        default: '#000000',
        validate: {
            validator: function(v) {
                return /^#([0-9A-F]{3}){1,2}$/i.test(v); // Validates hex color code
            },
            message: props => `${props.value} is not a valid hex color code!`
        }
    }
    // name: {
    //     type: String,
    //     required: true,
    //     trim: true
    // },
    // hostname: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // }
    // status: {
    //     type: String,
    //     enum: ['active', 'canceled', 'completed'],
    //     default: 'active'
    // }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', EventSchema);