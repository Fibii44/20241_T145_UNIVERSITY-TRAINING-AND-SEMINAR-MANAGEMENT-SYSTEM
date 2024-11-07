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
        console.log('Authenticated user ID:', req.user?.id); // Log to verify req.user is set correctly
        const userId = req.user.id;
        const { phoneNumber, department, position } = req.body;

        console.log('Received update data:', { phoneNumber, department, position }); // Log received data
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                phoneNumber,
                department,
                position,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            console.log('User not found in the database');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Updated user profile:', updatedUser);
        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Server error during profile update:', error);
        res.status(500).json({
            message: 'Server error occurred while updating profile',
            error: error.message || 'Unknown server error'
        });
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
    listProfileEvents,
    updateUserProfile
};
