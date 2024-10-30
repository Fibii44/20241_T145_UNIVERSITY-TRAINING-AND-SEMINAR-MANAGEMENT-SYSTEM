// routes/user/userProfileRoutes.js
const express = require('express');
const userProfileRoutes = express.Router();
const userProfileService = require('../../services/user/userProfileService');

// User Profile Page
userProfileRoutes.get('/u/profile', userProfileService.renderProfilePage);

// Certificates
userProfileRoutes.get('/u/profile/certificates', userProfileService.listCertificates);
userProfileRoutes.get('/u/profile/certificates/:certificateID', userProfileService.viewCertificate);

//History
userProfileRoutes.get('/u/profile/history', userProfileService.renderHistoryPage)
userProfileRoutes.get('/u/profile/history/:eventID', userProfileService.viewEventHistory)

//Profile Events
userProfileRoutes.get('/u/profile/events', userProfileService.listProfileEvents)

module.exports = userProfileRoutes;
