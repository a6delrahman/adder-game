// controllers/webSocketController.js

const { v4: uuidv4 } = require('uuid'); // UUID-Bibliothek für eindeutige IDs
const players = new Map();
const SNAKE_SPEED = 10;
const FIELD_WIDTH = 800; // Spielfeldbreite
const FIELD_HEIGHT = 600; // Spielfeldhöhe
const SNAKE_INITIAL_LENGTH = 10;

function handleConnection(ws, wss) {
    // Generiere eine eindeutige User-ID für den neuen Client
    const userId = uuidv4();

    // Initialisiere die Spieler-Schlange
    const playerState = {
        id: userId,
        headPosition: { x: 5, y: 5 },
        angle: 0,
        velocity: SNAKE_SPEED,
        segments: Array.from({ length: SNAKE_INITIAL_LENGTH }, (_, i) => ({
            x: 5,
            y: 5 + i * 10
        })),
        queuedSegments: 0,
    };

    players.set(ws, playerState);

    console.log(`A new client connected: ${userId}`);
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

        // Sende Nachricht an alle Clients, dass dieser Spieler entfernt werden soll
        const removeMessage = JSON.stringify({ type: 'remove_player', userId: playerState.id });
        broadcastMessage(wss, removeMessage);

        console.log(`Client disconnected: ${playerState.id}`);
    });
}

// Bewegungs- und Pfadberechnung der Spieler-Schlangen
function movePlayers() {
    players.forEach((playerState) => {
        const radians = (playerState.angle * Math.PI) / 180;
        const dx = Math.cos(radians) * playerState.velocity;
        const dy = Math.sin(radians) * playerState.velocity;

        // Kopfposition aktualisieren
        playerState.headPosition.x += dx;
        playerState.headPosition.y += dy;

        // Spielfeldbegrenzungen
        if (playerState.headPosition.x < 0) playerState.headPosition.x = 0;
        if (playerState.headPosition.y < 0) playerState.headPosition.y = 0;
        if (playerState.headPosition.x > FIELD_WIDTH) playerState.headPosition.x = FIELD_WIDTH;
        if (playerState.headPosition.y > FIELD_HEIGHT) playerState.headPosition.y = FIELD_HEIGHT;

        // Kopfpfad aktualisieren
        playerState.segments.unshift({ ...playerState.headPosition });

        // Entferne das letzte Segment, wenn die Schlange ihre Länge erreicht hat
        if (playerState.segments.length > SNAKE_INITIAL_LENGTH + playerState.queuedSegments) {
            playerState.segments.pop();
        }
    });
}

// Senden der Positionen aller Spieler an alle Clients
function broadcastPlayerPositions(wss) {
    const allPlayerData = Array.from(players.values()).map(({ headPosition, segments, id }) => ({
        id,
        headPosition,
        segments, // Sendet die gesamte Segmentliste zur Client-Seite
    }));

    const message = JSON.stringify({ type: 'update_position', players: allPlayerData });

    broadcastMessage(wss, message);
}

// Senden der Positionen aller Spieler an alle Clients
function broadcastMessage(wss, message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}



module.exports = { handleConnection, movePlayers, broadcastPlayerPositions };
