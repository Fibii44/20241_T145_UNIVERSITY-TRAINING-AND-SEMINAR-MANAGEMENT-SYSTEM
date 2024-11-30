const express = require('express');
const eventRoutes = express.Router();
const adminService = require('../../services/admin/adminEventServices');
const authenticateJWT = require('../../middleware/auth');
const sseService = require('../../utils/sse');
const lockingService = require('../../services/admin/eventLockService');
const { checkLockStatus, concurrencyLock, clearConcurrencyLock } = require('../../middleware/adminEventsMiddleware');


// SSE Endpoint
eventRoutes.get('/a/events/stream', sseService.setupSSE);
  
// Check lock status for editing
eventRoutes.get('/a/events/:id/check-lock', checkLockStatus);

// Events Page - Render all events
eventRoutes.get('/a/events', adminService.renderEventsPage);

// Add a new event
eventRoutes.post('/a/events', authenticateJWT, adminService.upload.fields([{ name: 'eventPicture', maxCount: 1 }, { name: 'certificateTemplate', maxCount: 1 }]), adminService.addEvent);  
    
// Update an existing event by ID (optional)
eventRoutes.put('/a/events/:id', authenticateJWT,  adminService.upload.fields([{ name: 'eventPicture', maxCount: 1 }, { name: 'certificateTemplate', maxCount: 1 }]), adminService.updateEvent);

// Delete an event by ID (optional)
eventRoutes.delete('/a/events/:id', authenticateJWT,  adminService.deleteEvent);

// Lock an event
eventRoutes.put('/a/events/:id/lock', authenticateJWT, concurrencyLock, lockingService.lockEvent);
  
// Unlock an event
eventRoutes.put('/a/events/:id/unlock', authenticateJWT, clearConcurrencyLock, lockingService.unlockEvent);

module.exports = eventRoutes;

