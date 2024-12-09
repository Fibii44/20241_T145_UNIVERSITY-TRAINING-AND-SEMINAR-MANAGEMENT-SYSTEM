const express = require('express');
const userNotification = express.Router();
const authenticateJWT = require('../../middleware/auth');
const userNewFeatureService = require('../../services/user/userNotificationService');

// List all notification
userNotification.get('/u/notification/items',authenticateJWT, userNewFeatureService.listItems);

// Update exisiting notification item details
userNotification.patch('/u/notification/update/:id', authenticateJWT, userNewFeatureService. updateNotificationStatus);

// Update exisiting notification item removestatus
userNotification.patch('/u/notification/remove/:id',authenticateJWT,  userNewFeatureService. removeNotification);


module.exports = userNotification;