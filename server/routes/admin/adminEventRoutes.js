const express = require('express');
const eventRoutes = express.Router();
const adminService = require('../../services/admin/adminEventServices');
const authenticateJWT = require('../../middleware/auth');
const { checkLockStatus, canEditEvent, clearEventLock, concurrencyLock, clearConcurrencyLock } = require('../../middleware/adminEventsMiddleware');

// Check lock status for editing
eventRoutes.get('/a/events/:id/check-lock', checkLockStatus);

// Events Page - Render all events
eventRoutes.get('/a/events', adminService.renderEventsPage);

// Add a new event
eventRoutes.post('/a/events', authenticateJWT, concurrencyLock, adminService.upload.single('eventPicture'), adminService.addEvent, clearConcurrencyLock);
    
// Update an existing event by ID (optional)
eventRoutes.put('/a/events/:id', authenticateJWT, concurrencyLock, adminService.upload.single('eventPicture'), adminService.updateEvent, clearConcurrencyLock);

// Delete an event by ID (optional)
eventRoutes.delete('/a/events/:id', authenticateJWT, concurrencyLock, adminService.deleteEvent, clearConcurrencyLock);

eventRoutes.put('/a/events/:id/lock', authenticateJWT, concurrencyLock, (req, res) => {
    res.status(200).send({ message: "Event locked for editing" });
});
// Unlock an event after editing
eventRoutes.put('/a/events/:id/unlock', authenticateJWT, clearConcurrencyLock, (req, res) => {
    res.status(200).send({ message: "Event unlocked successfully" });
});

module.exports = eventRoutes;

