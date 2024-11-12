const express = require('express');
const passport = require('passport');
const authenticateJWT = require('../middleware/auth');
const authRoutes = express.Router();
const authService = require('../services/authServices');

//Google Login
authRoutes.get('/auth/google', passport.authenticate('google', { accessType: 'offline', prompt: 'consent', callbackURL: 'http://localhost:3000/auth/google/callback' }));
authRoutes.get('/auth/google/callback', authService.googleOAuthCallback); 

//Manual Login
authRoutes.post('/auth/login', authService.manualLogin);

authRoutes.post('/auth/logout', authService.logout);

authRoutes.post('/auth/change-password', authenticateJWT, authService.changePassword);


module.exports = authRoutes;
