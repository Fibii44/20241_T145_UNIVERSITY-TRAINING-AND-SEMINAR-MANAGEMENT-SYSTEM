// routes/adminEventRoutes.js
const express = require('express');
const eventRoutes = express.Router();
const adminService = require('../../services/admin/adminEventServices'); 

// Events Page
eventRoutes.get('/a/events', adminService.renderEventsPage);

// Add and Manage an Event
eventRoutes.post('/a/events', adminService.addEvent);

// View an Event by ID
eventRoutes.get('/a/events/:id', adminService.viewEventById);

module.exports = eventRoutes;
