// routes/sessionRoutes.js
const express = require('express');
const sessionController = require('../controllers/sessionController');
const authService = require('../services/authService');
const router = express.Router();

// Route zum Erstellen oder Beitreten einer Session
router.post('/join', sessionController.joinSession);

module.exports = router;
