// routes/user/userProfileRoutes.js
const express = require('express');
const userProfileRoutes = express.Router();
const userProfileService = require('../../services/user/userProfileService');
const authenticateJWT = require('../../middleware/auth'); 

// User Profile Page
userProfileRoutes.get('/u/profile',authenticateJWT, userProfileService.renderProfilePage);
userProfileRoutes.patch('/u/profile',authenticateJWT, userProfileService.updateUserProfile);

// Certificates
userProfileRoutes.get('/u/certificates', authenticateJWT, userProfileService.listCertificates);
userProfileRoutes.get('/u/certificates/:certificateID', authenticateJWT, userProfileService.viewCertificate);

//History
userProfileRoutes.get('/u/history', authenticateJWT, userProfileService.renderHistoryPage);


module.exports = userProfileRoutes;
