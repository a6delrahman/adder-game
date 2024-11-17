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
    const gameType = data.gameType;
    const userId = data.userId;
    console.log('Received data in joinSession:', data);
    try {
        const session = await sessionService.createOrFindSession(gameType, ws, userId);
        ws.send(JSON.stringify({ type: 'session_joined', sessionId: session.id }));
        return session.id;
    } catch (err) {
        console.error('Error joining session:', err);
        ws.send(JSON.stringify({ type: 'error', message: 'Failed to join session' }));
    }
};

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
        sessionService.handleGameSessionBroadcast();
    } catch (err) {
        console.error('Error broadcasting game sessions:', err);
    }
}
