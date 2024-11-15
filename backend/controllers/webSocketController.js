const webSocketService = require('../services/webSocketService');
const sessionController = require('./sessionController');
const gameController = require('./gameController');
const playerService = require('../services/playerService');
const {v4: uuidv4} = require('uuid');

function handleConnection(ws, wss) {
    const userId = uuidv4();

    playerService.addPlayer(userId, ws, null); // Spieler zur zentralen players-Map hinzufügen
    // Sende die zugewiesene Benutzer-ID an den Client
    ws.send(JSON.stringify({type: 'user_id', userId}));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('Received message:', data);
        data.userId = userId;

        switch (data.type) {
            case 'change_direction':
                gameController.handleMovement(data, ws);
                break;
            case 'create_session':
                sessionController.createSession(data, ws);
                break;
            case 'join_session': {
                const session = sessionController.joinSession(data, ws);
                playerService.addPlayer(userId, ws, session.id); // Spieler zur Session hinzufügen
                // ws.send(JSON.stringify({type: 'user_id', userId}));
                break;
            }
            default:
                console.log(`Unknown message type: ${data.type}`);
        }
    });

    ws.on('close', () => {
        playerService.removePlayer(ws); // Spieler aus der zentralen players-Map entfernen
        webSocketService.broadcastMessage(wss, JSON.stringify({type: 'remove_player', userId}));
        console.log(`User ${userId} disconnected`);
    });
}

module.exports = {handleConnection};
