const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1h';
const Registration = require('../../models/registration');
const Certificate = require('../../models/certificate');
const { emitNewActivity } = require('../../config/socketConfig')

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
        const { phoneNumber, department, college, position, stayLoggedIn } = req.body;

        const tokenExpiry = stayLoggedIn ? '90d' : JWT_EXPIRES_IN;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.phoneNumber = phoneNumber;
        user.college = college;
        user.department = department;
        user.position = position;
       
        

        const updatedUser = await user.save();

        const token = jwt.sign(
            {
                id: updatedUser._id,
                role: updatedUser.role,
                name: updatedUser.name,
                email: updatedUser.email,
                position: updatedUser.position,
                college: updatedUser.college,
                department: updatedUser.department,
                phoneNumber: updatedUser.phoneNumber,
                profilePicture: updatedUser.profilePicture,
                accessToken: updatedUser.accessToken,
                refreshToken: updatedUser.refreshToken,
                mustChangePassword: updatedUser.mustChangePassword,
                status: updatedUser.status
            },
            JWT_SECRET,
            { expiresIn: tokenExpiry }
        );

        console.log(updatedUser)
        console.log(token)

        await emitNewActivity(user._id, 'Updated User Profile', {userName: user.name})

        res.status(200).json({user: updatedUser, token});  // Return the updated user data to the client without sensitive details in the logs
    } catch (error) {
        console.error('Error updating profile:', error);  // Log error but avoid logging sensitive info
        res.status(500).send(`Error updating profile: ${error.message}`);
    }
};
// List all certificates for the user
const listCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({ userId: req.user.id });
        res.status(200).json(certificates);
    } catch (error) {
        res.status(500).send('Error retrieving certificates');
    }
};

// View a specific certificate by ID
const viewCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.certificateID);
        if (!certificate) return res.status(404).send('Certificate not found');
        res.status(200).json(certificate);
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

        res.status(200).json(events || []); // Always send an array
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
        res.status(200).json(eventHistory);
    } catch (error) {
        res.status(500).send('Error retrieving event history');
    };
}


module.exports = {
    renderProfilePage,
    listCertificates,
    viewCertificate,
    renderHistoryPage,
    viewEventHistory,
    updateUserProfile
};
