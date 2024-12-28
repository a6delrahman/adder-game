// backend/controllers/webSocketController.js
// const sessionController = require('./sessionController');
const gameController = require('./gameController');
const {v4: uuidv4} = require('uuid');
const WebSocketManager = require('../managers/webSocketManager');
// const {saveFinalScore} = require("../models/ScoresModel");
const webSocketManager = WebSocketManager.getInstance();
// const clients = {};

function sendMessage(ws, type, payload = null) {
    const message = {type, payload};
    try {
        ws.send(JSON.stringify(message));
    } catch (error) {
        console.error(`Failed to send message of type "${type}":`, error);
    }
}

function handleConnection(ws) {
    // Generate a new clientId
    const clientId = uuidv4();
    // clients[clientId] = {ws};
    webSocketManager.addClient(clientId, ws);

    // Send back the client connection message
    webSocketManager.sendMessageToPlayerByClientId(clientId, 'connect', {clientId});
    // sendMessage(ws, 'connect', {clientId});
    // webSocketManager.addClient(clientId, ws);
    // webSocketManager.sendMessageToPlayerByClientId(clientId, 'connect', {clientId});
    console.log(`Client ${clientId} connected`);

    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            messageHandler(data, ws, clientId);
        } catch (error) {
            console.error(`Failed to parse message: ${message}`, error);
            sendMessage(ws, 'error', {message: 'Invalid message format'});
        }
    });

    // Handle connection close
    ws.on('close', () => {
        if (webSocketManager.isClientInAnySession(clientId)) {
            gameController.saveFinalStats(clientId).catch(e => console.error(e));
            gameController.leaveSession(clientId)
                .then(() => {
                    webSocketManager.removeClientFromAllSessions(clientId);
                    webSocketManager.removeClient(clientId);
                    // delete clients[clientId];
                    console.log(`Client ${clientId} disconnected`)
                })
                .catch((error) => {
                    console.error('Error leaving session:', error);
                    sendMessage(ws, 'error', {message: 'Failed to leave session'});
                });

        } else {
            webSocketManager.removeClient(clientId);
            // delete clients[clientId];
            console.log(`Client ${clientId} disconnected`);
        }
    });
}

function messageHandler(data, ws, clientId) {
    switch (data.type) {
        case 'change_direction':
            gameController.handleMovement(data.payload)
                .catch((error) => {
                    console.error('Error handling movement:', error);
                    sendMessage(ws, 'error', {message: 'Failed to handle movement'});
                });
            break;

        case 'join_session':
            data.clientId = clientId;
            gameController.joinSession(data, ws)
                .then((response) => {
                    sendMessage(ws, 'session_joined', response);
                    // clients[clientId].session = response.sessionId;
                    webSocketManager.addClientToSession(response.sessionId, clientId);
                })
                .catch((error) => {
                    console.error('Error joining session:', error);
                    sendMessage(ws, 'error', {message: 'Failed to join session'});
                });
            break;

        // case 'leave_session':
        //     gameController.leaveSession(clientId)
        //         .then(() => sendMessage(ws, 'session_left'))
        //         .catch((error) => {
        //             console.error('Error leaving session:', error);
        //             sendMessage(ws, 'error', {message: 'Failed to leave session'});
        //         });
        //     saveFinalScore(finalStats).then(r => console.log(r)).catch(e => console.error(e));
        //     break;

        default:
            console.warn(`Unknown message type: ${data.type}`);
            sendMessage(ws, 'error', {message: `Unknown message type: ${data.type}`});
    }
}

module.exports = {handleConnection};
