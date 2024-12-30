// controllers/gameController.js
const sessionController = require('./sessionController');
const {saveFinalScore} = require("../models/ScoresModel");
const safeExecute = require('../middleware/safeExecute');

/**
 * Handle player movement.
 * @param {Object} data - { snakeId, direction, boost }
 * @returns {Promise<void>}
 */
async function handleMovement(data) {
  const { snakeId, direction, boost } = data;

  if (!snakeId || typeof direction.x !== 'number' || typeof direction.y !== 'number' || typeof boost !== 'boolean') {
    throw new Error('Invalid data format for movement');
  }

  try {
    await sessionController.updatePlayerMovement(snakeId, direction, boost);
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
  const { gameType, fieldOfView, userId, clientId } = data;

  if (!gameType || typeof fieldOfView !== 'number' || !clientId) {
    throw new Error('Invalid or missing required fields: gameType or fieldOfView');
  }

  try {
    return await sessionController.addPlayerToSession(clientId, gameType, ws, fieldOfView, userId);
  } catch (err) {
    console.error('Error joining session:', err);
    throw new Error('Failed to join session');
  }
}

/**
 * Remove a player from a session.
 * @param {Object} clientId - Client ID
 * @returns {Promise<void>}
 */
async function leaveSession(clientId) {
  try {
    await sessionController.removePlayerFromSession(clientId);
    console.log('Player left session');
  } catch (err) {
    console.error('Error leaving session:', err);
    throw new Error('Failed to leave session');
  }
}

/**
 * Save the final stats for a player.
 * @param {Object} clientId - Client ID
 * @returns {Promise<void>}
 */
async function saveFinalStats(clientId) {
  try {
    await sessionController.saveFinalStats(clientId);
  } catch (err) {
    throw new Error('Failed to save final stats');
  }
}


module.exports = { joinSession, leaveSession, handleMovement, saveFinalStats};
