const express = require('express');
const eventRoutes = express.Router();
const adminService = require('../../services/admin/adminEventServices');
const authenticateJWT = require('../../middleware/auth');
const sseService = require('../../utils/sse');
const lockingService = require('../../services/admin/eventLockService');
const { checkLockStatus, canEditEvent, clearEventLock, concurrencyLock, clearConcurrencyLock } = require('../../middleware/adminEventsMiddleware');


// SSE Endpoint
eventRoutes.get('/a/events/stream', sseService.setupSSE);
  
// Check lock status for editing
eventRoutes.get('/a/events/:id/check-lock', checkLockStatus);

// Events Page - Render all events
eventRoutes.get('/a/events', adminService.renderEventsPage);

// Add a new event
eventRoutes.post('/a/events', authenticateJWT, adminService.upload.single('eventPicture'), adminService.addEvent);  
    
// Update an existing event by ID (optional)
eventRoutes.put('/a/events/:id', authenticateJWT, concurrencyLock, adminService.upload.single('eventPicture'), adminService.updateEvent, clearConcurrencyLock);

// Delete an event by ID (optional)
eventRoutes.delete('/a/events/:id', authenticateJWT, concurrencyLock, adminService.deleteEvent, clearConcurrencyLock);

// Lock an event
eventRoutes.put('/a/events/:id/lock', authenticateJWT, lockingService.lockEvent);
  
// Unlock an event
eventRoutes.put('/a/events/:id/unlock', authenticateJWT, lockingService.unlockEvent);

module.exports = eventRoutes;

