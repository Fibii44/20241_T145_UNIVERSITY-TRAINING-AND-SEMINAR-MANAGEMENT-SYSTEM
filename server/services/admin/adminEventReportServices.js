const { google } = require('googleapis');
const Event = require('../../models/event');
const User = require('../../models/user');
const Registration = require('../../models/registration');
const Forms = require('../../models/formSubmission')
const { Types } = require('mongoose');

const aggregateUserForms = async (req, res) => {
    const { id } = req.params;

    try {
        const attendees = await Forms.aggregate([
            {
                $match: {
                    eventId: Types.ObjectId(id) // Ensure `id` is treated as an ObjectId
                }
            },
            {
                $lookup: {
                    from: "users", // The users collection
                    localField: "userId", // The field in Forms
                    foreignField: "_id", // The field in users
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails" // Flatten the array
            },
            {
                $project: {
                    _id: 1,
                    eventId: 1,
                    userId: 1,
                    formLink: 1,
                    responses: 1,
                    status: 1,
                    submittedAt: 1,
                    "userDetails.name": 1,
                    "userDetails.email": 1,
                    "userDetails.phoneNumber": 1,
                    "userDetails.department": 1
                }
            }
        ]);

        if (!attendees.length) {
            return res.status(404).json({ message: 'No attendees found for this event.' });
        }

        res.status(200).json(attendees);
    } catch (error) {
        console.error('Error fetching attendees:', error);
        res.status(500).json({ error: 'Failed to fetch attendees' });
    }
};
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
        res.status(200).json(registeredUsers);
    } catch (error) {
        console.error('Error fetching registered users:', error);
        res.status(500).json({ error: error.message });
    }
};
const formSubmissions = async (req, res) => {
    try {
        const forms = await Forms.find();
        res.status(200).json(forms);
    } catch (error) {
        res.status(500).send('Error retrieving events');
    }
}
const formSubmissionsEvent = async (req, res) => {
    const { id } = req.params; // Extract event ID from request parameters

    try {
        // Find all forms for the given event ID, populating user data
        const forms = await Forms.find({ eventId: id }).populate('userId', 'name email');
        
        // Check if no forms were found
        if (!forms || forms.length === 0) {
            return res.status(404).json({ message: 'No forms found for this event.' });
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


module.exports = {
    registration,
    getRegisteredUsers,
    formSubmissions,
    formSubmissionsEvent,
    aggregateUserForms
}