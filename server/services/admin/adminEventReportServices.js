const { google } = require('googleapis');
const Event = require('../../models/event');
const User = require('../../models/user');
const FormResponse = require('../../models/formResponse');
const Registration = require('../../models/registration');
const Forms = require('../../models/formSubmission');
const { Types } = require('mongoose');

const renderEventHistory = async (req, res) => {
    try {
        const user = req.user;

        if (user.role === 'admin') {
            const events = await Event.find({ status: "completed" }).sort({ date: -1 });
            res.status(200).json({ events }); // Always wrap in an object with 'events'
        } else if (user.role === 'departmental_admin') {
            const allEvents = await Event.find({ status: "completed" }).sort({ date: -1 });
            const filteredEvents = allEvents.filter(event => event.createdBy.equals(user.id));
            res.status(200).json({ events: filteredEvents }); // Always wrap in an object with 'events'
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        registrations.forEach(async (reg) => {
            if(reg.userId){
                const user = await User.findById(reg.userId._id);
                reg.userId = user;
            }
        });

        // Format the response with necessary user data
        const registeredUsers = registrations.map((reg) => ({
            id: reg._id,
            userId: reg.userId?._id,
            eventId: id,
            name: reg.userId?.name,
            email: reg.userId?.email,
            status: reg.status,
            registrationDate: reg.registrationDate,
        }));

        console.log("registeredUsers", registeredUsers);
        
        res.status(200).json(registeredUsers);
    } catch (error) {
        console.error('Error fetching registered users:', error);
        res.status(500).json({ error: error.message });
    }
};

const formSubmissionsEvent = async (req, res) => {
    const { id } = req.params; // Extract event ID from request parameters

    try {
        // Find all forms for the given event ID, populating user data
        const forms = await Forms.find({ eventId: id }).populate('userId', 'name email');
        
        // Check if no forms were found
        if (!forms || forms.length === 0) {
            console.log("No forms found for this event.");
            return res.status(200).json([]);
        }

        // Format the response with necessary user data and responses
        const userForms = forms.map((form) => {
            console.log("How was the event?", form.responses["How was the event? "]);
            console.log("Keys in form.responses:", Object.keys(form.responses));

            const eventRating = parseInt(form.responses["How was the event? "], 10) || 0; // Default to 0 if not a valid number
            console.log("Event Rating:", eventRating);
            
            return {
                id: form._id,
                userId: form.userId._id,
                userName: form.userId.name,
                userEmail: form.userId.email,
                eventId: form.eventId,
                eventRating, // Include the rating in the response
                responses: form.responses,
                formLink: form.formLink,
                status: form.status,
                submittedAt: form.submittedAt,
            };
        });

        res.status(200).json(userForms); // Send the formatted response
    } catch (error) {
        console.error('Error fetching forms:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching forms.' });
    }
};

// Get registration counts for all events
const getEventRegistrationCounts = async (req, res) => {
    try {
        // Aggregate registrations by eventId and count them
        const registrationCounts = await Registration.aggregate([
            { $match: { status: 'registered' } }, // Only count active registrations
            { $group: { _id: '$eventId', count: { $sum: 1 } } },
            { $project: { eventId: '$_id', count: 1, _id: 0 } }
        ]);

        // Format the response to be more usable
        const formattedCounts = registrationCounts.map(item => ({
            eventId: item.eventId.toString(), // Convert ObjectId to string
            count: item.count
        }));

        res.status(200).json(formattedCounts);
    } catch (error) {
        console.error('Error fetching registration counts:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get event form responses (using the FormResponse model)
const getEventFormResponses = async (req, res) => {
    const { id } = req.params; // Extract event ID
    
    try {
        // Find all form responses for this event
        const responses = await FormResponse.find({ eventId: id }).populate('userId', 'name email');
        
        if (!responses || responses.length === 0) {
            return res.status(200).json([]);
        }
        
        // Format the responses
        const formattedResponses = responses.map(response => ({
            id: response._id,
            userId: response.userId._id,
            userName: response.userId.name,
            userEmail: response.userId.email,
            eventId: response.eventId,
            eventRating: response.eventRating,
            responses: response.responses,
            additionalComments: response.additionalComments,
            submittedAt: response.submittedAt
        }));
        
        res.status(200).json(formattedResponses);
    } catch (error) {
        console.error('Error fetching form responses:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    renderEventHistory,
    getRegisteredUsers,
    formSubmissionsEvent,
    getEventRegistrationCounts,
    getEventFormResponses
};