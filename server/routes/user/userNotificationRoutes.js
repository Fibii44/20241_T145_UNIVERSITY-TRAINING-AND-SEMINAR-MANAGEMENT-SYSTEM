const express = require('express');
const userNotification = express.Router();
const authenticateJWT = require('../../middleware/auth');
const userNewFeatureService = require('../../services/user/userNotificationService');

// List all notification
userNotification.get('/a/notification/items', userNewFeatureService.listItems);

// Create a new  notification item
userNotification.post('/a/notification/items',  userNewFeatureService.createItem);

// Update exisiting notification item details
userNotification.put('/a/notification/update/:id',  userNewFeatureService. updateNotificationStatus);

// Update exisiting notification item removestatus
userNotification.put('/a/notification/remove/:id',  userNewFeatureService. removeNotification);


module.exports = userNotification;