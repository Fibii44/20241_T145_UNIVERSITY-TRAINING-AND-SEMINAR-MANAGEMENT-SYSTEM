const express = require('express');
const userRoutes = express.Router();
const adminService = require('../../services/admin/adminUserServices');
const { verifyGeneralAdmin, concurrencyControl } = require('../../middleware/generalAdminMiddleware');
const authenticateJWT = require('../../middleware/auth');

userRoutes.get('/a/personnel', authenticateJWT, verifyGeneralAdmin, adminService.renderPersonnelPage);
userRoutes.post('/a/personnel', authenticateJWT, verifyGeneralAdmin, concurrencyControl, adminService.upload.single('profilePicture'), adminService.addPersonnelAccount);
userRoutes.get('/a/users', verifyGeneralAdmin, adminService.renderUserTable);

module.exports = userRoutes;
