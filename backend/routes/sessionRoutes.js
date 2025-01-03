// routes/sessionRoutes.js
const express = require('express');
const sessionController = require('../controllers/sessionController');
const gameController = require('../controllers/gameController');
// const sessionService = require('../services/sessionService');
// const authService = require('../services/authService');
const router = express.Router();
const GameStateManager = require('../managers/gameStateManager');

const gameStateManager = GameStateManager.getInstance();

// Route zum Erstellen oder Beitreten einer Session
router.post('/join', gameController.joinSession);

// API: Alle Sessions abrufen
router.get('/sessions', (req, res) => {
    try {
        const sessions = Array.from(sessionController.getAllSessions().values());
        res.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ message: 'Error fetching sessions' });
    }
});

// API: Aktuelle Spieler und GameStates abrufen
router.get('/gamestates', (req, res) => {
    try {
        const gameStates = gameStateManager.getGameStates;
        if (!gameStates || typeof gameStates.entries !== 'function') {
            return res.status(500).json({ message: 'Invalid game states data' });
        }

        const statesArray = Array.from(gameStates.entries()).map(([id, state]) => ({
            sessionId: id,
            ...state,
        }));

        res.json(statesArray);
    } catch (error) {
        console.error('Error fetching game states:', error);
        res.status(500).json({ message: 'Error fetching game states' });
    }
});

// API: Alle Spieler abrufen
router.get('/players', (req, res) => {
    try {
        const gameStates = gameStateManager.getGameStates;
        if (!gameStates || typeof gameStates.forEach !== 'function') {
            return res.status(500).json({ message: 'Invalid game states data' });
        }

        const players = [];
        gameStates.forEach((state) => {
            if (state.players) {
                players.push(...Object.values(state.players));
            }
        });

        res.json(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ message: 'Error fetching players' });
    }
});

// API: Details einer spezifischen Session abrufen
router.get('/sessions/:sessionId', (req, res) => {
    const { sessionId } = req.params;

    try {
        const session = sessionController.getAllSessions().get(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const gameState = gameStateManager.getGameStates?.get(sessionId);

        res.json({
            sessionId,
            gameType: session.gameType,
            players: gameState?.players || {},
            food: gameState?.food || [],
            boundaries: gameState?.boundaries || {},
        });
    } catch (error) {
        console.error(`Error fetching session details for ${sessionId}:`, error);
        res.status(500).json({ message: `Error fetching session details for ${sessionId}` });
    }
});


module.exports = router;
