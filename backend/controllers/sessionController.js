// controllers/sessionController.js
const sessionService = require('../services/sessionService');

exports.createSession = async (data, ws) => {
    const { gameType, userId } = data;
    try {
        sessionService.createOrFindSession(gameType, userId);
        ws.send(JSON.stringify({ type: 'session_created', sessionId: session.id }));
    } catch (err) {
        console.error('Error creating session:', err);
        ws.send(JSON.stringify({ type: 'error', message: 'Failed to create session' }));
    }
};

exports.joinSession = async (data, ws) => {
    const gameType = data.gameType;
    const fieldOfView = data.fieldOfView;
    const userId = data.userId;
    console.log('Received data in joinSession:', data);
    try {
        // sessionService.createOrFindSession(gameType, ws, userId);
        const session = sessionService.createOrFindSession(gameType);
        sessionService.addPlayerToSession(session, ws, fieldOfView, userId)
        // ws.send(JSON.stringify({ type: 'session_joined', sessionId: session.id }));
        // return session.id;
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
        sessionService.broadcastGameState();
    } catch (err) {
        console.error('Error broadcasting game sessions:', err);
    }
}
