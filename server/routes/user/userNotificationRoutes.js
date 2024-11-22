const express = require('express');
const userNotification = express.Router();
const authenticateJWT = require('../../middleware/auth');
const userNewFeatureService = require('../../services/user/userNotificationService');

// List all items
userNotification.get('/a/notification/items', userNewFeatureService.listItems);

// View a specific item by ID
userNotification.get('/a/notification/items/:id', userNewFeatureService.viewItem);

// Create a new item
userNotification.post('/a/notification/items',  userNewFeatureService.createItem);

// Update an existing item
userNotification.put('/a/notification/items/:id',  userNewFeatureService.updateItem);

// Delete an item
userNotification.delete('/a/notification/items/:id',  userNewFeatureService.deleteItem);

module.exports = userNotification;