const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// API-Routen für Benutzeraktionen
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;