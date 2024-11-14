const players = new Map(); // Map zur Speicherung von Spielern
const SNAKE_SPEED = 2;
const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 600;
const SNAKE_INITIAL_LENGTH = 50;

function addPlayer(userId, ws) {
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
}

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

// Neue Funktion, um die aktuelle Spieler-Map zurückzugeben
function getPlayers() {
    return players;
}

// function removePlayer(userId) {
//     for (const [ws, player] of players) {
//         if (player.id === userId) {
//             players.delete(ws);
//             break;
//         }
//     }
// }

// Entfernt einen Spieler aus der players-Map
function removePlayer(ws) {
    players.delete(ws);
}

module.exports = { addPlayer, updatePlayerDirection, movePlayers, getPlayers, removePlayer };
