const userNotification = require('../../models/notification'); // Replace with your actual model

// List all items
const listItems = async (req, res) => {
    try {
        // Fetch notifications sorted by createdAt in descending order
        const items = await userNotification.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        console.error('Error listing items:', error);
        res.status(500).send('Error retrieving items');
    }
};


const updateNotificationStatus = async (req, res) => {
    try {
        const { id } = req.params; // Notification ID
        const { userId } = req.body; // User ID from request body

        // Update the notification for the specific user
        const updatedNotification = await userNotification.findOneAndUpdate(
            { _id: id, "userNotifications.userId": userId },
            {
                $set: {
                    "userNotifications.$.status": "read",
                    "userNotifications.$.readAt": new Date()
                }
            },
            { new: true }
        );

        if (!updatedNotification) return res.status(404).send("Notification not found");
        res.json({ message: "Notification marked as read", updatedNotification });
    } catch (error) {
        console.error("Error updating notification status:", error);
        res.status(500).send("Error updating notification status");
    }
};

const removeNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body; // Get userId from the request body

        // Find the notification and update the user-specific removedStatus and removedAt field
        const updatedNotification = await userNotification.findOneAndUpdate(
            { _id: id, "userNotifications.userId": userId },
            { 
                $set: {
                    "userNotifications.$.removedStatus": true,
                    "userNotifications.$.removedAt": new Date(), // Set removedAt to current timestamp
                }
            },
            { new: true }
        );

        if (!updatedNotification) {
            console.log("Notification or user not found with ID:", id);
            return res.status(404).send('Notification or user not found');
        }

        res.json({ message: 'Notification removed', updatedNotification });
    } catch (error) {
        console.error('Error removing notification:', error);
        res.status(500).send('Error removing notification');
    }
};

module.exports = {
    listItems,
    updateNotificationStatus,
    removeNotification
};
