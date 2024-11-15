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

exports.joinSession = async (req, res) => {
    const { gameType, userId } = req.body;
    console.log('Received data in joinSession:', req.body);
    try {
        const session = await sessionService.createOrFindSession(gameType, userId);
        res.status(200).json({ sessionId: session.id });
    } catch (err) {
        console.error('Error joining session:', err);
        res.status(500).json({ message: 'Failed to join session' });
    }
};
