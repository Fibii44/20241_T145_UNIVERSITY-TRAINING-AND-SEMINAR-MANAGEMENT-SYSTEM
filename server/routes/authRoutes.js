const express = require('express');
const passport = require('passport');
const authRoutes = express.Router();
const authenticateJWT = require('../middleware/auth');
const authService = require('../services/authServices');
const { generateAuthUrl, setCredentials } = require('../services/admin/adminCalendarServices');
const router = express.Router();

//authRoutes.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], callbackURL: 'http://localhost:3000/auth/google/callback' }));


authRoutes.get('/protected-route', authenticateJWT, (req, res) => {
    res.send(`Hello, your role is: ${req.user.role}`);
  });

authRoutes.get('/auth/google', (req, res) => {
    const url = generateAuthUrl();
    res.redirect(url);
});

  
authRoutes.get('/auth/google/callback', async (req, res) => {
      try {
          const tokens = await setCredentials(req.query.code);
          console.log('Tokens:', tokens);
          return res.redirect('http://localhost:3000/');
      } catch (error) {
          console.error('Error retrieving access token:', error);
          res.status(500).send('Authentication failed! Please try again.');
      }
  });
  

module.exports = authRoutes;
