const { v4: uuidv4 } = require('uuid');
const players = new Map(); // Map zur Speicherung von Spielern
const SNAKE_SPEED = 2;
const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 600;
const SNAKE_INITIAL_LENGTH = 50;

function addPlayer(ws, sessionId, userId = null) {
    const snakeId = uuidv4(); // Eindeutige ID für die Schlange
    // Initialisiere die Spieler-Schlange
    const playerState = {
        snakeId,
        sessionId,
        userId,
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
    return snakeId; // Rückgabe der SnakeId
}

// function addPlayer(userId, ws, sessionId) {
//     players.set(ws, { userId, sessionId, targetPosition: null, boost: false });
// }

function updatePlayerDirection(data, ws) {
    const playerState = players.get(ws);
    if (playerState) {
        playerState.targetPosition = { x: data.targetX, y: data.targetY };
        playerState.boost = data.boost || false;
    }
}

function movePlayers() {
    players.forEach((playerState) => {
        const dx = playerState.targetPosition.x - playerState.headPosition.x;
        const dy = playerState.targetPosition.y - playerState.headPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = playerState.boost ? SNAKE_SPEED * 2 : SNAKE_SPEED;

        if (distance > 0) {
            playerState.headPosition.x += (dx / distance) * speed;
            playerState.headPosition.y += (dy / distance) * speed;
            playerState.headPosition.x = Math.max(0, Math.min(playerState.headPosition.x, FIELD_WIDTH));
            playerState.headPosition.y = Math.max(0, Math.min(playerState.headPosition.y, FIELD_HEIGHT));
            playerState.segments.unshift({ ...playerState.headPosition });
            if (playerState.segments.length > SNAKE_INITIAL_LENGTH + playerState.queuedSegments) {
                playerState.segments.pop();
            }
        }
    });
}

function getPlayer(userId) {
    return Array.from(players.values()).find((player) => player.userId === userId);
}

// Neue Funktion, um die aktuelle Spieler-Map zurückzugeben
function getPlayers() {
    return players;
}

function getPlayerBySocket(ws) {
    return players.get(ws);
}

// Filtert Spieler nach Session
function getPlayersInSession(sessionId) {
    return Array.from(players.values()).filter(player => player.sessionId === sessionId);
}

function getPlayerBySnakeId(snakeId) {
    return Array.from(players.values()).find((player) => player.snakeId === snakeId);
}


function getSocketByUserId(userId) {
    for (const [socket, player] of players.entries()) {
        if (player.userId === userId) {
            return socket;
        }
    }
    return null;
}


// Entfernt einen Spieler aus der players-Map
function removePlayer(ws) {
    const player = players.get(ws);
    if (player) {
        players.delete(ws);
    }
}

function broadcastPlayerPositions(sessionId, wss) {
    const playersInSession = getPlayersInSession(sessionId);

    const allPlayerData = playersInSession.map(({ headPosition, segments, id }) => ({
        id,
        headPosition,
        segments,
    }));

    const message = JSON.stringify({ type: 'update_position', players: allPlayerData });

    // Nur Clients in derselben Session benachrichtigen
    for (const [ws, player] of players.entries()) {
        if (player.sessionId === sessionId && ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    }
}

function broadcastToSession(sessionId, wss, message) {
    const sessionPlayers = getPlayersInSession(sessionId);
    sessionPlayers.forEach((player) => {
        const socket = getSocketBySnakeId(player.snakeId);
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    });
}


module.exports = { getPlayerBySocket, getPlayerBySnakeId, broadcastPlayerPositions, addPlayer, updatePlayerDirection, movePlayers, getPlayer, getPlayers, getPlayersInSession, getSocketByUserId, removePlayer };
