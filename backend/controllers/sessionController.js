// controllers/sessionController.js
const sessionService = require('../services/sessionService');
const {validate} = require("uuid");

/**
 * Handle player movement.
 * @param {Object} data - { targetX, targetY, boost }
 * @param {Object} ws - WebSocket reference
 * @returns {Promise<void>}
 */
async function handleMovement(data, ws) {
    const { targetX, targetY, boost } = data;

    if (typeof targetX !== 'number' || typeof targetY !== 'number' || typeof boost !== 'boolean') {
        throw new Error('Invalid data format for movement');
    }

    try {
        await sessionService.updatePlayerMovement(data, ws);
    } catch (err) {
        console.error('Error handling movement:', err);
        throw new Error('Failed to handle movement');
    }
}

/**
 * Add a player to an existing session.
 * @param {Object} data - { gameType, fieldOfView, userId }
 * @param {Object} ws - WebSocket reference
 * @returns {Promise<Object>} - { snakeId, initialGameState }
 */
async function joinSession(data, ws) {
    const { gameType, fieldOfView, userId } = data;

    if (!gameType || typeof fieldOfView !== 'number') {
        throw new Error('Invalid or missing required fields: gameType or fieldOfView');
    }

    try {
        return await sessionService.addPlayerToSession(gameType, ws, fieldOfView, userId);
    } catch (err) {
        console.error('Error joining session:', err);
        throw new Error('Failed to join session');
    }
}

exports.getSessions = async (ws) => {
    try {
        return await sessionService.getAllSessions();
    } catch (err) {
        console.error('Error getting sessions:', err);
        ws.send(JSON.stringify({ type: 'error', message: 'Failed to get sessions' }));
    }
}

exports.handleGameSessionBroadcast = async () => {
    try {
        sessionService.broadcastGameState();
    } catch (err) {
        console.error('Error broadcasting game sessions:', err);
    }
}

/**
 * Remove a player from a session.
 * @param {Object} ws - WebSocket reference
 * @returns {Promise<void>}
 */
async function leaveSession(ws) {
    try {
        await sessionService.removePlayerFromSession(ws);
    } catch (err) {
        console.error('Error leaving session:', err);
        throw new Error('Failed to leave session');
    }
}

module.exports = { joinSession, leaveSession, handleMovement};
