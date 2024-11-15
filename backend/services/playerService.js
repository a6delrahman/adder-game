const players = new Map(); // Map zur Speicherung von Spielern
const SNAKE_SPEED = 2;
const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 600;
const SNAKE_INITIAL_LENGTH = 50;

function addPlayer(userId, ws, sessionId) {
    // Initialisiere die Spieler-Schlange
    const playerState = {
        userId: userId,
        headPosition: { x: 100, y: 100 },
        targetPosition: { x: 100, y: 100 },
        boost: false,
        segments: Array.from({ length: SNAKE_INITIAL_LENGTH }, (_, i) => ({
            x: 100,
            y: 100 + i * 10,
        })),
        queuedSegments: 0,
        sessionId: sessionId,
    };

    players.set(ws, playerState);
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

module.exports = { addPlayer, updatePlayerDirection, movePlayers, getPlayer, getPlayers, getSocketByUserId, removePlayer };
