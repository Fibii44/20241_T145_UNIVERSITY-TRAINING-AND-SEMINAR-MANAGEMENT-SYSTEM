const express = require('express');
const adminReportRoutes = express.Router();
const adminService = require('../../services/admin/adminEventReportServices');
const authenticateJWT = require('../../middleware/auth');

adminReportRoutes.get('/a/event-history', authenticateJWT, adminService.renderEventHistory);
//GET all registered users in the specific eventId
adminReportRoutes.get('/a/event/registrations/:id', authenticateJWT, adminService.getRegisteredUsers);
//GET all submissions in a specific eventId
adminReportRoutes.get('/a/event/form-submissions/:id', authenticateJWT, adminService.formSubmissionsEvent);
adminReportRoutes.get('/a/event-registration-counts', authenticateJWT, adminService.getEventRegistrationCounts);

module.exports = adminReportRoutes;
