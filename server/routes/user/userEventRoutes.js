// routes/user/userEventRoutes.js
const express = require('express');
const userEventRoutes = express.Router();
const userEventService = require('../../services/user/userEventService');

// Events Listing
userEventRoutes.get('/u/events', userEventService.listEvents);

// Open an Event by ID
userEventRoutes.get('/u/events/:id', userEventService.viewEvent);

// Registration and Attendance
userEventRoutes.post('/u/events/', userEventService.registerAndAttend);

// Calendar Page
userEventRoutes.get('/u/calendar', userEventService.renderCalendar);

module.exports = userEventRoutes;
