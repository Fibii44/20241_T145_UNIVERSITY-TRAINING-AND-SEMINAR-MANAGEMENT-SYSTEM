
const express = require('express');
const userPageRoutes = express.Router();
const userPageService = require('../../services/user/userPageService');

// Home Page
userPageRoutes.get('/u/homepage', userPageService.renderHomePage);

// Notification Page
userPageRoutes.get('/u/notifications', userPageService.renderNotification)

module.exports = userPageRoutes;
