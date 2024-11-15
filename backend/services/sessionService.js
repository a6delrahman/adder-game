// services/sessionService.js
const sessions = new Map();
const { v4: uuidv4 } = require('uuid');

function createOrFindSession(gameType, userId) {
    let session = Array.from(sessions.values()).find(
        (sess) => sess.gameType === gameType && sess.players.length < sess.maxPlayers
    );

    if (!session) {
        session = {
            id: uuidv4(),
            gameType,
            players: [],
            maxPlayers: 4
        };
        sessions.set(session.id, session);
    }

    if (!session.players.includes(userId)) {
        session.players.push(userId);
    }

    return session;
}

function getSession(sessionId) {
    return sessions.get(sessionId);
}

function removePlayerFromSession(sessionId, userId) {
    const session = sessions.get(sessionId);
    if (session) {
        session.players = session.players.filter((id) => id !== userId);
        if (session.players.length === 0) {
            sessions.delete(sessionId); // Löscht leere Sessions
        }
    }
}

module.exports = { createOrFindSession, getSession, removePlayerFromSession };
