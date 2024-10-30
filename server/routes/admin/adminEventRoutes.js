const express = require('express');
const eventRoutes = express.Router();
const adminService = require('../../services/admin/adminEventServices');

// Middleware for error handling
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
};

// Events Page - Render all events
eventRoutes.get('/a/events', adminService.renderEventsPage);

// Add a new event
eventRoutes.post('/a/events', adminService.addEvent);

// View a specific event by ID
eventRoutes.get('/a/events/:id', adminService.viewEventById);

// Update an existing event by ID (optional)
eventRoutes.put('/a/events/:id', adminService.updateEvent);

// Delete an event by ID (optional)
eventRoutes.delete('/a/events/:id', adminService.deleteEvent);

// Error handling middleware should be added after all routes
eventRoutes.use(errorHandler);

module.exports = eventRoutes;
