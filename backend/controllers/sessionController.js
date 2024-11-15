// controllers/sessionController.js
const sessionService = require('../services/sessionService');

exports.createSession = async (data, ws) => {
    const { gameType, userId } = data;
    try {
        const session = await sessionService.createOrFindSession(gameType, userId);
        ws.send(JSON.stringify({ type: 'session_created', sessionId: session.id }));
    } catch (err) {
        console.error('Error creating session:', err);
        ws.send(JSON.stringify({ type: 'error', message: 'Failed to create session' }));
    }
};

exports.joinSession = async (data, ws) => {
    const { gameType, userId } = data;
    try {
        const session = await sessionService.createOrFindSession(gameType, userId);
        ws.send(JSON.stringify({ type: 'session_joined', sessionId: session.id }));
    } catch (err) {
        console.error('Error joining session:', err);
        ws.send(JSON.stringify({ type: 'error', message: 'Failed to join session' }));
    }
};
