const mongoose = require('mongoose');
const Event = require('../../models/Event'); // Import the Event model

// Database connection (ensure this is in the right place in your application)
const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI; // Use your MongoDB URI from environment variables
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process with failure
    }
};

// Call the connectDB function to establish a connection to MongoDB when the service is loaded
connectDB();

const renderEventsPage = async (req, res) => {
    try {
        const events = await Event.find();
        res.render('adminEventsPage', { events });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addEvent = async (req, res) => {
    try {
        const { title, description, date, location } = req.body;
        const newEvent = new Event({ title, description, date, location });
        await newEvent.save();
        res.status(201).json({ message: 'Event added successfully', newEvent });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const viewEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    renderEventsPage,
    addEvent,
    viewEventById,
};
