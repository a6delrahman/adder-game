const webSocketService = require('../services/webSocketService');
const sessionController = require('./sessionController');
const gameController = require('./gameController');
const playerService = require('../services/playerService');
const sessionService = require('../services/sessionService');
const {v4: uuidv4} = require('uuid');
const clients = {};

function handleConnection(ws, wss) {
    const snakeId = uuidv4(); // Eindeutige ID für die Schlange generieren

    // playerService.addPlayer(snakeId, ws, null); // Spieler zur zentralen players-Map hinzufügen
    // Sende die zugewiesene Benutzer-ID an den Client
    // ws.send(JSON.stringify({type: 'snake_id', snakeId: snakeId}));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        // console.log('Received message:', data);
        // data.snakeId = snakeId;

        switch (data.type) {
            case 'change_direction':
                sessionService.handleMovement(data, ws);
                break;
            case 'create_session':
                sessionController.createSession(data, ws);
                break;
            case 'join_session': {
                sessionController.joinSession(data, ws);
                // playerService.addPlayer(ws, session.id, snakeId, data.userId); // Spieler zur Session hinzufügen
                // ws.send(JSON.stringify({type: 'snake_id', snakeId: snakeId}));
                // ws.send(JSON.stringify({type: 'session_joined', payload}));
                break;
            }
            case 'leave_session':
                sessionService.leaveSession(ws);
                break;
            default:
                console.log(`Unknown message type: ${data.type}`);
        }
    });

    ws.on('close', () => {
        sessionService.leaveSession(ws);
        // playerService.removePlayer(ws); // Spieler aus der zentralen players-Map entfernen
        // webSocketService.broadcastMessage(wss, JSON.stringify({type: 'remove_player', snakeId: snakeId}));
        console.log(`Snake ${snakeId} disconnected`);
    });

    //generate a new clientId
    const clientId = uuidv4();
    clients[clientId] = {
        "ws":  ws
    }

    const payLoad = {
        "type": "connect",
        "clientId": clientId
    }
    //send back the client connect
    ws.send(JSON.stringify(payLoad))
    console.log(`Client ${clientId} connected`)

}

module.exports = {handleConnection};
