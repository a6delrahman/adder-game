// controllers/webSocketController.js

const { v4: uuidv4 } = require('uuid'); // UUID-Bibliothek für eindeutige IDs
const players = new Map();
const SNAKE_SPEED = 2;
const FIELD_WIDTH = 800; // Spielfeldbreite
const FIELD_HEIGHT = 600; // Spielfeldhöhe
const SNAKE_INITIAL_LENGTH = 100;

function handleConnection(ws, wss) {
    // Generiere eine eindeutige User-ID für den neuen Client
    const userId = uuidv4();

    // Initialisiere die Spieler-Schlange
    const playerState = {
        id: userId,
        headPosition: { x: 100, y: 100 },
        targetPosition: { x: 100, y: 100 },
        boost: false,
        segments: Array.from({ length: SNAKE_INITIAL_LENGTH }, (_, i) => ({
            x: 100,
            y: 100 + i * 10,
        })),
        queuedSegments: 0,
    };

    players.set(ws, playerState);

    console.log(`New client connected: ${userId}`);
    console.log('Total clients connected:', wss.clients.size);
    console.log('Total players:', players.size);

    // Sende die zugewiesene Benutzer-ID an den Client
    ws.send(JSON.stringify({ type: 'user_id', userId }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            console.log('Received message:', data);


            if (data.type === 'change_direction') {
                playerState.targetPosition = { x: data.targetX, y: data.targetY };
                playerState.boost = data.boost || false; // Boost-Flag aktualisieren
            }
        } catch (err) {
            console.log('Error processing message:', err);
        }
    });

    ws.on('close', () => {
        players.delete(ws);

        // Sende Nachricht an alle Clients, dass dieser Spieler entfernt werden soll
        broadcastMessage(wss, JSON.stringify({ type: 'remove_player', userId }));
        console.log(`Client disconnected: ${userId}`);
    });
}

// Bewegungs- und Pfadberechnung der Spieler-Schlangen
function movePlayers() {
    players.forEach((playerState) => {
        const dx = playerState.targetPosition.x - playerState.headPosition.x;
        const dy = playerState.targetPosition.y - playerState.headPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Geschwindigkeit je nach Boost-Flag setzen
        const speed = playerState.boost ? SNAKE_SPEED*2 : SNAKE_SPEED;

        if (distance > 0) {
            const moveX = (dx / distance) * speed;
            const moveY = (dy / distance) * speed;

            playerState.headPosition.x += moveX;
            playerState.headPosition.y += moveY;

            playerState.headPosition.x = Math.max(0, Math.min(playerState.headPosition.x, FIELD_WIDTH));
            playerState.headPosition.y = Math.max(0, Math.min(playerState.headPosition.y, FIELD_HEIGHT));

            // Kopfpfad aktualisieren
            playerState.segments.unshift({...playerState.headPosition});

            // Entferne das letzte Segment, wenn die Schlange ihre Länge erreicht hat
            if (playerState.segments.length > SNAKE_INITIAL_LENGTH + playerState.queuedSegments) {
                playerState.segments.pop();
            }
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

// Sendet eine Nachricht an alle Clients
function broadcastMessage(wss, message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

module.exports = { handleConnection, movePlayers, broadcastPlayerPositions };
