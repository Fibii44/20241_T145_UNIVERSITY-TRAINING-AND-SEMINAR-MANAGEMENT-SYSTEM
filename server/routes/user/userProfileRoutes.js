// routes/user/userProfileRoutes.js
const express = require('express');
const userProfileRoutes = express.Router();
const authenticateJWT = require('../../middleware/auth');
const userProfileService = require('../../services/user/userProfileService');
const certificateService = require('../../services/user/certificateService');

// User Profile Page
userProfileRoutes.get('/u/profile', authenticateJWT, userProfileService.renderProfilePage);
userProfileRoutes.put('/u/profile', authenticateJWT, userProfileService.updateUserProfile);

// Certificates
userProfileRoutes.get('/u/certificates', authenticateJWT, certificateService.getUserCertificates);
userProfileRoutes.get('/u/certificates/:certificateID', authenticateJWT, userProfileService.viewCertificate);

//History
userProfileRoutes.get('/u/history', authenticateJWT, userProfileService.renderHistoryPage);
userProfileRoutes.get('/u/history/:eventId', authenticateJWT, userProfileService.viewEventHistory);

module.exports = userProfileRoutes;
