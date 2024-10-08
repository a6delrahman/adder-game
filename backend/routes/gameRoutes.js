// routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Beispiel-API-Routen für Spielaktionen
router.post('/start', gameController.startGame);
router.post('/move', gameController.movePlayer);

module.exports = router;
