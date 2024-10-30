const express = require('express');
const passport = require('passport');
const authRoutes = express.Router();
<<<<<<< HEAD
=======
const authenticateJWT = require('../middleware/auth');
>>>>>>> QA
const authService = require('../services/authServices');

authRoutes.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], callbackURL: 'http://localhost:3000/auth/google/callback' }));
authRoutes.get('/auth/google/callback', authService.googleOAuthCallback); 

<<<<<<< HEAD
=======
authRoutes.get('/protected-route', authenticateJWT, (req, res) => {
    res.send(`Hello, your role is: ${req.user.role}`);
  });

>>>>>>> QA
module.exports = authRoutes;
