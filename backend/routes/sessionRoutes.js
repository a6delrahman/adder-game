// routes/sessionRoutes.js
const express = require('express');
const sessionController = require('../controllers/sessionController');
const gameController = require('../controllers/gameController');
// const sessionService = require('../services/sessionService');
// const authService = require('../services/authService');
const router = express.Router();

// Route zum Erstellen oder Beitreten einer Session
router.post('/join', gameController.joinSession);

// API: Alle Sessions abrufen
router.get('/sessions', (req, res) => {
    const sessions = Array.from(sessionController.getAllSessions().values());
    res.json(sessions);
});

// API: Aktuelle Spieler und GameStates abrufen
router.get('/gamestates', (req, res) => {
    const gameStates = Array.from(sessionController.gameStates.entries()).map(([id, state]) => ({
        sessionId: id,
        ...state
    }));
    res.json(gameStates);
});

// API: Alle Spieler abrufen
router.get('/players', (req, res) => {
    const players = [];
    sessionController.gameStates.forEach((state) => {
        players.push(...Object.values(state.players));
    });
    res.json(players);
});

// API: Details einer spezifischen Session abrufen
router.get('/sessions/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const session = sessionController.getAllSessions().get(sessionId);

    if (!session) {
        return res.status(404).json({ message: 'Session not found' });
    }

    const gameState = sessionController.gameStates.get(sessionId);

    res.json({
        sessionId,
        gameType: session.gameType,
        players: gameState?.players || {},
        food: gameState?.food || [],
        boundaries: gameState?.boundaries || {},
    });
});


module.exports = router;
