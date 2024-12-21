// SessionController.js
const sessionService = require('../services/sessionService');

/**
 * Create or find a session based on gameType and userId.
 * @param {Object} data - { gameType, userId }
 * @returns {Promise<Object>} - { sessionId }
 */
async function createSession(data) {
    const { gameType, userId } = data;

    if (!gameType || !userId) {
        throw new Error('Missing required fields: gameType or userId');
    }

    try {
        const session = await sessionService.createOrFindSession(gameType, userId);
        return { sessionId: session.id };
    } catch (err) {
        console.error('Error creating session:', err);
        throw new Error('Failed to create session');
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

    if (!gameType || typeof fieldOfView !== 'number' || !userId) {
        throw new Error('Invalid or missing required fields: gameType, fieldOfView, or userId');
    }

    try {
        return await sessionService.addPlayerToSession(gameType, ws, fieldOfView, userId);
    } catch (err) {
        console.error('Error joining session:', err);
        throw new Error('Failed to join session');
    }
}

/**
 * Retrieve all sessions.
 * @returns {Promise<Array>} - List of sessions.
 */
async function getSessions() {
    try {
        return await sessionService.getAllSessions();
    } catch (err) {
        console.error('Error retrieving sessions:', err);
        throw new Error('Failed to retrieve sessions');
    }
}

/**
 * Broadcast the game state to all connected players.
 */
async function handleGameSessionBroadcast() {
    try {
        await sessionService.broadcastGameState();
    } catch (err) {
        console.error('Error broadcasting game sessions:', err);
        throw new Error('Failed to broadcast game state');
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

module.exports = {
    createSession,
    joinSession,
    getSessions,
    handleGameSessionBroadcast,
    leaveSession,
};
