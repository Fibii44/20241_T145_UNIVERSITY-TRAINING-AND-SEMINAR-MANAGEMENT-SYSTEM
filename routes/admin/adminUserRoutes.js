// routes/adminUserRoutes.js
const express = require('express');
const userRoutes = express.Router();
const adminService = require('../../services/admin/adminUserServices'); 

// Add Personnel Account Page
userRoutes.get('/a/personnel', adminService.renderPersonnelPage);

// Add Personnel Account
userRoutes.post('/a/personnel', adminService.addPersonnelAccount);

// User Table
userRoutes.get('/a/users', adminService.renderUserTable);

module.exports = userRoutes;
