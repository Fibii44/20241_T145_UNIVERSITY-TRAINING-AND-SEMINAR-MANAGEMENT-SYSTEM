const express = require('express');
const eventRoutes = express.Router();
const adminService = require('../../services/admin/adminEventServices');
const authenticateJWT = require('../../middleware/auth');
const { checkLockStatus, canEditEvent, clearEventLock, concurrencyLock, clearConcurrencyLock } = require('../../middleware/adminEventsMiddleware');


// SSE Endpoint
eventRoutes.get('/a/events/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Send headers immediately
  
    const sendUpdate = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
  
    req.app.locals.sseClients.push(sendUpdate);
  
    req.on('close', () => {
      req.app.locals.sseClients = req.app.locals.sseClients.filter(client => client !== sendUpdate);
    });
  });
  
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

// Lock an event
eventRoutes.put('/a/events/:id/lock', authenticateJWT, concurrencyLock, (req, res) => {
    const eventId = req.params.id;
    // Broadcast the lock status to all connected clients
    req.app.locals.sseClients.forEach(client => client({ eventId, isLocked: true }));
    res.status(200).send({ message: "Event locked for editing" });
  });
  
  // Unlock an event
  eventRoutes.put('/a/events/:id/unlock', authenticateJWT, clearConcurrencyLock, (req, res) => {
    const eventId = req.params.id;
    // Broadcast the unlock status to all connected clients
    req.app.locals.sseClients.forEach(client => client({ eventId, isLocked: false }));
    res.status(200).send({ message: "Event unlocked successfully" });
  });
module.exports = eventRoutes;

