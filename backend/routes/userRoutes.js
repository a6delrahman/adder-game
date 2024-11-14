// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const authService = require('../services/authService');

const router = express.Router();

router.get('/me', authService.authMiddleware, userController.getUserProfile);
router.put('/update-email', authService.authMiddleware, userController.updateEmail);
router.put('/update-password', authService.authMiddleware, userController.updatePassword);
router.put('/update-username', authService.authMiddleware, userController.updateUsername);
router.delete('/delete', authService.authMiddleware, userController.deleteUser);

module.exports = router;
