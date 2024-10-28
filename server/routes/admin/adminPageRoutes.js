// routes/adminPageRoutes.js
const express = require('express');
const pageRoutes = express.Router();
const adminService = require('../../services/admin/adminPageServices'); 

// Landing Page
pageRoutes.get('/', adminService.renderLandingPage);

// Login Page
pageRoutes.get('/a/login', adminService.renderLoginPage);

// Dashboard
pageRoutes.get('/a/dashboard', adminService.renderDashboard);

// Calendar
pageRoutes.get('/a/calendar', adminService.renderCalendarPage);



module.exports = pageRoutes;
