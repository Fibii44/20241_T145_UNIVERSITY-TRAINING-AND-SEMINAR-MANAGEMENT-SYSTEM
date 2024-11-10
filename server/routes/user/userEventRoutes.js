// routes/user/userEventRoutes.js
const express = require('express');
const userEventRoutes = express.Router();
const authenticateJWT = require('../../middleware/auth');
const userEventService = require('../../services/user/userEventService');

// Events Listing
userEventRoutes.get('/u/events', userEventService.listEvents);

// Open an Event by ID
userEventRoutes.get('/u/events/:id', userEventService.viewEvent);

// POST request for registration
userEventRoutes.post('/u/events', authenticateJWT, userEventService.registration);

userEventRoutes.get('/u/events/:id/check-registration', authenticateJWT, userEventService.checkRegistration);

// Calendar Page
userEventRoutes.get('/u/calendar', userEventService.renderCalendar);

// Add this new route for canceling registration
userEventRoutes.delete('/u/events/:id/cancellation', authenticateJWT, userEventService.cancelRegistration);

module.exports = userEventRoutes;
