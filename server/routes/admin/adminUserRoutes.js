const express = require('express');
const userRoutes = express.Router();
const adminService = require('../../services/admin/adminUserServices');
const authenticateJWT = require('../../middleware/auth');
const { verifyGeneralAdmin, verifyAdmins, concurrencyControl } = require('../../middleware/generalAdminMiddleware');

userRoutes.get('/a/personnel', authenticateJWT, verifyGeneralAdmin, adminService.renderPersonnelPage);
userRoutes.post('/a/personnel', authenticateJWT, verifyGeneralAdmin, concurrencyControl, adminService.upload.single('profilePicture'), adminService.addPersonnelAccount);
userRoutes.get('/a/users', authenticateJWT, verifyGeneralAdmin, adminService.renderUserTable);
userRoutes.get('/a/event-participants/', authenticateJWT, verifyGeneralAdmin, adminService.fetchEventParticipants);
userRoutes.put('/a/users/:id', adminService.editUser);
userRoutes.delete('/a/users/:id', adminService.deleteUser);


module.exports = userRoutes;
