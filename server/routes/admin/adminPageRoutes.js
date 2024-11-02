const express = require('express');
const pageRoutes = express.Router();
const adminService = require('../../services/admin/adminPageServices'); 


// Dashboard
pageRoutes.get('/a/dashboard', adminService.renderDashboard);

// Calendar
pageRoutes.get('/a/calendar', adminService.renderCalendarPage);



module.exports = pageRoutes;
