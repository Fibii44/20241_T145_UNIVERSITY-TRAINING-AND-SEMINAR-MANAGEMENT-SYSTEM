const express = require('express');
const userNotification = express.Router();
const authenticateJWT = require('../../middleware/auth');
const userNewFeatureService = require('../../services/user/userNotificationService');

// List all items
userNotification.get('/u/notification/items', userNewFeatureService.listItems);

// View a specific item by ID
userNotification.get('/u/notification/items/:id', userNewFeatureService.viewItem);

// Create a new item
userNotification.post('/u/notification/items',  userNewFeatureService.createItem);

// Update an existing item
userNotification.put('/u/notification/items/:id',  userNewFeatureService.updateItem);

// Delete an item
userNotification.delete('/u/notification/items/:id',  userNewFeatureService.deleteItem);

module.exports = userNotification;