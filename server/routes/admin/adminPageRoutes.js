const express = require('express');
const pageRoutes = express.Router();
const adminService = require('../../services/admin/adminPageServices'); 
const authenticateJWT = require('../../middleware/auth');


// Dashboard
pageRoutes.get('/a/dashboard', adminService.renderDashboard);

// Calendar
pageRoutes.get('/a/calendar', adminService.renderCalendarPage);

//Activity Logs
pageRoutes.get('/a/activity-logs', authenticateJWT, adminService.getLogs);


module.exports = pageRoutes;
