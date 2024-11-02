const express = require('express');
const passport = require('passport');
const authRoutes = express.Router();
const authService = require('../services/authServices');

//Google Login
authRoutes.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'], callbackURL: 'http://localhost:3000/auth/google/callback' }));
authRoutes.get('/auth/google/callback', authService.googleOAuthCallback); 

//Manual Login
authRoutes.post('/auth/login', authService.manualLogin);

module.exports = authRoutes;
