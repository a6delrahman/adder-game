const webSocketService = require('../services/webSocketService');
const sessionController = require('./sessionController');
const gameController = require('./gameController');
const playerService = require('../services/playerService');
const sessionService = require('../services/sessionService');
const {v4: uuidv4} = require('uuid');
const clients = {};

function handleConnection(ws, req) {

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'change_direction':
                sessionService.handleMovement(data, ws);
                break;
            case 'create_session':
                sessionController.createSession(data, ws);
                break;
            case 'join_session': {
                sessionController.joinSession(data, ws);
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
        console.log(`Client ${clientId} disconnected`);
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
