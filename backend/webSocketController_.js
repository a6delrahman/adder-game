// backend/controllers/webSocketController.js

const sessionController = require('./sessionController');
const sessionService = require('../services/sessionService');
const { v4: uuidv4 } = require('uuid');

const clients = {};

function sendMessage(ws, type, payload = null) {
    const message = { type, payload };
    try {
        ws.send(JSON.stringify(message));
    } catch (error) {
        console.error(`Failed to send message of type "${type}":`, error);
    }
}

function handleConnection(ws) {
    // Generate a new clientId
    const clientId = uuidv4();
    clients[clientId] = { ws };

    // Send back the client connection message
    sendMessage(ws, 'connect', { clientId });
    console.log(`Client ${clientId} connected`);

    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            messageHandler(data, ws, clientId);
        } catch (error) {
            console.error(`Failed to parse message: ${message}`, error);
            sendMessage(ws, 'error', { message: 'Invalid message format' });
        }
    });

    // Handle connection close
    ws.on('close', () => {
        sessionService.leaveSession(ws)
            .then(() => console.log(`Client ${clientId} disconnected`))
            .catch((error) => console.error('Error during session leave:', error));
        delete clients[clientId];
    });
}

function messageHandler(data, ws, clientId) {
    switch (data.type) {
        case 'change_direction':
            sessionService.handleMovement(data, ws)
                .catch((error) => {
                    console.error('Error handling movement:', error);
                    sendMessage(ws, 'error', { message: 'Failed to handle movement' });
                });
            break;

        case 'create_session':
            sessionController.createSession(data, ws)
                .then((response) => {
                    sendMessage(ws, 'session_created', response);
                })
                .catch((error) => {
                    console.error('Error creating session:', error);
                    sendMessage(ws, 'error', { message: 'Failed to create session' });
                });
            break;

        case 'join_session':
            sessionController.joinSession(data, ws)
                .then((response) => {
                    sendMessage(ws, 'session_joined', response);
                })
                .catch((error) => {
                    console.error('Error joining session:', error);
                    sendMessage(ws, 'error', { message: error.message });
                });
            break;

        case 'leave_session':
            sessionService.leaveSession(ws)
                .then(() => sendMessage(ws, 'session_left'))
                .catch((error) => {
                    console.error('Error leaving session:', error);
                    sendMessage(ws, 'error', { message: 'Failed to leave session' });
                });
            break;

        default:
            console.warn(`Unknown message type: ${data.type}`);
            sendMessage(ws, 'error', { message: `Unknown message type: ${data.type}` });
    }
}

module.exports = { handleConnection };
