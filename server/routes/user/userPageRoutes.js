
const express = require('express');
const userPageRoutes = express.Router();
const userPageService = require('../../services/user/userPageService');

// Home Page
userPageRoutes.get('/u/homepage', userPageService.renderHomePage);

// Login Page
userPageRoutes.get('/u/login', userPageService.renderLoginPage);

// Notification Page
userPageRoutes.get('/u/notifications', userPageService.renderNotification)

module.exports = userPageRoutes;
