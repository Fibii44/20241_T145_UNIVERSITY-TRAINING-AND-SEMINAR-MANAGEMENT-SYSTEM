// routes/adminReportRoutes.js
const express = require('express');
const reportRoutes = express.Router();
const adminService = require('../../services/admin/adminReportServices'); 

// Recent Events or History of Events
reportRoutes.get('/a/history', adminService.renderEventHistory);

// Reports Generation for Each Event
reportRoutes.get('/a/history/:eventID', adminService.generateEventReport);

module.exports = reportRoutes;
