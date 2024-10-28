const express = require('express');
const passport = require('passport');
const authRoutes = express.Router();
const authService = require('../services/authServices');

authRoutes.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], callbackURL: 'http://localhost:3000/auth/google/callback' }));
authRoutes.get('/auth/google/callback', authService.googleOAuthCallback); 

module.exports = authRoutes;
