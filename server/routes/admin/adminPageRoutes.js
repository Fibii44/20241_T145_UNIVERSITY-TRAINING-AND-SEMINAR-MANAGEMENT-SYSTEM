const express = require('express');
const pageRoutes = express.Router();
const adminService = require('../../services/admin/adminPageServices'); 
const authenticateJWT = require('../../middleware/auth');
const { verifyGeneralAdmin } = require('../../middleware/generalAdminMiddleware');


// Dashboard
pageRoutes.get('/a/dashboard', adminService.renderDashboard);

// Calendar
pageRoutes.get('/a/calendar', adminService.renderCalendarPage);

//Activity Logs
pageRoutes.get('/a/activity-logs', authenticateJWT, verifyGeneralAdmin, adminService.getLogs);


module.exports = pageRoutes;
