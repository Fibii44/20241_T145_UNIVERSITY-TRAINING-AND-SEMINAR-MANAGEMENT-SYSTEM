const User = require('../../models/user');
const Registration = require('../../models/registration');
// db connection
// Render user profile page
const renderProfilePage = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).send('User not found');
        res.json(user);
    } catch (error) {
        res.status(500).send('Error retrieving user profile');
    }
};


// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { phoneNumber, department, position } = req.body;

      

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Update user data
        user.phoneNumber = phoneNumber;
        user.department = department;
        user.position = position;

        const updatedUser = await user.save();

        res.json(updatedUser);  // Return the updated user data to the client without sensitive details in the logs
    } catch (error) {
        console.error('Error updating profile:', error);  // Log error but avoid logging sensitive info
        res.status(500).send(`Error updating profile: ${error.message}`);
    }
};
// List all certificates for the user
const listCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({ userId: req.user.id });
        res.json(certificates);
    } catch (error) {
        res.status(500).send('Error retrieving certificates');
    }
};

// View a specific certificate by ID
const viewCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.certificateID);
        if (!certificate) return res.status(404).send('Certificate not found');
        res.json(certificate);
    } catch (error) {
        res.status(500).send('Error retrieving certificate');
    }
};

const renderHistoryPage = async (req, res) => {
    try {
        const userId = req.user.id;
        const registrations = await Registration.find({ userId }).populate('eventId');

        const events = registrations
            .map(reg => reg.eventId)
            .filter(event => event); // Filter out any null or invalid events

        res.json(events || []); // Always send an array
    } catch (err) {
        console.error("Error fetching registered events", err);
        res.status(500).json([]);
    }
};

// View specific event history details
const viewEventHistory = async (req, res) => {
    try {
        const eventHistory = await EventHistory.findById(req.params.eventID);
        if (!eventHistory) return res.status(404).send('Event history not found');
        res.json(eventHistory);
    } catch (error) {
        res.status(500).send('Error retrieving event history');
    };
}

const listProfileEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).send('Error retrieving events');
    }
};

module.exports = {
    renderProfilePage,
    listCertificates,
    viewCertificate,
    renderHistoryPage,
    viewEventHistory,
    listProfileEvents,
    updateUserProfile
};
