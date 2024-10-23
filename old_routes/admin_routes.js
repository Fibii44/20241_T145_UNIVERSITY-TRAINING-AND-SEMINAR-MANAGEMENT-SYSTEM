const express = require('express');
const adminRoutes = express.Router();
const adminService = require('../services/adminServices'); // Importing service functions

// Landing Page
adminRoutes.get('/', adminService.renderLandingPage);

// Login Page
adminRoutes.get('/a/login', adminService.renderLoginPage);

// Dashboard
adminRoutes.get('/a/dashboard', adminService.renderDashboard);

// Calendar
adminRoutes.get('/a/calendar', adminService.renderCalendarPage);

// Events Page
adminRoutes.get('/a/events', adminService.renderEventsPage);

// Add and Manage an Event
adminRoutes.post('/a/events', adminService.addEvent);

// View an Event by ID
adminRoutes.get('/a/events/:id', adminService.viewEventById);

// Add Personnel Account Page
adminRoutes.get('/a/personnel', adminService.renderPersonnelPage);

// Add Personnel Account
adminRoutes.post('/a/personnel', adminService.addPersonnelAccount);

// User Table
adminRoutes.get('/a/users', adminService.renderUserTable);

// Admin Profile Page
adminRoutes.get('/a/profile', adminService.renderProfilePage);

// Recent Events or History of Events
adminRoutes.get('/a/history', adminService.renderEventHistory);

// Reports Generation for Each Event
adminRoutes.get('/a/history/:eventID', adminService.generateEventReport);

module.exports = adminRoutes;
