const { google } = require('googleapis');
const Event = require('../../models/event');
const User = require('../../models/user');
const Registration = require('../../models/registration');

const registration = async (req, res) => {
    try {
        const registrations = await Registration.find();
        res.json(registrations);
    } catch (error) {
        res.status(500).send('Error retrieving events');
    }
};
// Fetch all registered users for a specific event
const getRegisteredUsers = async (req, res) => {
    const { id } = req.params; // Extract event ID from request parameters
    try {
        // Find all registrations for the given event ID
        const registrations = await Registration.find({ eventId: id }).populate('userId', 'name email');
        if (!registrations.length) {
            return res.status(404).json({ message: 'No registrations found for this event.' });
        }
        // Format the response with necessary user data
        const registeredUsers = registrations.map((reg) => ({
            id: reg._id,
            userId: reg.userId._id,
            eventId: id,
            name: reg.userId.name,
            email: reg.userId.email,
            status: reg.status,
            registrationDate: reg.registrationDate,
        }));
        res.json(registeredUsers);
    } catch (error) {
        console.error('Error fetching registered users:', error);
        res.status(500).json({ error: error.message });
    }
};
module.exports = {
    registration,
    getRegisteredUsers
}