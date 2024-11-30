const express = require('express');
const adminReportRoutes = express.Router();
const adminService = require('../../services/admin/adminEventReportServices');
const authenticateJWT = require('../../middleware/auth');

// GET request for registration
adminReportRoutes.get('/a/event/registrations', authenticateJWT, adminService.registration);
//GET all registered users in the specific eventId
adminReportRoutes.get('/a/event/registrations/:id', adminService.getRegisteredUsers);
module.exports = adminReportRoutes;
