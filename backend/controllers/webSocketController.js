// controllers/webSocketController.js

const { v4: uuidv4 } = require('uuid'); // UUID-Bibliothek für eindeutige IDs
const players = new Map();
const SNAKE_SPEED = 1;
const FIELD_WIDTH = 800; // Spielfeldbreite
const FIELD_HEIGHT = 600; // Spielfeldhöhe

function handleConnection(ws, wss) {
    // Generiere eine eindeutige User-ID für den neuen Client
    const userId = uuidv4();

    const playerState = {
        position: { x: 5, y: 5 },
        velocity: SNAKE_SPEED,        // Bewegungsgeschwindigkeit
        angle: 0,
        queuedSections: 0,
        id: userId
    };

    players.set(ws, playerState);

    console.log('A new client connected');
    console.log('Total clients connected:', wss.clients.size);
    console.log('Total players:', players.size);

    // Sende die zugewiesene Benutzer-ID an den Client
    ws.send(JSON.stringify({ type: 'user_id', userId }));

    ws.on('message', (message) => {
        const messageString = message.toString('utf-8');
        try {
            const data = JSON.parse(messageString);
            console.log('Received message:', data);

            if (data.type === 'change_direction') {
                // Winkel basierend auf Client-Input ändern
                switch (data.direction) {
                    case 'up': playerState.angle = -90; break;
                    case 'down': playerState.angle = 90; break;
                    case 'left': playerState.angle = 180; break;
                    case 'right': playerState.angle = 0; break;
                    default: break;
                }
            }
        } catch (err) {
            console.log('Received non-JSON message:', messageString);
        }
    });

    ws.on('close', () => {
        players.delete(ws);
        broadcastPlayerPositions(wss);
        console.log('Client disconnected');
    });
}

// Bewegungsfunktion: Berechnet die neue Position basierend auf Winkel und Geschwindigkeit
function movePlayers() {
    players.forEach((playerState) => {
        const radians = (playerState.angle * Math.PI) / 180;
        const dx = Math.cos(radians) * playerState.velocity;
        const dy = Math.sin(radians) * playerState.velocity;

        playerState.position.x += dx;
        playerState.position.y += dy;

        // Spielfeldbegrenzungen
        if (playerState.position.x < 0) playerState.position.x = 0;
        if (playerState.position.y < 0) playerState.position.y = 0;
        if (playerState.position.x > FIELD_WIDTH) playerState.position.x = FIELD_WIDTH;
        if (playerState.position.y > FIELD_HEIGHT) playerState.position.y = FIELD_HEIGHT;
    });
}

// Senden der Positionen an alle Clients
function broadcastPlayerPositions(wss) {
    const allPlayerPositions = Array.from(players.values()).map(({ position, id }) => ({
        id,
        position
    }));
    const message = JSON.stringify({ type: 'update_position', players: allPlayerPositions });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

module.exports = { handleConnection, movePlayers, broadcastPlayerPositions };
