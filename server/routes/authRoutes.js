const express = require('express');
const passport = require('passport');
const authenticateJWT = require('../middleware/auth');
const authRoutes = express.Router();
const authService = require('../services/authServices');

//Google Login
authRoutes.get('/auth/google', authService.googleLogin);
authRoutes.get('/auth/google/callback', authService.googleOAuthCallback); 

//Manual Login
authRoutes.post('/auth/login', authService.manualLogin);

authRoutes.post('/auth/logout', authenticateJWT, authService.logout);

authRoutes.post('/auth/change-password', authenticateJWT, authService.changePassword);


module.exports = authRoutes;
