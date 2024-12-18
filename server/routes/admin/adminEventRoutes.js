const express = require('express');
const eventRoutes = express.Router();
const adminService = require('../../services/admin/adminEventServices');
const authenticateJWT = require('../../middleware/auth');
const sseService = require('../../utils/sse');
const lockingService = require('../../services/admin/eventLockService');
const { canEditEvent, concurrencyLock, clearConcurrencyLock } = require('../../middleware/adminEventsMiddleware');


// SSE Endpoint
eventRoutes.get('/a/events/stream', sseService.setupSSE);

// Events Page - Render all events
eventRoutes.get('/a/events', adminService.renderEventsPage);
// Get all active events
eventRoutes.get('/a/active-events', authenticateJWT, adminService.renderActiveEventsPage);

// Get Specific Event
eventRoutes.get('/a/events/:id', adminService.getSpecificEvent );
// Add a new event
eventRoutes.post('/a/events', authenticateJWT, adminService.upload.single('eventPicture'), adminService.addEvent);  
    
// Update an existing event by ID (optional)
eventRoutes.put('/a/events/:id', authenticateJWT,  adminService.upload.single('eventPicture'), adminService.updateEvent);

// Delete an event by ID (optional)
eventRoutes.delete('/a/events/:id', authenticateJWT,  adminService.deleteEvent);

// Lock an event
eventRoutes.put('/a/events/:id/lock', authenticateJWT, canEditEvent, concurrencyLock, lockingService.lockEvent);
  
// Unlock an event
eventRoutes.put('/a/events/:id/unlock', authenticateJWT, clearConcurrencyLock, lockingService.unlockEvent);

module.exports = eventRoutes;

