const express = require('express');
const adminReportRoutes = express.Router();
const adminService = require('../../services/admin/adminEventReportServices');
const authenticateJWT = require('../../middleware/auth');

// GET request for registration
adminReportRoutes.get('/a/event/registrations', authenticateJWT, adminService.registration);
//GET all registered users in the specific eventId
adminReportRoutes.get('/a/event/registrations/:id', adminService.getRegisteredUsers);
//GET all submitted forms
adminReportRoutes.get('/a/event/form-submissions', adminService.formSubmissions);
//GET all submissions in a specific eventId
adminReportRoutes.get('/a/event/form-submissions/:id', adminService.formSubmissionsEvent);
module.exports = adminReportRoutes;
