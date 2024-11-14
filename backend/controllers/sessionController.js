const sessionService = require('../services/sessionService');

function addPlayerToSession(userId, ws) {
    sessionService.addPlayer(userId, ws);
}

function removePlayerFromSession(userId) {
    sessionService.removePlayer(userId);
}

function createSession(data, ws) {
    sessionService.createSession(data, ws);
}

function joinSession(data, ws) {
    sessionService.joinSession(data, ws);
}

module.exports = { addPlayerToSession, removePlayerFromSession, createSession, joinSession };
