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
        const history = await EventHistory.find({ userId: req.user.id });
        res.json(history);
    } catch (error) {
        res.status(500).send('Error retrieving event history');
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
    listProfileEvents
};
